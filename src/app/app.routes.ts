import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'content',
    loadComponent: () => import('./shared/pages/content/content.page').then( m => m.ContentPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./shared/pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'aprobation',
    loadComponent: () => import('./shared/pages/aprobation/aprobation.page').then( m => m.AprobationPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadComponent: () => import('./shared/pages/admin/admin.page').then( m => m.AdminPage)
  }
];
