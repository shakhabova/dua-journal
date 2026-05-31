import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
    selector: 'app-navbar',
    imports: [RouterModule, LucideDynamicIcon],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {}
