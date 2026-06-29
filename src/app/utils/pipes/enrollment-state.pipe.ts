import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'enrollmentState', standalone: true})
export class EnrollmentStatePipe implements PipeTransform {
  transform(code: string | undefined): string {
    switch (code) {
      case 'enrolled':      return 'success';   // Matriculado → verde
      case 'approved':      return 'info';       // Aprobado → azul
      case 'registered':    return 'secondary';  // Inscrito → gris
      case 'request_sent':  return 'warn';       // Solicitud enviada → naranja
      case 'rejected':      return 'danger';     // Rechazado → rojo
      case 'revoked':       return 'danger';     // Anulado → rojo
      default:              return 'secondary';
    }
  }
}
