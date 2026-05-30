export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            user_duas: {
                Row: {
                    id: string;
                    user_id: string;
                    category: string | null;
                    text: string;
                    text_ar: string | null;
                    transcription: string | null;
                    reference: string | null;
                    date_added: string;
                    answered_at: string | null;
                    answer_note: string | null;
                    is_answered: boolean;
                    is_custom: boolean;
                    original_dua_id: string | null;
                };
                Insert: {
                    id: string;
                    user_id: string;
                    category?: string | null;
                    text: string;
                    text_ar?: string | null;
                    transcription?: string | null;
                    reference?: string | null;
                    date_added?: string;
                    answered_at?: string | null;
                    answer_note?: string | null;
                    is_answered?: boolean;
                    is_custom?: boolean;
                    original_dua_id?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    category?: string | null;
                    text?: string;
                    text_ar?: string | null;
                    transcription?: string | null;
                    reference?: string | null;
                    date_added?: string;
                    answered_at?: string | null;
                    answer_note?: string | null;
                    is_answered?: boolean;
                    is_custom?: boolean;
                    original_dua_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_duas_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
            library_duas: {
                Row: {
                    id: string;
                    source: string;
                    text_ru: string;
                    text_ar: string | null;
                    transcription: string | null;
                    reference: string | null;
                };
                Insert: {
                    id: string;
                    source: string;
                    text_ru: string;
                    text_ar?: string | null;
                    transcription?: string | null;
                    reference?: string | null;
                };
                Update: {
                    id?: string;
                    source?: string;
                    text_ru?: string;
                    text_ar?: string | null;
                    transcription?: string | null;
                    reference?: string | null;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
