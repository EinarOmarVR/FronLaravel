import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ProductosService } from '../../core/services/productos.service';
import {
  Producto,
  ProductoRequest
} from '../../models/producto.model';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-productos',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {

  productoForm: FormGroup;

  productos: Producto[] = [];
  productoEditando: Producto | null = null;

  cargando: boolean = false;
  guardando: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private productosService: ProductosService
  ) {
    this.productoForm = this.formBuilder.group({
      SProducto: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      SMarca: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      DPrecio: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(999)
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.productosService.obtenerProductos().subscribe({
      next: (respuesta) => {
        this.productos = respuesta.data;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }
    });
  }

  guardarProducto(): void {

    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const datos: ProductoRequest = {
      SProducto: this.productoForm.value.SProducto,
      SMarca: this.productoForm.value.SMarca,
      DPrecio: Number(this.productoForm.value.DPrecio)
    };

    if (this.productoEditando) {
      this.actualizarProducto(
        this.productoEditando.SClave,
        datos
      );

      return;
    }

    this.crearProducto(datos);
  }

  crearProducto(datos: ProductoRequest): void {
    this.productosService.crearProducto(datos).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mensajeExito = respuesta.message;
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  actualizarProducto(
    id: string,
    datos: ProductoRequest
  ): void {
    this.productosService.actualizarProducto(id, datos).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mensajeExito = respuesta.message;
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  seleccionarProducto(producto: Producto): void {
    this.productoEditando = producto;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.productoForm.patchValue({
      SProducto: producto.SProducto,
      SMarca: producto.SMarca,
      DPrecio: producto.DPrecio
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  eliminarProducto(producto: Producto): void {
    const confirmar = window.confirm(
      `¿Deseas eliminar el producto ${producto.SProducto}?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    this.productosService
      .eliminarProducto(producto.SClave)
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito = respuesta.message;

          if (
            this.productoEditando?.SClave === producto.SClave
          ) {
            this.limpiarFormulario();
          }

          this.cargarProductos();
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error);
        }
      });
    }

    limpiarFormulario(): void {
      this.productoEditando = null;
      this.productoForm.reset();
    }

    mostrarError(error: HttpErrorResponse): void {
      this.mensajeError =
        error.error?.message ||
        'No fue posible completar la operación.';
    }
    exportarPdf(): void {

    if (this.productos.length === 0) {
      this.mensajeError = 'No hay productos para exportar.';
      return;
    }

    const documento = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    documento.setFontSize(18);
    documento.text(
      'Reporte de productos',
      14,
      16
    );

    documento.setFontSize(10);
    documento.text(
      `Fecha de exportación: ${new Date().toLocaleString('es-MX')}`,
      14,
      23
    );

    const filas = this.productos.map(producto => [
      producto.SCodigo,
      producto.SProducto,
      producto.SMarca,
      `$${Number(producto.DPrecio).toFixed(2)}`,
      producto.TFechaCap || '-',
      producto.TFechaMod || '-'
    ]);

    autoTable(documento, {
      startY: 29,
      head: [[
        'Código',
        'Producto',
        'Marca',
        'Precio',
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
        fontSize: 9,
        cellPadding: 3
      }
    });

    documento.save('productos.pdf');
  }

  exportarExcel(): void {

    if (this.productos.length === 0) {
      this.mensajeError = 'No hay productos para exportar.';
      return;
    }

    const datosExcel = this.productos.map(producto => ({
      Código: producto.SCodigo,
      Producto: producto.SProducto,
      Marca: producto.SMarca,
      Precio: Number(producto.DPrecio),
      Creación: producto.TFechaCap || '',
      Modificación: producto.TFechaMod || ''
    }));

    const hoja = XLSX.utils.json_to_sheet(datosExcel);

    hoja['!cols'] = [
      { wch: 12 },
      { wch: 30 },
      { wch: 25 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 }
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      'Productos'
    );

    XLSX.writeFile(
      libro,
      'productos.xlsx'
    );
  }
}