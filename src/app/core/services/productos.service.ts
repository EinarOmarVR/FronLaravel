import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Producto,
  ProductoRequest
} from '../../models/producto.model';

interface ListaProductosResponse {
  data: Producto[];
}

interface ProductoResponse {
  message: string;
  data: Producto;
}

interface MensajeResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  obtenerProductos(): Observable<ListaProductosResponse> {
    return this.http.get<ListaProductosResponse>(
      `${this.apiUrl}/GetProductos`
    );
  }

  crearProducto(
    producto: ProductoRequest
  ): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(
      `${this.apiUrl}/InsertProducto`,
      producto
    );
  }

  actualizarProducto(
    id: string,
    producto: ProductoRequest
  ): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(
      `${this.apiUrl}/UpdateProducto/${id}`,
      producto
    );
  }

  eliminarProducto(
    id: string
  ): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(
      `${this.apiUrl}/DeleteProducto/${id}`
    );
  }
}