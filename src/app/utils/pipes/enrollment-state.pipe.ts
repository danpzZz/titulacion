import {Pipe, PipeTransform} from '@angular/core';

type PrimeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null | undefined;

@Pipe({name: 'enrollmentState', standalone: true})
export class EnrollmentStatePipe implements PipeTransform {
    transform(code: string | undefined): PrimeSeverity {
        switch (code) {
            case 'enrolled':     return 'success';
            case 'approved':     return 'info';
            case 'registered':   return 'secondary';
            case 'request_sent': return 'warn';
            case 'rejected':     return 'danger';
            case 'revoked':      return 'danger';
            default:             return 'secondary';
        }
    }
}
