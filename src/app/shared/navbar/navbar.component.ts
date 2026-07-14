import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';

import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  usuario: Usuario | null;

  mostrarFoto = true;
  menuAbierto = false;
  cerrandoSesion = false;

  puedeVerProductos = false;
  puedeVerUsuarios = false;
  puedeVerPerfiles = false;
  puedeVerPermisos = false;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario =
      this.storageService.obtenerUsuario();

    this.puedeVerProductos =
      this.storageService.tienePermiso(
        'PROD_VIEW'
      );

    this.puedeVerUsuarios =
      this.storageService.tienePermiso(
        'USER_VIEW'
      );

    this.puedeVerPerfiles =
      this.storageService.tienePermiso(
        'PROFILE_VIEW'
      );

    this.puedeVerPermisos =
      this.storageService.tienePermiso(
        'PERMISSION_VIEW'
      );
  }

  cambiarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  ocultarFoto(): void {
    this.mostrarFoto = false;
  }

  obtenerInicial(): string {
    return (
      this.usuario?.SNombre
        ?.trim()
        .charAt(0)
        .toUpperCase() || 'U'
    );
  }

  /**
   * Escuchar los cambios realizados desde Mi perfil.
   */
  @HostListener(
    'window:usuarioActualizado',
    ['$event']
  )
  actualizarUsuario(event: Event): void {
    const evento =
      event as CustomEvent<Usuario>;

    this.usuario = evento.detail;
    this.mostrarFoto = true;
  }

  cerrarSesion(): void {
    if (this.cerrandoSesion) {
      return;
    }

    const confirmar = window.confirm(
      '¿Deseas cerrar tu sesión?'
    );

    if (!confirmar) {
      return;
    }

    this.cerrandoSesion = true;
    this.cerrarMenu();

    this.authService.logout()
      .pipe(
        finalize(() => {
          this.cerrandoSesion = false;
        })
      )
      .subscribe({
        next: () => {
          this.finalizarSesion();
        },
        error: () => {
          /*
           * Aunque el servidor no responda,
           * se elimina la sesión local.
           */
          this.finalizarSesion();
        }
      });
  }

  private finalizarSesion(): void {
    this.authService.limpiarSesion();

    this.router.navigateByUrl(
      '/login',
      {
        replaceUrl: true
      }
    );
  }
}