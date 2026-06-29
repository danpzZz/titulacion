import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class RoutesService {
    enrollments(_role?: string): string {
        return '/main/secretary/enrollments';
    }
    enrollmentsDetailList(enrollmentId: string, _role?: string): string {
        return `/main/secretary/enrollments/${enrollmentId}/enrollment-details`;
    }
    enrollmentsDetailForm(enrollmentId: string, _role?: string): string {
        return `/main/secretary/enrollments/${enrollmentId}/enrollment-details`;
    }
}
