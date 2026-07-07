import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MY_ROUTES} from '../../../my-routes';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="layout-menu-container">
            <ul class="layout-menu">
                <li>
                    <a [routerLink]="enrollmentsPath" routerLinkActive="active-route">
                        <i class="pi pi-book mr-2"></i>
                        <span>Matrículas</span>
                    </a>
                </li>
            </ul>
        </div>
    `
})
export class AppMenu {
    readonly enrollmentsPath = MY_ROUTES.secretaryPages.enrollment.absolute;
}
