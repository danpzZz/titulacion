import {Routes} from '@angular/router';
import {MY_ROUTES} from '@routes';
import {UserList, UserForm} from '@adminModule';
import {OtroForm} from "@/pages/admin/components/otro-form/otro-form";

export default [
    {
        path: MY_ROUTES.adminPages.user.base,
        title: 'Listado de Usuarios',
        loadComponent: () => UserList
    },
    {
        path: MY_ROUTES.adminPages.user.form.base, title: 'User Form',
        loadComponent: () => UserForm
    },
    {
        path: MY_ROUTES.adminPages.user.otro.base, title: 'Otro',
        loadComponent: () => OtroForm
    },
] as Routes;
