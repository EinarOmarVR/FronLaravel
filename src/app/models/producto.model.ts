export interface Producto {
  SClave: string;
  SCodigo: string;
  SProducto: string;
  SMarca: string;
  DPrecio: number;
  TFechaCap: string | null;
  TFechaMod: string | null;
}

export interface ProductoRequest {
  SProducto: string;
  SMarca: string;
  DPrecio: number;
}