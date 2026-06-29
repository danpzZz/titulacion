import {Pipe, PipeTransform} from '@angular/core';

/** Convierte el código de estado académico en la severidad de p-tag */
@Pipe({name: 'academicStateSeverity', standalone: true})
export class AcademicStateSeverityPipe implements PipeTransform {
    transform(code: string | undefined): string {
        switch (code) {
            case 'approved':    return 'success';
            case 'failed':      return 'danger';
            case 'withdrawn':   return 'warning';
            default:            return 'secondary';
        }
    }
}
