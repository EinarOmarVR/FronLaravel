import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  registroForm: FormGroup;

  archivoFoto: File | null = null;
  vistaPreviaFoto: string | null = null;

  mostrarPassword = false;
  registrando = false;

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

  private readonly passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.formBuilder.group({
      SNombre: [
        '',
        Validators.required
      ],
      SUsuario: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      SPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(
            this.passwordPattern
          )
        ]
      ],
      SCodigoPais: ['+52'],
      STelefono: [
        '',
        Validators.pattern(/^\d{7,15}$/)
      ]
    });
  }

  cambiarVisibilidadPassword(): void {
    this.mostrarPassword =
      !this.mostrarPassword;
  }

  seleccionarFoto(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    const formatosPermitidos = [
      'image/jpeg',
      'image/png'
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
      this.mensajeError =
        'La fotografía debe ser JPG, JPEG o PNG.';

      input.value = '';
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
      this.mensajeError =
        'La fotografía no debe superar los 2 MB.';

      input.value = '';
      return;
    }

    this.mensajeError = '';
    this.archivoFoto = archivo;

    const lector = new FileReader();

    lector.onload = () => {
      this.vistaPreviaFoto =
        lector.result as string;
    };

    lector.readAsDataURL(archivo);
  }

  registrar(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    if (!this.archivoFoto) {
      this.mensajeError =
        'La fotografía de perfil es obligatoria.';

      return;
    }

    this.registrando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const datos = new FormData();

    const nombre = String(
      this.registroForm.controls['SNombre'].value
    ).trim();

    const correo = String(
      this.registroForm.controls['SUsuario'].value
    ).trim().toLowerCase();

    const password = String(
      this.registroForm.controls['SPassword'].value
    );

    const codigoPais = String(
      this.registroForm.controls['SCodigoPais'].value
    );

    const telefono = String(
      this.registroForm.controls['STelefono'].value || ''
    ).replace(/\D/g, '');

    datos.append('SNombre', nombre);
    datos.append('SUsuario', correo);
    datos.append('SPassword', password);
    datos.append('SFotoPerfil', this.archivoFoto);

    if (telefono) {
      datos.append(
        'STelefono',
        codigoPais + telefono
      );
    }

    this.authService.registrarUsuario(datos)
      .pipe(
        finalize(() => {
          this.registrando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito =
            respuesta.message;

          setTimeout(() => {
            this.router.navigateByUrl(
              '/login',
              {
                replaceUrl: true
              }
            );
          }, 1500);
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error);
        }
      });
  }

  private mostrarError(
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
        'No fue posible registrar el usuario.';
    }
  }
}