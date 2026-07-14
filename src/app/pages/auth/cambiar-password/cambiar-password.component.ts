import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-cambiar-password',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.css'
})
export class CambiarPasswordComponent {

  passwordForm: FormGroup;

  guardando = false;

  mostrarPassword = false;
  mostrarConfirmacion = false;

  mensajeExito = '';
  mensajeError = '';

  private readonly passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.passwordForm = this.formBuilder.group(
      {
        SPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              this.passwordPattern
            )
          ]
        ],
        SPassword_confirmation: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators: [
          this.passwordsIguales
        ]
      }
    );
  }

  passwordsIguales(
    control: AbstractControl
  ): ValidationErrors | null {
    const password =
      control.get('SPassword')?.value;

    const confirmacion =
      control.get('SPassword_confirmation')?.value;

    if (!password || !confirmacion) {
      return null;
    }

    return password === confirmacion
      ? null
      : { passwordsNoCoinciden: true };
  }

  cambiarVisibilidadPassword(): void {
    this.mostrarPassword =
      !this.mostrarPassword;
  }

  cambiarVisibilidadConfirmacion(): void {
    this.mostrarConfirmacion =
      !this.mostrarConfirmacion;
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const datos = {
      SPassword:
        this.passwordForm.controls['SPassword'].value,
      SPassword_confirmation:
        this.passwordForm.controls[
          'SPassword_confirmation'
        ].value
    };

    this.authService.cambiarPassword(datos)
      .pipe(
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito =
            respuesta.message;

          /*
           * El backend invalidó el token, por lo que
           * también limpiamos la sesión de Angular.
           */
          this.storageService.limpiarSesion();

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

  cancelar(): void {
    this.router.navigateByUrl(
      '/dashboard/mi-perfil'
    );
  }

  private mostrarError(
    error: HttpErrorResponse
  ): void {
    const errores = error.error?.errors as
      Record<string, string[]> | undefined;

    if (errores) {
      const primerError =
        Object.values(errores)[0]?.[0];

      if (primerError) {
        this.mensajeError = primerError;
        return;
      }
    }

    this.mensajeError =
      error.error?.message ||
      'No fue posible cambiar la contraseña.';
  }
}