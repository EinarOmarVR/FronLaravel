import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component')
        .then(component => component.LoginComponent)
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import(
        './pages/auth/recuperar-password/recuperar-password.component'
      ).then(component => component.RecuperarPasswordComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];