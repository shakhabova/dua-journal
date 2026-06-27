import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    isDarkTheme = signal<boolean>(false);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        this.initTheme();
    }

    private initTheme() {
        if (!isPlatformBrowser(this.platformId)) return;

        const tg = (window as any).Telegram?.WebApp;
        if (tg?.colorScheme) {
            this.isDarkTheme.set(tg.colorScheme === 'dark');

            // Listen to dynamic theme changes from Telegram Mini App container
            tg.onEvent('themeChanged', () => {
                this.isDarkTheme.set(tg.colorScheme === 'dark');
                this.applyTheme();
            });
        } else {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.isDarkTheme.set(savedTheme === 'dark');
            } else {
                const prefersDark = window.matchMedia?.(
                    '(prefers-color-scheme: dark)',
                ).matches;
                this.isDarkTheme.set(prefersDark);
            }
        }
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkTheme.update((val) => !val);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(
                'theme',
                this.isDarkTheme() ? 'dark' : 'light',
            );
        }
        this.applyTheme();
    }

    private applyTheme() {
        if (!isPlatformBrowser(this.platformId)) return;

        const isDark = this.isDarkTheme();
        const themeColor = isDark ? '#0c1218' : '#faf7f2';

        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.documentElement.classList.remove('dark');
        }

        // Update the meta tag for browser theme-color
        const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]',
        );
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeColor);
        }

        // Update Telegram WebApp colors to match custom design
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
            if (tg.setHeaderColor) {
                try {
                    tg.setHeaderColor(themeColor);
                } catch (e) {
                    console.error('Telegram setHeaderColor failed', e);
                }
            }
            if (tg.setBackgroundColor) {
                try {
                    tg.setBackgroundColor(themeColor);
                } catch (e) {
                    console.error('Telegram setBackgroundColor failed', e);
                }
            }
        }
    }
}
