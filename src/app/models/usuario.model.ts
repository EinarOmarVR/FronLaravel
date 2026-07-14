export interface Usuario {
  id: string;
  SCodigo: string;
  SNombre: string;
  SUsuario: string;
  STelefono: string | null;
  SFotoPerfil: string | null;
  SIDPerfil: string;
  TFechaCap: string | null;
  TFechaMod: string | null;
}