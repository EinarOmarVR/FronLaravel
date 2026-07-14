import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { UsuariosService } from '../../core/services/usuarios.service';
import { StorageService } from '../../core/services/storage.service';

import { Usuario } from '../../models/usuario.model';
import { Perfil } from '../../models/perfil.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {

  perfilForm: FormGroup;

  usuario: Usuario | null = null;
  perfil: Perfil | null = null;

  archivoFoto: File | null = null;
  vistaPreviaFoto: string | null = null;

  cargando = false;
  guardando = false;

  mensajeExito = '';
  mensajeError = '';

  readonly codigosPais = [
    { codigo: '+52', pais: 'México' },
    { codigo: '+1', pais: 'Estados Unidos / Canadá' },
    { codigo: '+34', pais: 'España' },
    { codigo: '+54', pais: 'Argentina' },
    { codigo: '+56', pais: 'Chile' },
    { codigo: '+57', pais: 'Colombia' },
    { codigo: '+51', pais: 'Perú' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private storageService: StorageService
  ) {
    this.perfilForm = this.formBuilder.group({
      SNombre: [
        '',
        Validators.required
      ],
      SCodigoPais: ['+52'],
      STelefono: [
        '',
        Validators.pattern(/^\d{7,15}$/)
      ]
    });

    this.perfil =
      this.storageService.obtenerPerfil();
  }

  ngOnInit(): void {
    this.cargarMiPerfil();
  }

  cargarMiPerfil(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.usuariosService.obtenerMiPerfil()
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          this.usuario = respuesta.data;
          this.vistaPreviaFoto =
            respuesta.data.SFotoPerfil || null;

          this.storageService.guardarUsuario(
            respuesta.data
          );

          const telefono = this.separarTelefono(
            respuesta.data.STelefono
          );

          this.perfilForm.patchValue({
            SNombre: respuesta.data.SNombre,
            SCodigoPais: telefono.codigo,
            STelefono: telefono.numero
          });
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error);
        }
      });
  }

  seleccionarFoto(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    this.archivoFoto = archivo;

    const lector = new FileReader();

    lector.onload = () => {
      this.vistaPreviaFoto =
        lector.result as string;
    };

    lector.readAsDataURL(archivo);
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const datos = new FormData();

    const nombre = String(
      this.perfilForm.controls['SNombre'].value
    ).trim();

    const codigoPais = String(
      this.perfilForm.controls['SCodigoPais'].value
    );

    const telefono = String(
      this.perfilForm.controls['STelefono'].value || ''
    ).replace(/\D/g, '');

    datos.append('SNombre', nombre);

    if (telefono) {
      datos.append(
        'STelefono',
        codigoPais + telefono
      );
    }

    if (this.archivoFoto) {
      datos.append(
        'SFotoPerfil',
        this.archivoFoto
      );
    }

    this.usuariosService.actualizarMiPerfil(datos)
    .pipe(
      finalize(() => {
        this.guardando = false;
      })
    )
    .subscribe({
      next: (respuesta) => {
        const fotoActualizada =
          respuesta.data.SFotoPerfil
            ? `${respuesta.data.SFotoPerfil}?v=${Date.now()}`
            : '';

        const usuarioActualizado: Usuario = {
          ...respuesta.data,
          SFotoPerfil: fotoActualizada
        };

        this.usuario = usuarioActualizado;
        this.archivoFoto = null;
        this.vistaPreviaFoto = fotoActualizada;

        const telefono = this.separarTelefono(
          usuarioActualizado.STelefono
        );

        this.perfilForm.patchValue({
          SNombre: usuarioActualizado.SNombre,
          SCodigoPais: telefono.codigo,
          STelefono: telefono.numero
        });

        this.perfilForm.markAsPristine();
        this.perfilForm.markAsUntouched();

        this.storageService.guardarUsuario(
          usuarioActualizado
        );

        this.mensajeExito = respuesta.message;

        window.dispatchEvent(
          new CustomEvent(
            'usuarioActualizado',
            {
              detail: usuarioActualizado
            }
          )
        );
      },
      error: (error: HttpErrorResponse) => {
        this.mostrarError(error);
      }
    });
  }

  separarTelefono(
    telefono: string | null | undefined
  ): {
    codigo: string;
    numero: string;
  } {
    if (!telefono) {
      return {
        codigo: '+52',
        numero: ''
      };
    }

    const codigo = this.codigosPais.find(
      item => telefono.startsWith(item.codigo)
    );

    if (!codigo) {
      return {
        codigo: '+52',
        numero: telefono.replace(/\D/g, '')
      };
    }

    return {
      codigo: codigo.codigo,
      numero: telefono.substring(
        codigo.codigo.length
      )
    };
  }

  obtenerInicial(): string {
    return (
      this.usuario?.SNombre
        ?.charAt(0)
        .toUpperCase() || 'U'
    );
  }

  mostrarError(
    error: HttpErrorResponse
  ): void {
    const errores = error.error?.errors as
      Record<string, string[]> | undefined;

    this.mensajeError =
      errores
        ? Object.values(errores)[0]?.[0]
        : error.error?.message;

    if (!this.mensajeError) {
      this.mensajeError =
        'No fue posible completar la operación.';
    }
  }
}