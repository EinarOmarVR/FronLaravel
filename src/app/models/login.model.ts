import { Usuario } from './usuario.model';
import { Perfil } from './perfil.model';
import { Permiso } from './permiso.model';

export interface LoginRequest {
  SUsuario: string;
  SPassword: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: Usuario;
  perfil: Perfil;
  permisos: Permiso[];
}