import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Permiso,
  PermisoRequest
} from '../../models/permiso.model';

interface ListaPermisosResponse {
  data: Permiso[];
}

interface PermisoResponse {
  message: string;
  data: Permiso;
}

interface MensajeResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  obtenerPermisos(): Observable<ListaPermisosResponse> {
    return this.http.get<ListaPermisosResponse>(
      `${this.apiUrl}/GetPermisos`
    );
  }

  obtenerPermiso(id: string): Observable<{ data: Permiso }> {
    return this.http.get<{ data: Permiso }>(
      `${this.apiUrl}/GetPermiso/${id}`
    );
  }

  crearPermiso(
    permiso: PermisoRequest
  ): Observable<PermisoResponse> {
    return this.http.post<PermisoResponse>(
      `${this.apiUrl}/InsertPermiso`,
      permiso
    );
  }

  actualizarPermiso(
    id: string,
    permiso: PermisoRequest
  ): Observable<PermisoResponse> {
    return this.http.put<PermisoResponse>(
      `${this.apiUrl}/UpdatePermiso/${id}`,
      permiso
    );
  }

  eliminarPermiso(
    id: string
  ): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(
      `${this.apiUrl}/DeletePermiso/${id}`
    );
  }
}