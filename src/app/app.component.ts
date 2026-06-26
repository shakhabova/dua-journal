import {
    ChangeDetectionStrategy,
    Component,
    inject,
    type OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SupabaseService } from './services/supabase.service';
import { TelegramService } from './services/telegram.service';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, LucideDynamicIcon],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
    private themeService = inject(ThemeService);
    private supabaseService = inject(SupabaseService);
    protected telegramService = inject(TelegramService);

    isDark = this.themeService.isDarkTheme;
    isAuthenticated = this.supabaseService.isAuthenticated;

    ngOnInit() {
        if (this.telegramService.isTelegramMiniApp()) {
            const tg = window.Telegram?.WebApp;
            if (tg) {
                document.documentElement.classList.add('is-telegram');
                tg.ready();
                tg.expand();
                if (tg.requestFullscreen) {
                    try {
                        tg.requestFullscreen();
                    } catch (e) {
                        console.error(
                            'Telegram WebApp requestFullscreen failed',
                            e,
                        );
                    }
                }
            }
        }
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.supabaseService.logout();
    }
}
