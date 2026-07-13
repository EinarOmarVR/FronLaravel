import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models/login.model';

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

  cargando: boolean = false;
  mensajeError: string = '';

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      SUsuario: ['', Validators.required],
      SPassword: ['', Validators.required]
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
      SUsuario: this.loginForm.value.SUsuario,
      SPassword: this.loginForm.value.SPassword
    };

    this.authService.login(datos).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/dashboard']);
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