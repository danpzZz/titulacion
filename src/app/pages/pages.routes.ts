import {Routes} from '@angular/router';
import {MY_ROUTES} from "@routes";

export default [
    {
        path: MY_ROUTES.adminPages.user.base,
        title: 'Users',
        loadChildren: () => import('@/pages/admin/admin.routes')
    },
    {path: '**', redirectTo: '/notfound'}
] as Routes;
