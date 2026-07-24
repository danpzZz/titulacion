import {Routes} from '@angular/router';
import {EnrollmentListComponent} from '@modules/core/secretary/enrollment/components/enrollment-list/enrollment-list.component';
import {EnrollmentDetailListComponent} from '@modules/core/secretary/enrollment/components/enrollment-detail-list/enrollment-detail-list.component';
import {EnrollmentDetailFormComponent} from '@modules/core/secretary/enrollment/components/enrollment-detail-form/enrollment-detail-form.component';

export default [
    {
        path: 'secretary/enrollments',
        loadComponent: () => EnrollmentListComponent,
    },
    {
        path: 'secretary/enrollments/:enrollmentId/enrollment-details',
        loadComponent: () => EnrollmentDetailListComponent,
    },
    {
        path: 'secretary/enrollments/:enrollmentId/enrollment-details/:id',
        loadComponent: () => EnrollmentDetailFormComponent,
    },
] as Routes;
