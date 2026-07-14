import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { PerfilesService } from '../../core/services/perfiles.service';
import { StorageService } from '../../core/services/storage.service';
import { UsuariosService } from '../../core/services/usuarios.service';

import { Perfil } from '../../models/perfil.model';
import { Usuario } from '../../models/usuario.model';

interface CodigoPais {
  codigo: string;
  pais: string;
}

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  usuarioForm: FormGroup;

  usuarios: Usuario[] = [];
  perfiles: Perfil[] = [];

  usuarioEditando: Usuario | null = null;

  archivoFoto: File | null = null;
  vistaPreviaFoto: string | null = null;

  cargando = false;
  cargandoPerfiles = false;
  guardando = false;

  mensajeExito = '';
  mensajeError = '';

  puedeEditar = false;
  puedeEliminar = false;

  mostrarPassword = false;

  readonly codigosPais: CodigoPais[] = [
    {
      codigo: '+52',
      pais: 'México'
    },
    {
      codigo: '+1',
      pais: 'Estados Unidos / Canadá'
    },
    {
      codigo: '+34',
      pais: 'España'
    },
    {
      codigo: '+54',
      pais: 'Argentina'
    },
    {
      codigo: '+56',
      pais: 'Chile'
    },
    {
      codigo: '+57',
      pais: 'Colombia'
    },
    {
      codigo: '+51',
      pais: 'Perú'
    }
  ];

  private readonly passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

  constructor(
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private perfilesService: PerfilesService,
    private storageService: StorageService
  ) {
    this.usuarioForm = this.formBuilder.group({
      SNombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      SUsuario: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ]
      ],
      SPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(this.passwordPattern)
        ]
      ],
      SCodigoPais: [
        '+52',
        [
          Validators.required,
          Validators.pattern(/^\+\d{1,4}$/)
        ]
      ],
      STelefono: [
        '',
        [
          Validators.pattern(/^\d{7,15}$/)
        ]
      ],
      SIDPerfil: [''],
      SFotoPerfil: [
        null,
        Validators.required
      ]
    });

    this.puedeEditar =
      this.storageService.tienePermiso('USER_ADDUPD');

    this.puedeEliminar =
      this.storageService.tienePermiso('USER_DELETE');
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPerfiles();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.usuariosService.obtenerUsuarios().subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta.data;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarError(error);
      }
    });
  }

  cargarPerfiles(): void {
    this.cargandoPerfiles = true;

    this.perfilesService.obtenerPerfiles().subscribe({
      next: (respuesta) => {
        this.perfiles = respuesta.data;
        this.cargandoPerfiles = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoPerfiles = false;
        this.mostrarError(error);
      }
    });
  }

  cambiarVisibilidadPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
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

    const limiteBytes = 2 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      this.mensajeError =
        'La fotografía no debe superar los 2 MB.';

      input.value = '';
      return;
    }

    this.mensajeError = '';
    this.archivoFoto = archivo;

    this.usuarioForm.controls['SFotoPerfil']
      .setValue(archivo);

    this.usuarioForm.controls['SFotoPerfil']
      .markAsTouched();

    const lector = new FileReader();

    lector.onload = () => {
      this.vistaPreviaFoto =
        lector.result as string;
    };

    lector.readAsDataURL(archivo);
  }

  quitarFoto(): void {
    this.archivoFoto = null;

    this.vistaPreviaFoto =
      this.usuarioEditando?.SFotoPerfil || null;

    this.usuarioForm.controls['SFotoPerfil']
      .setValue(null);
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const datos = this.crearFormData();

    if (this.usuarioEditando) {
      this.actualizarUsuario(
        this.usuarioEditando.id,
        datos
      );

      return;
    }

    this.crearUsuario(datos);
  }

  crearFormData(): FormData {
    const datos = new FormData();

    const nombre = String(
      this.usuarioForm.controls['SNombre'].value || ''
    ).trim();

    const correo = String(
      this.usuarioForm.controls['SUsuario'].value || ''
    ).trim().toLowerCase();

    const password = String(
      this.usuarioForm.controls['SPassword'].value || ''
    ).trim();

    const codigoPais = String(
      this.usuarioForm.controls['SCodigoPais'].value || '+52'
    ).trim();

    const telefono = String(
      this.usuarioForm.controls['STelefono'].value || ''
    ).replace(/\D/g, '');

    const perfil = String(
      this.usuarioForm.controls['SIDPerfil'].value || ''
    ).trim();

    datos.append('SNombre', nombre);
    datos.append('SUsuario', correo);

    if (password) {
      datos.append('SPassword', password);
    }

    /*
     * El código de país y el teléfono se envían juntos.
     * Ejemplo: +527712405415
     */
    if (telefono) {
      datos.append(
        'STelefono',
        `${codigoPais}${telefono}`
      );
    }

    /*
     * Si no se selecciona un perfil al crear,
     * Laravel asignará el perfil Lector de Productos.
     */
    if (perfil) {
      datos.append('SIDPerfil', perfil);
    }

    if (this.archivoFoto) {
      datos.append(
        'SFotoPerfil',
        this.archivoFoto
      );
    }

    return datos;
  }

  crearUsuario(datos: FormData): void {
    this.usuariosService.crearUsuario(datos).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mensajeExito = respuesta.message;

        this.limpiarFormulario();
        this.cargarUsuarios();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  actualizarUsuario(
    id: string,
    datos: FormData
  ): void {
    this.usuariosService
      .actualizarUsuario(id, datos)
      .subscribe({
        next: (respuesta) => {
          this.guardando = false;
          this.mensajeExito = respuesta.message;

          this.limpiarFormulario();
          this.cargarUsuarios();
        },
        error: (error: HttpErrorResponse) => {
          this.guardando = false;
          this.mostrarError(error);
        }
      });
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioEditando = usuario;

    this.mensajeExito = '';
    this.mensajeError = '';

    this.archivoFoto = null;
    this.vistaPreviaFoto =
      usuario.SFotoPerfil || null;

    const telefonoSeparado =
      this.separarTelefono(usuario.STelefono);

    this.usuarioForm.patchValue({
      SNombre: usuario.SNombre,
      SUsuario: usuario.SUsuario,
      SPassword: '',
      SCodigoPais: telefonoSeparado.codigoPais,
      STelefono: telefonoSeparado.telefono,
      SIDPerfil: usuario.SIDPerfil,
      SFotoPerfil: null
    });

    this.configurarValidacionesEdicion();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  separarTelefono(telefonoCompleto: string | null | undefined): {
    codigoPais: string;
    telefono: string;
  } {
    if (!telefonoCompleto) {
      return {
        codigoPais: '+52',
        telefono: ''
      };
    }

    const telefonoLimpio =
      String(telefonoCompleto).replace(/[^\d+]/g, '');

    /*
     * Se ordenan del código más largo al más corto,
     * para encontrar correctamente el prefijo.
     */
    const codigosOrdenados = [...this.codigosPais]
      .sort(
        (codigoA, codigoB) =>
          codigoB.codigo.length - codigoA.codigo.length
      );

    const codigoEncontrado =
      codigosOrdenados.find(
        item => telefonoLimpio.startsWith(item.codigo)
      );

    if (codigoEncontrado) {
      return {
        codigoPais: codigoEncontrado.codigo,
        telefono: telefonoLimpio.substring(
          codigoEncontrado.codigo.length
        )
      };
    }

    /*
     * Los teléfonos antiguos que no tengan código
     * de país se mostrarán como números de México.
     */
    return {
      codigoPais: '+52',
      telefono: telefonoLimpio.replace(/\D/g, '')
    };
  }

  configurarValidacionesEdicion(): void {
    const passwordControl =
      this.usuarioForm.controls['SPassword'];

    const fotoControl =
      this.usuarioForm.controls['SFotoPerfil'];

    const perfilControl =
      this.usuarioForm.controls['SIDPerfil'];

    passwordControl.setValidators([
      Validators.pattern(this.passwordPattern)
    ]);

    fotoControl.clearValidators();

    perfilControl.setValidators([
      Validators.required
    ]);

    passwordControl.updateValueAndValidity();
    fotoControl.updateValueAndValidity();
    perfilControl.updateValueAndValidity();
  }

  configurarValidacionesCreacion(): void {
    const passwordControl =
      this.usuarioForm.controls['SPassword'];

    const fotoControl =
      this.usuarioForm.controls['SFotoPerfil'];

    const perfilControl =
      this.usuarioForm.controls['SIDPerfil'];

    passwordControl.setValidators([
      Validators.required,
      Validators.pattern(this.passwordPattern)
    ]);

    fotoControl.setValidators([
      Validators.required
    ]);

    /*
     * Es opcional al crear porque Laravel asignará
     * el perfil Lector de Productos si está vacío.
     */
    perfilControl.clearValidators();

    passwordControl.updateValueAndValidity();
    fotoControl.updateValueAndValidity();
    perfilControl.updateValueAndValidity();
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = window.confirm(
      `¿Deseas eliminar al usuario ${usuario.SNombre}?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    this.usuariosService
      .eliminarUsuario(usuario.id)
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito = respuesta.message;

          if (
            this.usuarioEditando?.id === usuario.id
          ) {
            this.limpiarFormulario();
          }

          this.cargarUsuarios();
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error);
        }
      });
  }

  limpiarFormulario(): void {
    this.usuarioEditando = null;
    this.archivoFoto = null;
    this.vistaPreviaFoto = null;
    this.mostrarPassword = false;

    this.usuarioForm.reset({
      SNombre: '',
      SUsuario: '',
      SPassword: '',
      SCodigoPais: '+52',
      STelefono: '',
      SIDPerfil: '',
      SFotoPerfil: null
    });

    this.configurarValidacionesCreacion();
  }

  obtenerNombrePerfil(idPerfil: string): string {
    return this.perfiles.find(
      perfil => perfil.id === idPerfil
    )?.SPerfil || 'Perfil no encontrado';
  }

  mostrarError(error: HttpErrorResponse): void {
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
      'No fue posible completar la operación.';
  }

  exportarPdf(): void {
    if (this.usuarios.length === 0) {
      return;
    }

    const documento = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    documento.setFontSize(18);
    documento.text(
      'Reporte de usuarios',
      14,
      16
    );

    documento.setFontSize(10);
    documento.text(
      `Fecha de exportación: ${new Date().toLocaleString('es-MX')}`,
      14,
      23
    );

    const filas = this.usuarios.map(usuario => [
      usuario.SCodigo,
      usuario.SNombre,
      usuario.SUsuario,
      usuario.STelefono || '-',
      this.obtenerNombrePerfil(usuario.SIDPerfil),
      usuario.TFechaCap || '-',
      usuario.TFechaMod || '-'
    ]);

    autoTable(documento, {
      startY: 29,
      head: [[
        'Código',
        'Nombre',
        'Correo',
        'Teléfono',
        'Perfil',
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

    documento.save('usuarios.pdf');
  }

  exportarExcel(): void {
    if (this.usuarios.length === 0) {
      return;
    }

    const datosExcel = this.usuarios.map(usuario => ({
      Código: usuario.SCodigo,
      Nombre: usuario.SNombre,
      Correo: usuario.SUsuario,
      Teléfono: usuario.STelefono || '',
      Perfil:
        this.obtenerNombrePerfil(usuario.SIDPerfil),
      Creación: usuario.TFechaCap || '',
      Modificación: usuario.TFechaMod || ''
    }));

    const hoja =
      XLSX.utils.json_to_sheet(datosExcel);

    hoja['!cols'] = [
      { wch: 14 },
      { wch: 30 },
      { wch: 35 },
      { wch: 18 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 }
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      'Usuarios'
    );

    XLSX.writeFile(
      libro,
      'usuarios.xlsx'
    );
  }
}