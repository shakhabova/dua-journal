import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SupabaseService } from './services/supabase.service';
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

    isDark = this.themeService.isDarkTheme;
    isAuthenticated = this.supabaseService.isAuthenticated;

    ngOnInit() {
        if (typeof window !== 'undefined') {
            const tg = (window as any).Telegram?.WebApp;
            if (tg) {
                tg.ready();
                tg.expand();
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
