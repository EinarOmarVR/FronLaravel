import { Injectable } from '@angular/core';

import { Usuario } from '../../models/usuario.model';
import { Perfil } from '../../models/perfil.model';
import { Permiso } from '../../models/permiso.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly TOKEN_KEY = 'token';
  private readonly USUARIO_KEY = 'usuario';
  private readonly PERFIL_KEY = 'perfil';
  private readonly PERMISOS_KEY = 'permisos';

  constructor() {}

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  guardarUsuario(usuario: Usuario): void {
    localStorage.setItem(
      this.USUARIO_KEY,
      JSON.stringify(usuario)
    );
  }

  obtenerUsuario(): Usuario | null {
    const usuario = localStorage.getItem(this.USUARIO_KEY);

    return usuario ? JSON.parse(usuario) : null;
  }

  guardarPerfil(perfil: Perfil): void {
    localStorage.setItem(
      this.PERFIL_KEY,
      JSON.stringify(perfil)
    );
  }

  obtenerPerfil(): Perfil | null {
    const perfil = localStorage.getItem(this.PERFIL_KEY);

    return perfil ? JSON.parse(perfil) : null;
  }

  guardarPermisos(permisos: Permiso[]): void {
    localStorage.setItem(
      this.PERMISOS_KEY,
      JSON.stringify(permisos)
    );
  }

  obtenerPermisos(): Permiso[] {
    const permisos = localStorage.getItem(this.PERMISOS_KEY);

    return permisos ? JSON.parse(permisos) : [];
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  limpiarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    localStorage.removeItem(this.PERFIL_KEY);
    localStorage.removeItem(this.PERMISOS_KEY);
  }
  tienePermiso(codigo: string): boolean {
    const permisos = this.obtenerPermisos();

    return permisos.some(
      permiso =>
        permiso.SCodigo.toUpperCase() === codigo.toUpperCase()
    );
  }

  obtenerRutaInicial(): string {

    if (this.tienePermiso('PROD_VIEW')) {
      return '/dashboard/productos';
    }

    if (this.tienePermiso('PERMISSION_VIEW')) {
      return '/dashboard/permisos';
    }

    if (this.tienePermiso('PROFILE_VIEW')) {
      return '/dashboard/perfiles';
    }

    if (this.tienePermiso('USER_VIEW')) {
      return '/dashboard/usuarios';
    }

    return '/login';
  }
  
}
