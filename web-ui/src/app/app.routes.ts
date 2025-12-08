import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';

// ルーティング設定
export const routes: Routes = [
    { path : 'login', component: LoginComponent },
    { path : 'dashboard', component: DashboardComponent },
    { path : '', redirectTo: 'login', pathMatch: 'full' }
];
