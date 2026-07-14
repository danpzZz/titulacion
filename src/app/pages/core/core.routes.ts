import {Routes} from '@angular/router';

export default [
    {
        path: 'secretary/enrollments',
        loadChildren: () =>
            import('@modules/core/secretary/enrollment/enrollment.routes'),
    },
] as Routes;
