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

import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';

import {
  LoginRequest,
  LoginResponse
} from '../../../models/login.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  cargando = false;
  mensajeError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      SUsuario: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      SPassword: [
        '',
        Validators.required
      ]
    });
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const datos: LoginRequest = {
      SUsuario: String(
        this.loginForm.controls['SUsuario'].value
      ).trim().toLowerCase(),

      SPassword: String(
        this.loginForm.controls['SPassword'].value
      )
    };

    this.authService.login(datos).subscribe({
      next: (respuesta: LoginResponse) => {
        this.cargando = false;

        /*
         * Si inició con una contraseña temporal,
         * se envía directamente a cambiarla.
         */
        if (respuesta.requiereCambioPassword) {
          this.router.navigateByUrl(
            '/dashboard/cambiar-password',
            {
              replaceUrl: true
            }
          );

          return;
        }

        /*
         * Si la contraseña es normal, se dirige
         * al primer módulo que tenga permitido.
         */
        const rutaInicial =
          this.storageService.obtenerRutaInicial();

        this.router.navigateByUrl(
          rutaInicial,
          {
            replaceUrl: true
          }
        );
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;

        this.mensajeError =
          error.error?.message ||
          'No fue posible iniciar sesión. Verifica tus datos.';
      }
    });
  }
}