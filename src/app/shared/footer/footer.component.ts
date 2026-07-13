import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  nombre: string = 'Einar Omar Villegas Ruiz';

  puesto: string = 'Desarrollador Semi Senior .NET';

  telefono: string = '527712405415';

  telefonoTexto: string = '771 240 5415';

  correo: string = 'einaromar08@gmail.com';

  linkedin: string =
    'https://www.linkedin.com/in/einar-omar-villegas-ruiz-2b73a22b1/';

  github: string =
    'https://github.com/EinarOmarVR?tab=repositories';

  anioActual: number = new Date().getFullYear();

}