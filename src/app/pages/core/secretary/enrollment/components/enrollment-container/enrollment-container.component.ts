import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { FormRegistryService } from '@utils/services/form-registry.service';
import { CustomIcons } from '@utils/icons/custom-icons';
import { BreadcrumbService } from '@layout/service/breadcrumb.service';
import { CustomMessageService } from '@utils/services';
import { EnrollmentStore } from '../../enrollment.store';
import { EnrollmentService } from '../../enrollment.service';
import { BreadcrumbEnum } from '@utils/enums';
import { SECRETARY_ROUTES } from '@routes';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-enrollment-container',
    imports: [Button],
    templateUrl: './enrollment-container.component.html'
})
export class EnrollmentContainerComponent implements OnInit {
    private readonly breadcrumbService = inject(BreadcrumbService);
    private readonly formRegistryService = inject(FormRegistryService);
    private readonly messageService = inject(CustomMessageService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    protected readonly enrollmentStore = inject(EnrollmentStore);
    protected readonly enrollmentService = inject(EnrollmentService);
    protected readonly CustomIcons = CustomIcons;

    protected id = '';

    constructor() {
        this.breadcrumbService.setItems([
            { label: BreadcrumbEnum.ENROLLMENTS, routerLink: SECRETARY_ROUTES.enrollment.absolute },
            { label: BreadcrumbEnum.FORM },
        ]);
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.params['id'] ?? 'new';
        if (this.id !== 'new') this.loadData();
    }

    private loadData(): void {
        this.enrollmentService.findEnrollment(this.id).subscribe({
            next: response => {
                this.enrollmentStore.updateSection('enrollmentForm', response as any);
            }
        });
    }

    async onSubmit(): Promise<void> {
        if (this.formRegistryService.hasErrors()) {
            this.messageService.showFormErrors(this.formRegistryService.errors());
            return;
        }
        const payload = this.enrollmentStore.enrollmentForm();
        if (this.id === 'new') {
            this.enrollmentService.createEnrollment(payload).subscribe({
                next: () => this.router.navigateByUrl(SECRETARY_ROUTES.enrollment.absolute)
            });
        } else {
            this.enrollmentService.updateEnrollment(this.id, payload).subscribe({
                next: () => this.router.navigateByUrl(SECRETARY_ROUTES.enrollment.absolute)
            });
        }
    }
}
