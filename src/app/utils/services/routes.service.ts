import { Injectable } from '@angular/core';
import { MY_ROUTES } from '@routes';
import { RolesEnum } from '@utils/enums';

/** @deprecated Usar MY_ROUTES directamente en los componentes */
@Injectable({ providedIn: 'root' })
export class RoutesService {
    enrollments(SECRETARY: RolesEnum): string {
        return MY_ROUTES.secretaryPages.enrollment.absolute;
    }
    enrollmentsDetailList(enrollmentId: string): string {
        return MY_ROUTES.secretaryPages.enrollment.detail.absoluteFn(enrollmentId);
    }
    enrollmentsDetailForm(enrollmentId: string, id: string = 'new'): string {
        return MY_ROUTES.secretaryPages.enrollment.form.absoluteFn(enrollmentId, id);
    }
}
