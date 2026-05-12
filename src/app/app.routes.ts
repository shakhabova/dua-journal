import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MyDuasComponent } from './pages/my-duas/my-duas.component';
import { AnswersComponent } from './pages/answers/answers.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'my-duas', component: MyDuasComponent },
  { path: 'answers', component: AnswersComponent },
  { path: '**', redirectTo: '' }
];
