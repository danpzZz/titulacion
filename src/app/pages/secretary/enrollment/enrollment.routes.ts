import {Routes} from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./components/enrollment-list/enrollment-list.component')
        .then(m => m.EnrollmentListComponent),
    title: 'Lista de Matriculados',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/enrollment-form/enrollment-form.component')
        .then(m => m.EnrollmentFormComponent),
    title: 'Matrícula',
  },
  {
    path: ':enrollmentId/enrollment-details',
    loadComponent: () =>
      import('./components/enrollment-detail-list/enrollment-detail-list.component')
        .then(m => m.EnrollmentDetailListComponent),
    title: 'Asignaturas de Matrícula',
  },
  {
    path: ':enrollmentId/enrollment-details/:id',
    loadComponent: () =>
      import('./components/enrollment-detail-form/enrollment-detail-form.component')
        .then(m => m.EnrollmentDetailFormComponent),
    title: 'Asignatura',
  },
] as Routes;
