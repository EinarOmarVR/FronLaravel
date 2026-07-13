import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse
} from '../../models/login.model';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/Login`,
      datos
    ).pipe(
      tap((respuesta: LoginResponse) => {
        this.storageService.guardarToken(respuesta.token);
        this.storageService.guardarUsuario(respuesta.usuario);
        this.storageService.guardarPerfil(respuesta.perfil);
        this.storageService.guardarPermisos(respuesta.permisos);
      })
    );
  }

  recuperarPassword(
    SUsuario: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/RecuperarPassword`,
      { SUsuario }
    );
  }
}