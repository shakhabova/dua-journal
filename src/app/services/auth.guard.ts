import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async () => {
    const supabaseService = inject(SupabaseService);
    const router = inject(Router);

    // Check if the user is authenticated via our custom OIDC JWT session
    if (supabaseService.isAuthenticated()) {
        return true;
    }

    // User is not authenticated, redirect to the login page
    router.navigate(['/login']);
    return false;
};
