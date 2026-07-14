import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

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
  mostrarFoto: boolean = true;
  menuAbierto: boolean = false;
  puedeVerProductos: boolean = false;
  puedeVerUsuarios: boolean = false;
  puedeVerPerfiles: boolean = false;
  puedeVerPermisos: boolean = false;
  constructor(
    
    private storageService: StorageService
  ) {
    
    this.usuario = this.storageService.obtenerUsuario();
    this.puedeVerProductos =
    this.storageService.tienePermiso('PROD_VIEW');
    this.puedeVerUsuarios =
    this.storageService.tienePermiso('USER_VIEW');
    this.puedeVerPerfiles =
    this.storageService.tienePermiso('PROFILE_VIEW');
    this.puedeVerPermisos =
    this.storageService.tienePermiso('PERMISSION_VIEW');
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
    return this.usuario?.SNombre?.charAt(0).toUpperCase() || 'U';
  }
  
}