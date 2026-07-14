import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { PerfilesService } from '../../core/services/perfiles.service';
import { PermisosService } from '../../core/services/permisos.service';
import { StorageService } from '../../core/services/storage.service';

import {
  Perfil,
  PerfilRequest
} from '../../models/perfil.model';
import { Permiso } from '../../models/permiso.model';

@Component({
  selector: 'app-perfiles',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './perfiles.component.html',
  styleUrl: './perfiles.component.css'
})
export class PerfilesComponent implements OnInit {

  perfilForm: FormGroup;

  perfiles: Perfil[] = [];
  permisos: Permiso[] = [];

  perfilEditando: Perfil | null = null;

  cargando: boolean = false;
  cargandoPermisos: boolean = false;
  guardando: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  puedeEditar: boolean = false;
  puedeEliminar: boolean = false;

  menuPermisosAbierto: boolean = false;
  busquedaPermiso: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private perfilesService: PerfilesService,
    private permisosService: PermisosService,
    private storageService: StorageService
  ) {
    this.perfilForm = this.formBuilder.group({
      SCodigo: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      SPerfil: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      SDescripcion: [
        '',
        [
          Validators.maxLength(500)
        ]
      ],
      APermisos: [[]]
    });

    this.puedeEditar =
      this.storageService.tienePermiso('PROFILE_ADDUPD');

    this.puedeEliminar =
      this.storageService.tienePermiso('PROFILE_DELETE');
  }

  ngOnInit(): void {
    this.cargarPerfiles();
    this.cargarPermisos();
  }

  get permisosSeleccionados(): string[] {
    return this.perfilForm.controls['APermisos'].value || [];
  }

  get permisosFiltrados(): Permiso[] {
    const texto = this.busquedaPermiso
      .trim()
      .toLowerCase();

    if (!texto) {
      return this.permisos;
    }

    return this.permisos.filter(permiso =>
      permiso.SCodigo.toLowerCase().includes(texto) ||
      permiso.SPermiso.toLowerCase().includes(texto) ||
      permiso.SModulo.toLowerCase().includes(texto)
    );
  }

  cargarPerfiles(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.perfilesService.obtenerPerfiles().subscribe({
      next: (respuesta) => {
        this.perfiles = respuesta.data;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }
    });
  }

  cargarPermisos(): void {
    this.cargandoPermisos = true;

    this.permisosService.obtenerPermisos().subscribe({
      next: (respuesta) => {
        this.permisos = respuesta.data;
        this.cargandoPermisos = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoPermisos = false;
        this.mostrarError(error);
      }
    });
  }

  cambiarMenuPermisos(): void {
    this.menuPermisosAbierto =
      !this.menuPermisosAbierto;
  }

  cerrarMenuPermisos(): void {
    this.menuPermisosAbierto = false;
    this.busquedaPermiso = '';
  }

  actualizarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.busquedaPermiso = input.value;
  }

  estaSeleccionado(idPermiso: string): boolean {
    return this.permisosSeleccionados.includes(idPermiso);
  }

  cambiarPermiso(idPermiso: string): void {
    const seleccionados = [
      ...this.permisosSeleccionados
    ];

    const posicion =
      seleccionados.indexOf(idPermiso);

    if (posicion >= 0) {
      seleccionados.splice(posicion, 1);
    } else {
      seleccionados.push(idPermiso);
    }

    this.perfilForm.controls['APermisos']
      .setValue(seleccionados);

    this.perfilForm.controls['APermisos']
      .markAsDirty();
  }

  seleccionarTodosPermisos(): void {
    const ids = this.permisos.map(
      permiso => permiso.id
    );

    this.perfilForm.controls['APermisos']
      .setValue(ids);
  }

  limpiarPermisos(): void {
    this.perfilForm.controls['APermisos']
      .setValue([]);
  }

  guardarPerfil(): void {

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const descripcion =
      this.perfilForm.value.SDescripcion?.trim();

    const datos: PerfilRequest = {
      SCodigo:
        this.perfilForm.value.SCodigo.trim().toUpperCase(),
      SPerfil:
        this.perfilForm.value.SPerfil.trim(),
      SDescripcion:
        descripcion ? descripcion : null,
      APermisos: this.permisosSeleccionados
    };

    if (this.perfilEditando) {
      this.actualizarPerfil(
        this.perfilEditando.id,
        datos
      );

      return;
    }

    this.crearPerfil(datos);
  }

  crearPerfil(datos: PerfilRequest): void {
    this.perfilesService.crearPerfil(datos).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mensajeExito = respuesta.message;

        this.limpiarFormulario();
        this.cargarPerfiles();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  actualizarPerfil(
    id: string,
    datos: PerfilRequest
  ): void {
    this.perfilesService
      .actualizarPerfil(id, datos)
      .subscribe({
        next: (respuesta) => {
          this.guardando = false;
          this.mensajeExito = respuesta.message;

          this.limpiarFormulario();
          this.cargarPerfiles();
        },
        error: (error: HttpErrorResponse) => {
          this.guardando = false;
          this.mostrarError(error);
        }
      });
  }

  seleccionarPerfil(perfil: Perfil): void {
    this.perfilEditando = perfil;

    this.mensajeExito = '';
    this.mensajeError = '';

    this.perfilForm.patchValue({
      SCodigo: perfil.SCodigo,
      SPerfil: perfil.SPerfil,
      SDescripcion: perfil.SDescripcion || '',
      APermisos: [...perfil.APermisos]
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  eliminarPerfil(perfil: Perfil): void {
    const confirmar = window.confirm(
      `¿Deseas eliminar el perfil ${perfil.SPerfil}?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    this.perfilesService
      .eliminarPerfil(perfil.id)
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito = respuesta.message;

          if (
            this.perfilEditando?.id === perfil.id
          ) {
            this.limpiarFormulario();
          }

          this.cargarPerfiles();
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error);
        }
      });
  }

  limpiarFormulario(): void {
    this.perfilEditando = null;
    this.perfilForm.reset({
      SCodigo: '',
      SPerfil: '',
      SDescripcion: '',
      APermisos: []
    });

    this.cerrarMenuPermisos();
  }

  obtenerCodigosPermisos(
    idsPermisos: string[]
  ): string {
    const codigos = idsPermisos
      .map(id =>
        this.permisos.find(
          permiso => permiso.id === id
        )?.SCodigo
      )
      .filter(
        (codigo): codigo is string => Boolean(codigo)
      );

    return codigos.length > 0
      ? codigos.join(', ')
      : 'Sin permisos';
  }

  mostrarError(error: HttpErrorResponse): void {
    this.mensajeError =
      error.error?.message ||
      'No fue posible completar la operación.';
  }

  exportarPdf(): void {

    if (this.perfiles.length === 0) {
      return;
    }

    const documento = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    documento.setFontSize(18);
    documento.text(
      'Reporte de perfiles',
      14,
      16
    );

    documento.setFontSize(10);
    documento.text(
      `Fecha de exportación: ${new Date().toLocaleString('es-MX')}`,
      14,
      23
    );

    const filas = this.perfiles.map(perfil => [
      perfil.SCodigo,
      perfil.SPerfil,
      perfil.SDescripcion || '-',
      this.obtenerCodigosPermisos(perfil.APermisos),
      perfil.TFechaCap || '-',
      perfil.TFechaMod || '-'
    ]);

    autoTable(documento, {
      startY: 29,
      head: [[
        'Código',
        'Perfil',
        'Descripción',
        'Permisos',
        'Creación',
        'Modificación'
      ]],
      body: filas,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        3: {
          cellWidth: 85
        }
      }
    });

    documento.save('perfiles.pdf');
  }

  exportarExcel(): void {

    if (this.perfiles.length === 0) {
      return;
    }

    const datosExcel = this.perfiles.map(perfil => ({
      Código: perfil.SCodigo,
      Perfil: perfil.SPerfil,
      Descripción: perfil.SDescripcion || '',
      Permisos:
        this.obtenerCodigosPermisos(perfil.APermisos),
      Creación: perfil.TFechaCap || '',
      Modificación: perfil.TFechaMod || ''
    }));

    const hoja =
      XLSX.utils.json_to_sheet(datosExcel);

    hoja['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 40 },
      { wch: 80 },
      { wch: 20 },
      { wch: 20 }
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      'Perfiles'
    );

    XLSX.writeFile(
      libro,
      'perfiles.xlsx'
    );
  }
}