import {Routes} from '@angular/router';
import {AppLayout} from '@layout/component/app.layout';
import {MY_ROUTES} from "@routes";

export const appRoutes: Routes = [
    {
        path: MY_ROUTES.main,
        component: AppLayout,
        children: [
            {
                path: MY_ROUTES.adminPages.base,
                loadChildren: () => import('./app/pages/admin/admin.routes')
            },
            {
                path: 'secretary',
                loadChildren: () => import('./app/pages/core/secretary/secretary.routes')
            }
        ]
    },
    {path: '**', redirectTo: '/404'}
];
