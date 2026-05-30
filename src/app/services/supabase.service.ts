import { Injectable, signal } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import type { Database } from '../models/supabase.model';

export interface CustomUser {
    id: string;
    email: string;
    user_metadata: {
        telegram_id: number | string;
        username: string;
        first_name: string;
        last_name: string;
        photo_url: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    public supabase!: SupabaseClient<Database>;
    public user = signal<CustomUser | null>(null);
    public isAuthenticated = signal<boolean>(false);
    private tokenKey = 'supabase_custom_token';

    constructor() {
        this.initializeClient();
    }

    private initializeClient() {
        const url = environment.supabaseUrl;
        const key = environment.supabaseKey;

        const storedToken = localStorage.getItem(this.tokenKey);

        if (storedToken) {
            const payload = this.decodeJwt(storedToken);
            if (payload && payload.exp * 1000 > Date.now()) {
                // Token is valid and has not expired yet
                this.user.set({
                    id: payload.sub,
                    email: `${payload.sub}@dua-journal.internal`,
                    user_metadata: payload.user_metadata,
                });
                this.isAuthenticated.set(true);

                // Initialize Supabase client injecting our custom JWT in headers
                this.supabase = createClient<Database>(url, key, {
                    global: {
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    },
                });
                return;
            } else {
                localStorage.removeItem(this.tokenKey);
            }
        }

        // Unauthenticated default state
        this.user.set(null);
        this.isAuthenticated.set(false);
        this.supabase = createClient<Database>(url, key);
    }

    public getOidcLoginUrl(): string {
        const redirectUri = `${window.location.origin}/login`;
        return `https://oauth.telegram.org/auth?client_id=${environment.telegramClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid+profile`;
    }

    async loginWithOidcCode(
        code: string,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const redirectUri = `${window.location.origin}/login`;

            // Invoke our serverless Deno Edge Function to exchange authorization code for a Custom JWT
            const { data, error } = await this.supabase.functions.invoke(
                'telegram-custom-auth',
                {
                    body: { code, redirect_uri: redirectUri },
                },
            );

            if (error || !data?.success) {
                return {
                    success: false,
                    error:
                        error?.message ||
                        data?.error ||
                        'OIDC authorization exchange failed',
                };
            }

            // Store the newly minted Custom JWT in LocalStorage
            const token = data.token;
            localStorage.setItem(this.tokenKey, token);

            // Re-initialize the client with our new authenticated state
            this.initializeClient();

            return { success: true };
        } catch (err: any) {
            return {
                success: false,
                error:
                    err.message ||
                    'An error occurred during OIDC login exchange',
            };
        }
    }

    public isTelegramMiniApp(): boolean {
        if (typeof window === 'undefined') return false;
        const tg = (window as any).Telegram?.WebApp;
        return !!(tg && tg.initData && tg.initData.length > 0);
    }

    async loginWithTelegramMiniApp(): Promise<boolean> {
        try {
            const tg = (window as any).Telegram?.WebApp;
            if (!tg || !tg.initData) {
                return false;
            }

            // Invoke our serverless Deno Edge Function with initData
            const { data, error } = await this.supabase.functions.invoke(
                'telegram-custom-auth',
                {
                    body: { initData: tg.initData },
                },
            );

            if (error || !data?.success) {
                console.error(
                    'Telegram Mini App auth failed:',
                    error || data?.error,
                );
                return false;
            }

            // Store the newly minted Custom JWT in LocalStorage
            const token = data.token;
            localStorage.setItem(this.tokenKey, token);

            // Re-initialize the client with our new authenticated state
            this.initializeClient();

            return true;
        } catch (err) {
            console.error('Error during Telegram Mini App login:', err);
            return false;
        }
    }

    async logout() {
        localStorage.removeItem(this.tokenKey);
        this.initializeClient();
    }

    private decodeJwt(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(
                        (c) =>
                            `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`,
                    )
                    .join(''),
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }
}
