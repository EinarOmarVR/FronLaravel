import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Perfil,
  PerfilRequest
} from '../../models/perfil.model';

interface ListaPerfilesResponse {
  data: Perfil[];
}

interface PerfilResponse {
  data: Perfil;
}

interface OperacionPerfilResponse {
  message: string;
  data: Perfil;
}

interface MensajeResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilesService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  obtenerPerfiles(): Observable<ListaPerfilesResponse> {
    return this.http.get<ListaPerfilesResponse>(
      `${this.apiUrl}/GetPerfiles`
    );
  }

  obtenerPerfil(id: string): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(
      `${this.apiUrl}/GetPerfil/${id}`
    );
  }

  crearPerfil(
    perfil: PerfilRequest
  ): Observable<OperacionPerfilResponse> {
    return this.http.post<OperacionPerfilResponse>(
      `${this.apiUrl}/InsertPerfil`,
      perfil
    );
  }

  actualizarPerfil(
    id: string,
    perfil: PerfilRequest
  ): Observable<OperacionPerfilResponse> {
    return this.http.put<OperacionPerfilResponse>(
      `${this.apiUrl}/UpdatePerfil/${id}`,
      perfil
    );
  }

  eliminarPerfil(
    id: string
  ): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(
      `${this.apiUrl}/DeletePerfil/${id}`
    );
  }
}