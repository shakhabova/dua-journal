import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const supabaseService = inject(SupabaseService);
    const router = inject(Router);

    // 1. Check if the user is already authenticated via our custom OIDC JWT session
    if (supabaseService.isAuthenticated()) {
        return true;
    }

    // 2. Check if running inside Telegram Mini App and auto-authenticate
    if (supabaseService.isTelegramMiniApp()) {
        const success = await supabaseService.loginWithTelegramMiniApp();
        if (success) {
            return true;
        }
    }

    // 3. User is not authenticated, redirect to the login page
    router.navigate(['/login']);
    return false;
};
