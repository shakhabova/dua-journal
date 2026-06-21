import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root',
})
export class EncryptionService {
    private supabaseService = inject(SupabaseService);

    // Locked is true until the key is retrieved from the Supabase edge function
    public isLocked = signal<boolean>(true);
    public isEncryptionEnabled = signal<boolean>(true); // Always active now

    private key: CryptoKey | null = null;

    // Promises to handle asynchronous key loading in data services
    private keyLoadedResolve?: () => void;
    public keyLoadedPromise!: Promise<void>;

    constructor() {
        this.resetKeyPromise();
        this.init();
    }

    private init() {
        // Automatically fetch key when user is authenticated, clear when logged out
        effect(() => {
            const auth = this.supabaseService.isAuthenticated();
            if (auth) {
                this.loadOrCreateKey();
            } else {
                this.lock();
            }
        });
    }

    private resetKeyPromise() {
        this.keyLoadedPromise = new Promise<void>((resolve) => {
            this.keyLoadedResolve = resolve;
        });
    }

    /**
     * Resolves when the key is loaded, allowing services to wait before decryption
     */
    public async ensureKeyLoaded(): Promise<void> {
        if (!this.isLocked()) return;
        await this.keyLoadedPromise;
    }

    /**
     * Invokes the edge function to obtain the user's derived key securely.
     */
    private async loadOrCreateKey() {
        const user = this.supabaseService.user();
        if (!user) {
            this.lock();
            return;
        }

        try {
            // 1. Invoke the secure Supabase Edge Function to retrieve the derived key
            const { data, error } = await this.supabaseService.supabase.functions.invoke(
                'derive-encryption-key'
            );

            if (error || !data?.success || !data?.key) {
                console.error('Failed to retrieve derived encryption key:', error || data?.error);
                return;
            }

            const rawKeyBase64 = data.key;

            // 2. Import the base64 key as an AES-GCM CryptoKey
            const rawKey = this.base64ToBuf(rawKeyBase64);
            this.key = await crypto.subtle.importKey(
                'raw',
                rawKey as any,
                'AES-GCM',
                false,
                ['encrypt', 'decrypt']
            );

            this.isLocked.set(false);
            this.keyLoadedResolve?.();
        } catch (err) {
            console.error('Failed to initialize client encryption key:', err);
        }
    }

    /**
     * Locks the key and resets the promise for subsequent logins
     */
    private lock(): void {
        this.key = null;
        this.isLocked.set(true);
        this.resetKeyPromise();
    }

    /**
     * Encrypt a string value using AES-GCM
     */
    public async encrypt(text: string | undefined | null): Promise<string> {
        if (!text) return '';
        
        await this.ensureKeyLoaded();
        if (this.isLocked() || !this.key) {
            return text;
        }

        // Avoid double encrypting
        if (text.startsWith('enc:')) {
            return text;
        }

        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv as any },
            this.key,
            encoder.encode(text)
        );

        return 'enc:' + this.bufToBase64(iv) + ':' + this.bufToBase64(ciphertext);
    }

    /**
     * Decrypt an AES-GCM encrypted string
     */
    public async decrypt(text: string | undefined | null): Promise<string> {
        if (!text) return '';
        if (!text.startsWith('enc:')) {
            return text;
        }

        await this.ensureKeyLoaded();
        if (this.isLocked() || !this.key) {
            return '🔒 [Данные заблокированы]';
        }

        try {
            const parts = text.split(':');
            if (parts.length !== 3) return text;

            const iv = this.base64ToBuf(parts[1]);
            const ciphertext = this.base64ToBuf(parts[2]);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv as any },
                this.key,
                ciphertext as any
            );

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error('Decryption failed', e);
            return '❌ [Ошибка расшифрования]';
        }
    }

    private bufToBase64(buf: ArrayBuffer | Uint8Array): string {
        const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToBuf(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}
