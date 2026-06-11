import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, LucideDynamicIcon],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private themeService = inject(ThemeService);
    private router = inject(Router);

    public errorMessage = signal<string | null>(null);
    public isLoading = signal<boolean>(false);
    public loadingText = signal<string>('Перенаправление в Telegram...');
    protected isDark = this.themeService.isDarkTheme;

    ngOnInit() {
        // 1. Check if the URL contains an OIDC code callback parameter from Telegram
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            this.handleOidcCallback(code);
        } else if (this.supabaseService.isAuthenticated()) {
            // If already authenticated and no callback, send to home page
            this.router.navigate(['/']);
        }
    }

    onLoginWithTelegram() {
        this.isLoading.set(true);
        this.loadingText.set('Перенаправление в Telegram...');
        this.errorMessage.set(null);

        // Redirect to Telegram OIDC Authentication page
        window.location.href = this.supabaseService.getOidcLoginUrl();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    private async handleOidcCallback(code: string) {
        this.isLoading.set(true);
        this.loadingText.set('Установка защищенного сеанса...');
        this.errorMessage.set(null);

        const res = await this.supabaseService.loginWithOidcCode(code);

        this.isLoading.set(false);
        if (res.success) {
            // Clear URL query parameters for clean routing
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
            );
            this.router.navigate(['/']);
        } else {
            this.errorMessage.set(
                res.error ||
                    'Ошибка авторизации через Telegram. Пожалуйста, попробуйте еще раз.',
            );
        }
    }
}
