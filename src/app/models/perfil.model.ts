export interface Perfil {
  id: string;
  SCodigo: string;
  SPerfil: string;
  SDescripcion: string | null;
  APermisos: string[];
  TFechaCap: string | null;
  TFechaMod: string | null;
}

export interface PerfilRequest {
  SCodigo: string;
  SPerfil: string;
  SDescripcion: string | null;
  APermisos: string[];
}