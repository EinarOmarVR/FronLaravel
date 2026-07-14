export interface Permiso {
  id: string;
  SCodigo: string;
  SPermiso: string;
  SModulo: string;
  SDescripcion: string | null;
  TFechaCap: string | null;
  TFechaMod: string | null;
}

export interface PermisoRequest {
  SCodigo: string;
  SPermiso: string;
  SModulo: string;
  SDescripcion: string | null;
}