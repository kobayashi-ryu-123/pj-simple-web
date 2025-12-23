import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { MapComponent } from './pages/map/map';

// ルーティング設定
export const routes: Routes = [
    { path : 'login', component: LoginComponent },
    { path : 'dashboard', component: DashboardComponent },
    { path : 'map', component: MapComponent },
    { path : '', redirectTo: 'login', pathMatch: 'full' }
];
