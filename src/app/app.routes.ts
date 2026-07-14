import { Routes } from '@angular/router';

import { permissionGuard } from './core/guards/permission.guard';

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
      ).then(
        component => component.RecuperarPasswordComponent
      )
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(component => component.DashboardComponent),
    children: [
      {
        path: 'productos',
        canActivate: [permissionGuard],
        data: {
          permiso: 'PROD_VIEW'
        },
        loadComponent: () =>
          import('./pages/productos/productos.component')
            .then(component => component.ProductosComponent)
      },
      {
        path: 'permisos',
        canActivate: [permissionGuard],
        data: {
          permiso: 'PERMISSION_VIEW'
        },
        loadComponent: () =>
          import('./pages/permisos/permisos.component')
            .then(component => component.PermisosComponent)
      },
      {
        path: 'perfiles',
        canActivate: [permissionGuard],
        data: {
          permiso: 'PROFILE_VIEW'
        },
        loadComponent: () =>
          import('./pages/perfiles/perfiles.component')
            .then(component => component.PerfilesComponent)
      },
      {
        path: 'usuarios',
        canActivate: [permissionGuard],
        data: {
          permiso: 'USER_VIEW'
        },
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component')
            .then(component => component.UsuariosComponent)
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