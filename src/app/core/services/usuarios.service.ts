import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Usuario } from '../../models/usuario.model';

interface ListaUsuariosResponse {
  data: Usuario[];
}

interface UsuarioResponse {
  data: Usuario;
}

interface OperacionUsuarioResponse {
  message: string;
  data: Usuario;
}

interface MensajeResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  obtenerUsuarios(): Observable<ListaUsuariosResponse> {
    return this.http.get<ListaUsuariosResponse>(
      `${this.apiUrl}/GetUsuarios`
    );
  }

  obtenerUsuario(id: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(
      `${this.apiUrl}/GetUsuario/${id}`
    );
  }

  crearUsuario(
    datos: FormData
  ): Observable<OperacionUsuarioResponse> {
    return this.http.post<OperacionUsuarioResponse>(
      `${this.apiUrl}/InsertUsuario`,
      datos
    );
  }

  actualizarUsuario(
    id: string,
    datos: FormData
  ): Observable<OperacionUsuarioResponse> {
    return this.http.post<OperacionUsuarioResponse>(
      `${this.apiUrl}/UpdateUsuario/${id}`,
      datos
    );
  }

  eliminarUsuario(
    id: string
  ): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(
      `${this.apiUrl}/DeleteUsuario/${id}`
    );
  }
}