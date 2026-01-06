import { Routes } from '@angular/router';
import { authGuard } from './shared/services/auth-guard';

export const routes: Routes = [
  {
    path: 'content',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/pages/content/content.page').then((m) => m.ContentPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./shared/pages/register/register.page').then(
        (m) => m.RegisterPage
      ),
  },
  {
    path: 'aprobation',
    loadComponent: () =>
      import('./shared/pages/aprobation/aprobation.page').then(
        (m) => m.AprobationPage
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/pages/admin/admin.page').then((m) => m.AdminPage),
    children: [
      {
        path: 'users-sing-up',
        loadComponent: () =>
          import('./shared/pages/admin/users-sing-up/users-sing-up.page').then(
            (m) => m.UsersSingUpPage
          ),
      },
      {
        path: 'active-users',
        loadComponent: () =>
          import('./shared/pages/admin/active-users/active-users.page').then(
            (m) => m.ActiveUsersPage
          ),
      },
      {
        path: 'sql-query',
        loadComponent: () =>
          import('./shared/pages/admin/sql-query/sql-query.page').then(
            (m) => m.SqlQueryPage
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },  {
    path: 'distribuidoras',
    loadComponent: () => import('./shared/pages/admin/distribuidoras/distribuidoras.page').then( m => m.DistribuidorasPage)
  },

];
