import type { Routes } from '@angular/router';
import { AnswersComponent } from './pages/answers/answers.component';
import { HomeComponent } from './pages/home/home.component';
import { LibraryComponent } from './pages/library/library.component';
import { LoginComponent } from './pages/login/login.component';
import { MyDuasComponent } from './pages/my-duas/my-duas.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: HomeComponent, canActivate: [authGuard] },
    { path: 'my-duas', component: MyDuasComponent, canActivate: [authGuard] },
    { path: 'library', component: LibraryComponent, canActivate: [authGuard] },
    { path: 'archive', component: AnswersComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' },
];
