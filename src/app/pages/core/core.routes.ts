import {Routes} from '@angular/router';
import {EnrollmentListComponent} from '@modules/core/secretary/enrollment/components/enrollment-list/enrollment-list.component';
import {EnrollmentDetailListComponent} from '@modules/core/secretary/enrollment/components/enrollment-detail-list/enrollment-detail-list.component';
import {EnrollmentContainerComponent} from '@modules/core/secretary/enrollment/components/enrollment-container/enrollment-container.component';

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
        loadComponent: () => EnrollmentContainerComponent,
    },
] as Routes;
