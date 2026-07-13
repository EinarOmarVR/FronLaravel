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
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(component => component.DashboardComponent),
    children: [
      {
        path: 'productos',
        loadComponent: () =>
          import('./pages/productos/productos.component')
            .then(component => component.ProductosComponent)
      },
      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      }
    ]
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