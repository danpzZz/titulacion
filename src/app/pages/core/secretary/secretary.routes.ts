import { Routes } from '@angular/router';

export default [
    {
        path: 'enrollments',
        title: 'Lista de Matriculados',
        loadComponent: () => import('./enrollment/enrollment-list/enrollment-list.component').then(m => m.EnrollmentListComponent)
    },
    {
        path: 'enrollments/:id',
        title: 'Formulario de Matrícula',
        loadComponent: () => import('./enrollment/enrollment-form/enrollment-form.component').then(m => m.EnrollmentFormComponent)
    },
    {
        path: 'enrollments/:enrollmentId/enrollment-details',
        title: 'Asignaturas de Matrícula',
        loadComponent: () => import('./enrollment/enrollment-detail-list/enrollment-detail-list.component').then(m => m.EnrollmentDetailListComponent)
    },
    {
        path: 'enrollments/:enrollmentId/enrollment-details/new',
        title: 'Crear Detalle de Matrícula',
        loadComponent: () => import('./enrollment/enrollment-detail-form/enrollment-detail-form.component').then(m => m.EnrollmentDetailFormComponent)
    },
    {
        path: 'enrollments/:enrollmentId/enrollment-details/:id',
        title: 'Editar Detalle de Matrícula',
        loadComponent: () => import('./enrollment/enrollment-detail-form/enrollment-detail-form.component').then(m => m.EnrollmentDetailFormComponent)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'enrollments'
    }
] as Routes;
