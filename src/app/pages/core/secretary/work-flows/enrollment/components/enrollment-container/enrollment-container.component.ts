import { Component, computed, inject, input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbService } from '@layout/service/breadcrumb.service';
import { AppService, CustomMessageService } from '@utils/services';
import { FormRegistryService } from '@utils/services/form-registry.service';
import { CustomIcons } from '@utils/icons/custom-icons';
import { SECRETARY_ROUTES } from '@routes';
import { BreadcrumbEnum, CatalogueEnrollmentStateEnum, RoutesEnum } from '@utils/enums';
import { EnrollmentDetailModel } from '@utils/interfaces';

import { EnrollmentStore } from '../../enrollment.store';
import { EnrollmentService } from '../../enrollment.service';
import { EnrollmentDetailFormComponent } from '../enrollment-detail-form/enrollment-detail-form.component';

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-enrollment-container',
    standalone: true,
    imports: [CommonModule, ButtonModule, EnrollmentDetailFormComponent],
    templateUrl: './enrollment-container.component.html',
})
export class EnrollmentContainerComponent implements OnInit, OnDestroy {
    // ─── Parámetros de ruta via input.required ─────────────────────────────────
    public id = input.required<string>();
    public enrollmentId = input.required<string>();

    private readonly router = inject(Router);
    private readonly breadcrumbService = inject(BreadcrumbService);
    private readonly formRegistryService = inject(FormRegistryService);
    private readonly messageService = inject(CustomMessageService);
    protected readonly appService = inject(AppService);
    protected readonly store = inject(EnrollmentStore);
    protected readonly enrollmentService = inject(EnrollmentService);
    protected readonly CustomIcons = CustomIcons;

    protected isNew = computed(() => this.id() === RoutesEnum.NEW);

    // ─── Solo lectura si el período está cerrado o la matrícula fue anulada/
    // rechazada.
    protected readonly isReadOnly = computed(() => {
        const parentCode = this.store.selectedItem()?.enrollmentState?.state?.code ?? '';
        const parentNotRevoked = parentCode !== CatalogueEnrollmentStateEnum.REVOKED &&
            parentCode !== CatalogueEnrollmentStateEnum.REJECTED;
        const isActivePeriod = this.store.isSchoolPeriodOpen(this.store.selectedItem()?.schoolPeriod?.id);
        return !(parentNotRevoked && isActivePeriod);
    });

    ngOnInit(): void {
        this.breadcrumbService.setItems([
            {
                label: BreadcrumbEnum.ENROLLMENTS,
                routerLink: SECRETARY_ROUTES.enrollment.absolute,
            },
            {
                label: BreadcrumbEnum.ENROLLMENT_DETAILS,
                routerLink: SECRETARY_ROUTES.enrollment.detail.absoluteFn(this.enrollmentId()),
            },
            { label: BreadcrumbEnum.FORM },
        ]);
    }

    ngOnDestroy(): void {
        this.store.resetDetailForm();
    }

    onSubmit(): void {
        // ─── Validaciones de negocio (solo al editar) ──────────────────────────
        if (!this.isNew()) {
            const s = this.store.detailFormSection();

            // Si se asigna estado académico, calificación y asistencia son obligatorias
            if (s.academicState && (s.finalGrade === null || s.finalAttendance === null)) {
                this.messageService.showError({
                    summary: 'Campos incompletos',
                    detail: 'Para asignar un estado académico debe ingresar la calificación y la asistencia'
                });
                return;
            }

            if (s.finalGrade !== null && s.finalGrade !== undefined) {
                if (s.finalGrade < 0 || s.finalGrade > 10) {
                    this.messageService.showError({
                        summary: 'Calificación inválida',
                        detail: 'La calificación debe estar entre 0 y 10'
                    });
                    return;
                }
            }
            if (s.finalAttendance !== null && s.finalAttendance !== undefined) {
                if (s.finalAttendance < 0 || s.finalAttendance > 100) {
                    this.messageService.showError({
                        summary: 'Asistencia inválida',
                        detail: 'La asistencia debe estar entre 0 y 100'
                    });
                    return;
                }
            }
        }

        // ─── Validaciones de SignalForms (required, min, max del formulario) ───
        if (this.formRegistryService.hasErrors()) {
            this.messageService.showFormErrors(this.formRegistryService.errors());
            return;
        }

        const payload = this.store.detailFormSection() as unknown as Partial<EnrollmentDetailModel>;

        if (this.isNew()) {
            // Crear — agrega enrollmentId, fecha actual y número automático
            const newPayload = {
                ...payload,
                enrollmentId: this.enrollmentId(),
                date: new Date().toISOString().split('T')[0],
                number: this.store.autoNumber(),
            };
            this.enrollmentService.createDetail(newPayload).subscribe({
                next: created => {

                    this.enrollmentService.sendDetailRequest(created.id, newPayload).subscribe({
                        next: () => {
                            this.store.resetDetailForm();
                            this.back();
                        }
                    });
                }
            });
        } else {
            this.enrollmentService.updateDetail(this.id(), payload).subscribe({
                next: () => this.back()
            });
        }
    }

    back(): void {
        this.router.navigateByUrl(
            SECRETARY_ROUTES.enrollment.detail.absoluteFn(this.enrollmentId())
        );
    }
}