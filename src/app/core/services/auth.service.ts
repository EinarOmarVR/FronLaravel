import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse
} from '../../models/login.model';

import { StorageService } from './storage.service';

interface MessageResponse {
  message: string;
}
interface CambiarPasswordRequest {
  SPassword: string;
  SPassword_confirmation: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  login(
    datos: LoginRequest
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/Login`,
      datos
    ).pipe(
      tap((respuesta: LoginResponse) => {
        this.storageService.guardarToken(
          respuesta.token
        );

        this.storageService.guardarUsuario(
          respuesta.usuario
        );

        this.storageService.guardarPerfil(
          respuesta.perfil
        );

        this.storageService.guardarPermisos(
          respuesta.permisos
        );
      })
    );
  }

  recuperarPassword(
    SUsuario: string
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/RecuperarPassword`,
      { SUsuario }
    );
  }

  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/Logout`,
      {}
    );
  }

  limpiarSesion(): void {
    this.storageService.limpiarSesion();
  }
  cambiarPassword(
    datos: CambiarPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/CambiarPassword`,
      datos
    );
  }
  registrarUsuario(
    datos: FormData
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/RegistrarUsuario`,
      datos
    );
  }
}