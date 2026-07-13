import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {

  recuperarForm: FormGroup;

  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.recuperarForm = this.formBuilder.group({
      SUsuario: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });
  }

  recuperarPassword(): void {

    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const SUsuario = this.recuperarForm.value.SUsuario;

    this.authService.recuperarPassword(SUsuario).subscribe({
      next: () => {
        this.cargando = false;

        this.mensajeExito =
          'Se envió una contraseña temporal a tu correo electrónico. ' +
          'Inicia sesión con esa contraseña para poder establecer una nueva.';

        this.recuperarForm.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;

        this.mensajeError =
          error.error?.message ||
          'No fue posible procesar la solicitud.';
      }
    });
  }
}