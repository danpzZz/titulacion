import { Routes } from '@angular/router';
import { MY_ROUTES } from '@routes';

export default [
    { path: MY_ROUTES.authPages.signIn.base, title: 'Login', loadComponent: () => import('./components/sign-in/sign-in.component') },
    { path: MY_ROUTES.authPages.signUp.base, title: 'Registro', loadComponent: () => import('./components/sign-up/sign-up.component') },
    {
        path: MY_ROUTES.authPages.passwordReset.base,
        title: 'Recuperación Cuenta',
        loadComponent: () => import('./components/password-reset/password-reset.component')
    }
] as Routes;
