import {Routes} from '@angular/router';
import {AppLayout} from './app/layout/component/app.layout';
import {MY_ROUTES} from './my-routes';

export const appRoutes: Routes = [
    {
        path: MY_ROUTES.main,
        component: AppLayout,
        children: [
            {
                path: MY_ROUTES.secretaryPages.base,
                children: [
                    {
                        path: MY_ROUTES.secretaryPages.enrollment.base,
                        loadChildren: () =>
                            import('./app/pages/secretary/enrollment/enrollment.routes')
                    }
                ]
            }
        ]
    },
    {path: '', redirectTo: '/main/secretary/enrollments', pathMatch: 'full'},
    {path: '**', redirectTo: '/main/secretary/enrollments'}
];
