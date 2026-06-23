import {Routes} from '@angular/router';
import {AppLayout} from '@layout/component/app.layout';
import {MY_ROUTES} from "@routes";

export const appRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: `${MY_ROUTES.main}/${MY_ROUTES.corePages.secretary.base}`
    },
    {
        path: MY_ROUTES.main,
        component: AppLayout,
        children: [
            {
                path: MY_ROUTES.adminPages.base,
                loadChildren: () => import('./app/pages/admin/admin.routes')
            },
            {
                path: MY_ROUTES.corePages.secretary.base,
                loadChildren: () => import('./app/pages/core/secretary/secretary.routes')
            }
        ]
    },
    {path: '**', redirectTo: ''}
];
