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

import { PermisosService } from '../../core/services/permisos.service';
import { StorageService } from '../../core/services/storage.service';

import {
  Permiso,
  PermisoRequest
} from '../../models/permiso.model';

@Component({
  selector: 'app-permisos',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './permisos.component.html',
  styleUrl: './permisos.component.css'
})
export class PermisosComponent implements OnInit {

  permisoForm: FormGroup;

  permisos: Permiso[] = [];
  permisoEditando: Permiso | null = null;

  cargando: boolean = false;
  guardando: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  puedeEditar: boolean = false;
  puedeEliminar: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private permisosService: PermisosService,
    private storageService: StorageService
  ) {
    this.permisoForm = this.formBuilder.group({
      SCodigo: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      SPermiso: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      SModulo: [
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
      ]
    });

    this.puedeEditar =
      this.storageService.tienePermiso('PERMISSION_ADDUPD');

    this.puedeEliminar =
      this.storageService.tienePermiso('PERMISSION_DELETE');
  }

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.permisosService.obtenerPermisos().subscribe({
      next: (respuesta) => {
        this.permisos = respuesta.data;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }
    });
  }

  guardarPermiso(): void {

    if (this.permisoForm.invalid) {
      this.permisoForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const descripcion =
      this.permisoForm.value.SDescripcion?.trim();

    const datos: PermisoRequest = {
      SCodigo:
        this.permisoForm.value.SCodigo.trim().toUpperCase(),
      SPermiso:
        this.permisoForm.value.SPermiso.trim(),
      SModulo:
        this.permisoForm.value.SModulo.trim().toUpperCase(),
      SDescripcion:
        descripcion ? descripcion : null
    };

    if (this.permisoEditando) {
      this.actualizarPermiso(
        this.permisoEditando.id,
        datos
      );

      return;
    }

    this.crearPermiso(datos);
  }

  crearPermiso(datos: PermisoRequest): void {
    this.permisosService.crearPermiso(datos).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mensajeExito = respuesta.message;

        this.limpiarFormulario();
        this.cargarPermisos();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  actualizarPermiso(
    id: string,
    datos: PermisoRequest
  ): void {
    this.permisosService
      .actualizarPermiso(id, datos)
      .subscribe({
        next: (respuesta) => {
          this.guardando = false;
          this.mensajeExito = respuesta.message;

          this.limpiarFormulario();
          this.cargarPermisos();
        },
        error: (error: HttpErrorResponse) => {
          this.guardando = false;
          this.mostrarError(error);
        }
      });
  }

  seleccionarPermiso(permiso: Permiso): void {
    this.permisoEditando = permiso;

    this.mensajeExito = '';
    this.mensajeError = '';

    this.permisoForm.patchValue({
      SCodigo: permiso.SCodigo,
      SPermiso: permiso.SPermiso,
      SModulo: permiso.SModulo,
      SDescripcion: permiso.SDescripcion || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  eliminarPermiso(permiso: Permiso): void {
    const confirmar = window.confirm(
      `¿Deseas eliminar el permiso ${permiso.SCodigo}?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    this.permisosService
      .eliminarPermiso(permiso.id)
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito = respuesta.message;

          if (
            this.permisoEditando?.id === permiso.id
          ) {
            this.limpiarFormulario();
          }

          this.cargarPermisos();
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error);
        }
      });
  }

  limpiarFormulario(): void {
    this.permisoEditando = null;
    this.permisoForm.reset();
  }

  mostrarError(error: HttpErrorResponse): void {
    this.mensajeError =
      error.error?.message ||
      'No fue posible completar la operación.';
  }

  exportarPdf(): void {

    if (this.permisos.length === 0) {
      return;
    }

    const documento = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    documento.setFontSize(18);
    documento.text(
      'Reporte de permisos',
      14,
      16
    );

    documento.setFontSize(10);
    documento.text(
      `Fecha de exportación: ${new Date().toLocaleString('es-MX')}`,
      14,
      23
    );

    const filas = this.permisos.map(permiso => [
      permiso.SCodigo,
      permiso.SPermiso,
      permiso.SModulo,
      permiso.SDescripcion || '-',
      permiso.TFechaCap || '-',
      permiso.TFechaMod || '-'
    ]);

    autoTable(documento, {
      startY: 29,
      head: [[
        'Código',
        'Permiso',
        'Módulo',
        'Descripción',
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
        fontSize: 8,
        cellPadding: 3
      }
    });

    documento.save('permisos.pdf');
  }

  exportarExcel(): void {

    if (this.permisos.length === 0) {
      return;
    }

    const datosExcel = this.permisos.map(permiso => ({
      Código: permiso.SCodigo,
      Permiso: permiso.SPermiso,
      Módulo: permiso.SModulo,
      Descripción: permiso.SDescripcion || '',
      Creación: permiso.TFechaCap || '',
      Modificación: permiso.TFechaMod || ''
    }));

    const hoja =
      XLSX.utils.json_to_sheet(datosExcel);

    hoja['!cols'] = [
      { wch: 22 },
      { wch: 32 },
      { wch: 22 },
      { wch: 45 },
      { wch: 20 },
      { wch: 20 }
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      'Permisos'
    );

    XLSX.writeFile(
      libro,
      'permisos.xlsx'
    );
  }
}