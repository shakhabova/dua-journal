import { Injectable, inject, signal } from '@angular/core';
import type { Dua, UserDua } from '../models/dua.model';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root',
})
export class DuaService {
    private supabaseService = inject(SupabaseService);
    public userDuasTrigger = signal<number>(0);

    /**
     * Shared fetching logic to be used by components with the Resource API.
     */
    async getUserDuas(): Promise<UserDua[]> {
        const user = this.supabaseService.user();
        if (!user) return [];

        const { data, error } = await this.supabaseService.supabase
            .from('user_duas')
            .select('*')
            .order('date_added', { ascending: false });

        if (error) {
            console.error('Error fetching user duas:', error);
            throw error;
        }

        return (data || []).map((item) => ({
            id: item.id,
            category: item.category || undefined,
            text: item.text,
            textAr: item.text_ar || undefined,
            transcription: item.transcription || undefined,
            reference: item.reference || undefined,
            dateAdded: new Date(item.date_added),
            answeredAt: item.answered_at
                ? new Date(item.answered_at)
                : undefined,
            answerNote: item.answer_note || undefined,
            isAnswered: item.is_answered,
            isCustom: item.is_custom,
            originalDuaId: item.original_dua_id || undefined,
        }));
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
        sourceDetails?: Pick<Dua, 'textAr' | 'transcription' | 'reference'>,
    ) {
        const user = this.supabaseService.user();
        if (!user) return;

        const newDuaId = `u${Date.now().toString()}`;
        const dateAdded = new Date();

        const { error } = await this.supabaseService.supabase
            .from('user_duas')
            .insert({
                id: newDuaId,
                user_id: user.id,
                category: category || '',
                text: text,
                text_ar: sourceDetails?.textAr || null,
                transcription: sourceDetails?.transcription || null,
                reference: sourceDetails?.reference || null,
                date_added: dateAdded.toISOString(),
                is_answered: false,
                is_custom: true,
                original_dua_id: originalDuaId || null,
            });

        if (error) {
            console.error('Error saving dua to database:', error);
        } else {
            this.userDuasTrigger.update((n) => n + 1);
        }
    }

    async markAsAnswered(id: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        const answeredAt = new Date();

        const { error } = await this.supabaseService.supabase
            .from('user_duas')
            .update({
                is_answered: true,
                answered_at: answeredAt.toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('Error marking dua as answered:', error);
        } else {
            this.userDuasTrigger.update((n) => n + 1);
        }
    }

    async unmarkAsAnswered(id: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        const { error } = await this.supabaseService.supabase
            .from('user_duas')
            .update({
                is_answered: false,
                answered_at: null,
            })
            .eq('id', id);

        if (error) {
            console.error('Error unmarking dua as answered:', error);
        } else {
            this.userDuasTrigger.update((n) => n + 1);
        }
    }

    async updateUserDua(id: string, text: string, category: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        const { error } = await this.supabaseService.supabase
            .from('user_duas')
            .update({ text, category })
            .eq('id', id);

        if (error) {
            console.error('Error updating dua:', error);
        } else {
            this.userDuasTrigger.update((n) => n + 1);
        }
    }

    async updateAnswerNote(id: string, answerNote: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        const { error } = await this.supabaseService.supabase
            .from('user_duas')
            .update({ answer_note: answerNote })
            .eq('id', id);

        if (error) {
            console.error('Error updating answer note:', error);
        } else {
            // this.userDuasTrigger.update((n) => n + 1);
        }
    }

    async deleteUserDua(id: string) {
        const user = this.supabaseService.user();
        if (!user) return;

        const { error } = await this.supabaseService.supabase
            .from('user_duas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting dua:', error);
        } else {
            this.userDuasTrigger.update((n) => n + 1);
        }
    }
}
