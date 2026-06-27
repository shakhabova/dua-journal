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
            user_duas_v2: {
                Row: {
                    id: string;
                    user_id: string;
                    data: string;
                };
                Insert: {
                    id: string;
                    user_id: string;
                    data: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    data?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_duas_v2_user_id_fkey';
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
