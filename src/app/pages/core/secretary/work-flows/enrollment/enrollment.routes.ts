import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./components/enrollment-list/enrollment-list.component')
                .then(m => m.EnrollmentListComponent),
    },
    {
        path: ':enrollmentId/enrollment-details',
        loadComponent: () =>
            import('./components/enrollment-detail-list/enrollment-detail-list.component')
                .then(m => m.EnrollmentDetailListComponent),
    },
    {
        path: ':enrollmentId/enrollment-details/:id',
        loadComponent: () =>
            import('./components/enrollment-detail-form/enrollment-detail-form.component')
                .then(m => m.EnrollmentDetailFormComponent),
    },
] as Routes;