import {Pipe, PipeTransform} from '@angular/core';

type PrimeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null | undefined;

@Pipe({name: 'academicStateSeverity', standalone: true})
export class AcademicStateSeverityPipe implements PipeTransform {
    transform(code: string | undefined): PrimeSeverity {
        switch (code) {
            case 'a':          return 'success';
            case 'approved':   return 'success';
            case 'r':          return 'danger';
            case 'failed':     return 'danger';
            case 'withdrawn':  return 'warn';
            default:           return 'secondary';
        }
    }
}
