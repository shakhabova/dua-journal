import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SupabaseService } from './services/supabase.service';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    private themeService = inject(ThemeService);
    private supabaseService = inject(SupabaseService);

    isDark = this.themeService.isDarkTheme;
    isAuthenticated = this.supabaseService.isAuthenticated;

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.supabaseService.logout();
    }
}
