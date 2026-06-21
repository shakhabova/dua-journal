import { Injectable, inject, signal } from '@angular/core';
import type { Dua, UserDua } from '../models/dua.model';
import { EncryptionService } from './encryption.service';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root',
})
export class DuaService {
    private supabaseService = inject(SupabaseService);
    private encryptionService = inject(EncryptionService);
    public userDuasTrigger = signal<number>(0);

    /**
     * Shared fetching logic to be used by components with the Resource API.
     */
    async getUserDuas(): Promise<UserDua[]> {
        const user = this.supabaseService.user();
        if (!user) return [];

        const { data, error } = await this.supabaseService.supabase
            .from('user_duas_v2')
            .select('*');

        if (error) {
            console.error('Error fetching user duas:', error);
            throw error;
        }

        // Fetch library duas to resolve textAr, transcription, reference by originalDuaId
        let libraryMap = new Map<string, Dua>();
        try {
            const libraryDuas = await this.getLibraryDuas();
            libraryMap = new Map(libraryDuas.map((d) => [d.id, d]));
        } catch (libErr) {
            console.error('Failed to load library duas for joining:', libErr);
        }

        const decodedDuas: UserDua[] = [];

        for (const item of data || []) {
            try {
                let parsed: any = {};
                const encryptedData = (item as any).data;

                if (encryptedData) {
                    const decryptedJson =
                        await this.encryptionService.decrypt(encryptedData);
                    parsed = JSON.parse(decryptedJson);
                } else {
                    // Fallback to legacy fields if data column is missing or empty
                    parsed = {
                        id: item.id,
                        category: (item as any).category || undefined,
                        text: (item as any).text
                            ? await this.encryptionService.decrypt(
                                  (item as any).text,
                              )
                            : '',
                        dateAdded: (item as any).date_added
                            ? new Date((item as any).date_added).toISOString()
                            : new Date().toISOString(),
                        answeredAt: (item as any).answered_at
                            ? new Date((item as any).answered_at).toISOString()
                            : undefined,
                        answerNote: (item as any).answer_note
                            ? await this.encryptionService.decrypt(
                                  (item as any).answer_note,
                              )
                            : undefined,
                        isAnswered: (item as any).is_answered || false,
                        isCustom: (item as any).is_custom !== false,
                        originalDuaId:
                            (item as any).original_dua_id || undefined,
                    };
                }

                const originalDuaId = parsed.originalDuaId || undefined;
                const libDua = originalDuaId
                    ? libraryMap.get(originalDuaId)
                    : undefined;

                decodedDuas.push({
                    id: item.id,
                    category: parsed.category || undefined,
                    text: parsed.text || '',
                    textAr: libDua?.textAr || undefined,
                    transcription: libDua?.transcription || undefined,
                    reference: libDua?.reference || undefined,
                    dateAdded: parsed.dateAdded
                        ? new Date(parsed.dateAdded)
                        : new Date(),
                    answeredAt: parsed.answeredAt
                        ? new Date(parsed.answeredAt)
                        : undefined,
                    answerNote: parsed.answerNote || undefined,
                    isAnswered: !!parsed.isAnswered,
                    isCustom: parsed.isCustom !== false,
                    originalDuaId: originalDuaId,
                });
            } catch (err) {
                console.error('Error decoding user dua item:', item.id, err);
            }
        }

        // Sort by dateAdded descending
        decodedDuas.sort(
            (a, b) => b.dateAdded.getTime() - a.dateAdded.getTime(),
        );

        return decodedDuas;
    }

    async getLibraryDuas(): Promise<Dua[]> {
        const { data, error } = await this.supabaseService.supabase
            .from('library_duas')
            .select('*');

        if (error) {
            console.error('Error fetching library duas:', error);
            throw error;
        }

        return (data || []).map((item) => ({
            id: item.id,
            source: item.source as 'Quran' | 'Sunnah',
            textRu: item.text_ru,
            textAr: item.text_ar || undefined,
            transcription: item.transcription || undefined,
            reference: item.reference || undefined,
        }));
    }

    async addUserDua(
        text: string,
        category: string = '',
        originalDuaId?: string,
    ) {
        const user = this.supabaseService.user();
        if (!user) return;

        const newDuaId = `u${Date.now().toString()}`;
        const dateAdded = new Date();

        // Create a JSON with all fields (excluding user_id, textAr, transcription, reference)
        const duaData = {
            id: newDuaId,
            category: category || '',
            text: text,
            dateAdded: dateAdded.toISOString(),
            isAnswered: false,
            isCustom: !originalDuaId,
            originalDuaId: originalDuaId || null,
        };

        // Encrypt the JSON string
        const encryptedData = await this.encryptionService.encrypt(
            JSON.stringify(duaData),
        );

        const { error } = await this.supabaseService.supabase
            .from('user_duas_v2')
            .insert({
                id: newDuaId,
                user_id: user.id,
                data: encryptedData,
            });

        if (error) {
            console.error('Error saving dua to database:', error);
        } else {
            this.userDuasTrigger.update((n) => n + 1);
        }
    }

    async markAsAnswered(
        id: string,
        callTrigger = true,
        errorCallback = () => {},
    ) {
        const user = this.supabaseService.user();
        if (!user) return;

        // Fetch the existing user dua data
        const { data: existingData, error: fetchError } =
            await this.supabaseService.supabase
                .from('user_duas_v2')
                .select('data')
                .eq('id', id)
                .single();

        if (fetchError || !existingData) {
            console.error(
                'Error fetching dua to mark as answered:',
                fetchError,
            );
            errorCallback();
            return;
        }

        try {
            const decryptedJson = await this.encryptionService.decrypt(
                existingData.data,
            );
            const parsed = JSON.parse(decryptedJson);

            parsed.isAnswered = true;
            parsed.answeredAt = new Date().toISOString();

            const encryptedData = await this.encryptionService.encrypt(
                JSON.stringify(parsed),
            );

            const { error } = await this.supabaseService.supabase
                .from('user_duas_v2')
                .update({
                    data: encryptedData,
                })
                .eq('id', id);

            if (error) {
                console.error('Error marking dua as answered:', error);
                errorCallback();
            } else {
                if (callTrigger) {
                    this.userDuasTrigger.update((n) => n + 1);
                }
            }
        } catch (err) {
            console.error('Error processing markAsAnswered:', err);
            errorCallback();
        }
    }

    async unmarkAsAnswered(id: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        // Fetch the existing user dua data
        const { data: existingData, error: fetchError } =
            await this.supabaseService.supabase
                .from('user_duas_v2')
                .select('data')
                .eq('id', id)
                .single();

        if (fetchError || !existingData) {
            console.error(
                'Error fetching dua to unmark as answered:',
                fetchError,
            );
            return;
        }

        try {
            const decryptedJson = await this.encryptionService.decrypt(
                existingData.data,
            );
            const parsed = JSON.parse(decryptedJson);

            parsed.isAnswered = false;
            parsed.answeredAt = undefined;

            const encryptedData = await this.encryptionService.encrypt(
                JSON.stringify(parsed),
            );

            const { error } = await this.supabaseService.supabase
                .from('user_duas_v2')
                .update({
                    data: encryptedData,
                })
                .eq('id', id);

            if (error) {
                console.error('Error unmarking dua as answered:', error);
            } else {
                this.userDuasTrigger.update((n) => n + 1);
            }
        } catch (err) {
            console.error('Error processing unmarkAsAnswered:', err);
        }
    }

    async updateUserDua(id: string, text: string, category: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        // Fetch the existing user dua data
        const { data: existingData, error: fetchError } =
            await this.supabaseService.supabase
                .from('user_duas_v2')
                .select('data')
                .eq('id', id)
                .single();

        if (fetchError || !existingData) {
            console.error('Error fetching dua to update:', fetchError);
            return;
        }

        try {
            const decryptedJson = await this.encryptionService.decrypt(
                existingData.data,
            );
            const parsed = JSON.parse(decryptedJson);

            parsed.text = text;
            parsed.category = category;

            const encryptedData = await this.encryptionService.encrypt(
                JSON.stringify(parsed),
            );

            const { error } = await this.supabaseService.supabase
                .from('user_duas_v2')
                .update({
                    data: encryptedData,
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating dua:', error);
            } else {
                this.userDuasTrigger.update((n) => n + 1);
            }
        } catch (err) {
            console.error('Error processing updateUserDua:', err);
        }
    }

    async updateAnswerNote(id: string, answerNote: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        // Fetch the existing user dua data
        const { data: existingData, error: fetchError } =
            await this.supabaseService.supabase
                .from('user_duas_v2')
                .select('data')
                .eq('id', id)
                .single();

        if (fetchError || !existingData) {
            console.error(
                'Error fetching dua to update answer note:',
                fetchError,
            );
            return;
        }

        try {
            const decryptedJson = await this.encryptionService.decrypt(
                existingData.data,
            );
            const parsed = JSON.parse(decryptedJson);

            parsed.answerNote = answerNote;

            const encryptedData = await this.encryptionService.encrypt(
                JSON.stringify(parsed),
            );

            const { error } = await this.supabaseService.supabase
                .from('user_duas_v2')
                .update({
                    data: encryptedData,
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating answer note:', error);
            }
        } catch (err) {
            console.error('Error processing updateAnswerNote:', err);
        }
    }

    async deleteUserDua(id: string, callTrigger = true) {
        const user = this.supabaseService.user();
        if (!user) return;

        const { error } = await this.supabaseService.supabase
            .from('user_duas_v2')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting dua:', error);
        } else {
            if (callTrigger) {
                this.userDuasTrigger.update((n) => n + 1);
            }
        }
    }
}
