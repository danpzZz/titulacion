import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MenuItem} from 'primeng/api';

import {BreadcrumbService} from '@layout/service/breadcrumb.service';
import {CustomMessageService} from '@utils/services/custom-message.service';
import {CustomIcons} from '@utils/icons/custom-icons';
import {BreadcrumbEnum, CatalogueEnrollmentStateEnum} from '@utils/enums';
import {MY_ROUTES} from '@routes';
import {EnrollmentDetailModel} from '@models/core';
import {EnrollmentService} from '../../enrollment.service';
import {EnrollmentStore} from '../../enrollment.store';
import {ButtonActionComponent} from '@utils/components/button-action/button-action.component';
import {editButtonAction} from '@utils/components/button-action/consts';

import {ButtonModule} from 'primeng/button';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputTextModule} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {CommonModule} from '@angular/common';
import {EnrollmentStatePipe} from '@utils/pipes/enrollment-state.pipe';
import {AcademicStateSeverityPipe} from '@utils/pipes/academic-state-severity.pipe';

@Component({
    selector: 'app-enrollment-detail-list',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, InputGroupModule, InputGroupAddonModule,
        InputTextModule, TableModule, Tag,
        EnrollmentStatePipe, AcademicStateSeverityPipe, ButtonActionComponent,
    ],
    templateUrl: './enrollment-detail-list.component.html',
})
export class EnrollmentDetailListComponent implements OnInit {
    private readonly route               = inject(ActivatedRoute);
    private readonly router              = inject(Router);
    private readonly breadcrumbService   = inject(BreadcrumbService);
    private readonly enrollmentService   = inject(EnrollmentService);
    private readonly messageService      = inject(CustomMessageService);
    private readonly confirmationService = inject(ConfirmationService);
    protected readonly store             = inject(EnrollmentStore);

    protected readonly CustomIcons = CustomIcons;

    protected enrollmentId           = signal('');
    protected items                  = signal<EnrollmentDetailModel[]>([]);
    protected isLoading              = signal(false);
    protected isButtonActionsEnabled = false;
    protected buttonActions          = signal<MenuItem[]>([]);
    protected canModify              = signal(true);

    protected readonly columns = [
        {field: 'academicPeriod',        header: 'Periodo Académico'},
        {field: 'subject',               header: 'Asignatura'},
        {field: 'number',                header: 'Nº Matrícula'},
        {field: 'workday',               header: 'Horario'},
        {field: 'parallel',              header: 'Paralelo'},
        {field: 'type',                  header: 'Tipo'},
        {field: 'enrollmentDetailState', header: 'Estado'},
        {field: 'finalGrade',            header: 'Calificación'},
        {field: 'finalAttendance',       header: 'Asistencia'},
        {field: 'academicState',         header: 'Estado Académico'},
    ];

    constructor() {
        // Breadcrumb: Matrículas (link) > Asignaturas (actual, sin link)
        // enrollmentId aún no está disponible en constructor, se setea en ngOnInit
    }

    ngOnInit(): void {
        this.enrollmentId.set(this.route.snapshot.params['enrollmentId']);

        // Breadcrumb con link de vuelta a la lista
        this.breadcrumbService.setItems([
            {
                label: BreadcrumbEnum.ENROLLMENTS,
                routerLink: MY_ROUTES.secretaryPages.enrollment.absolute
            },
            {label: BreadcrumbEnum.ENROLLMENT_DETAILS},
        ]);

        // Verificar si la matrícula padre permite modificaciones
        const parentCode = this.store.selectedItem()?.enrollmentState?.state?.code ?? '';
        this.canModify.set(
            parentCode !== CatalogueEnrollmentStateEnum.REVOKED &&
            parentCode !== CatalogueEnrollmentStateEnum.REJECTED
        );

        this.loadDetails();
    }

    loadDetails(): void {
        this.isLoading.set(true);
        this.enrollmentService.findDetailsByEnrollment(this.enrollmentId()).subscribe({
            next: items => {this.items.set(items); this.isLoading.set(false);},
            error: ()   => this.isLoading.set(false),
        });
    }

    enroll(id: string): void {
        this.enrollmentService.enrollDetail(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Matriculado', detail: 'La asignatura fue matriculada'});
            this.isButtonActionsEnabled = false;
            this.loadDetails();
        });
    }
    approve(id: string): void {
        this.enrollmentService.approveDetail(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Aprobado', detail: 'La asignatura fue aprobada'});
            this.isButtonActionsEnabled = false;
            this.loadDetails();
        });
    }
    reject(id: string): void {
        this.confirmationService.confirm({
            key: 'confirmdialog',
            message: '¿Está seguro de rechazar esta asignatura?',
            header: 'Rechazar Asignatura',
            icon: CustomIcons.CIRCLE_XMARK_SOLID,
            rejectButtonProps: {label: 'Cancelar', severity: 'secondary', text: true},
            acceptButtonProps: {label: 'Sí, Rechazar', severity: 'danger'},
            accept: () => {
                this.enrollmentService.rejectDetail(id).subscribe(() => {
                    this.messageService.showSuccess({summary: 'Rechazado', detail: 'La asignatura fue rechazada'});
                    this.isButtonActionsEnabled = false;
                    this.loadDetails();
                });
            }
        });
    }
    revoke(id: string): void {
        this.confirmationService.confirm({
            key: 'confirmdialog',
            message: '¿Está seguro de anular esta asignatura?',
            header: 'Anular Asignatura',
            icon: CustomIcons.BAN_SOLID,
            rejectButtonProps: {label: 'Cancelar', severity: 'secondary', text: true},
            acceptButtonProps: {label: 'Sí, Anular', severity: 'danger'},
            accept: () => {
                this.enrollmentService.revokeDetail(id).subscribe(() => {
                    this.messageService.showSuccess({summary: 'Anulado', detail: 'La asignatura fue anulada'});
                    this.isButtonActionsEnabled = false;
                    this.loadDetails();
                });
            }
        });
    }
    remove(id: string): void {
        this.confirmationService.confirm({
            key: 'confirmdialog',
            message: '¿Está seguro de eliminar esta asignatura? Esta acción no se puede deshacer.',
            header: 'Eliminar Asignatura',
            icon: CustomIcons.TRASH_CAN_SOLID,
            rejectButtonProps: {label: 'Cancelar', severity: 'secondary', text: true},
            acceptButtonProps: {label: 'Sí, Eliminar', severity: 'danger'},
            accept: () => {
                this.enrollmentService.removeDetail(id).subscribe(() => {
                    this.messageService.showSuccess({summary: 'Eliminado', detail: 'La asignatura fue eliminada'});
                    this.isButtonActionsEnabled = false;
                    this.items.update(items => items.filter(i => i.id !== id));
                });
            }
        });
    }

    selectItem(item: EnrollmentDetailModel): void {
        const code         = item.enrollmentDetailState?.state?.code ?? '';
        const isRegistered = code === 'registered';
        const isRequested  = code === CatalogueEnrollmentStateEnum.REQUESTED;
        const isApproved   = code === CatalogueEnrollmentStateEnum.APPROVED;
        const isEnrolled   = code === CatalogueEnrollmentStateEnum.ENROLLED;
        const isRejected   = code === CatalogueEnrollmentStateEnum.REJECTED;
        const isRevoked    = code === CatalogueEnrollmentStateEnum.REVOKED;

        const actions: MenuItem[] = [];

        // Editar — siempre disponible
        actions.push({
            ...editButtonAction,
            command: () => {setTimeout(() => this.goToEdit(item.id), 200);}
        });

        if (this.canModify()) {
            // Aprobar — Inscrito o Solicitud Enviada
            if (isRegistered || isRequested) {
                actions.push({label: 'Aprobar', icon: CustomIcons.CHECK_SOLID,
                    command: () => this.approve(item.id)});
            }

            // Matricular — solo Aprobado
            if (isApproved) {
                actions.push({label: 'Matricular', icon: CustomIcons.BOOK_SOLID,
                    command: () => this.enroll(item.id)});
            }

            // Rechazar — Inscrito, Solicitud Enviada o Aprobado
            if (isRegistered || isRequested || isApproved) {
                actions.push({label: 'Rechazar', icon: CustomIcons.CIRCLE_XMARK_SOLID,
                    command: () => this.reject(item.id)});
            }

            // Anular — Aprobado o Matriculado
            if (isApproved || isEnrolled) {
                actions.push({label: 'Anular', icon: CustomIcons.BAN_SOLID,
                    command: () => this.revoke(item.id)});
            }

            // Eliminar — Inscrito, Rechazado o Anulado
            if (isRegistered || isRejected || isRevoked) {
                actions.push({label: 'Eliminar', icon: CustomIcons.TRASH_CAN_SOLID,
                    command: () => this.remove(item.id)});
            }
        }

        this.buttonActions.set(actions);
        this.isButtonActionsEnabled = true;
    }

    goToCreate(): void {
        this.router.navigate([
            MY_ROUTES.secretaryPages.enrollment.form.absoluteFn(this.enrollmentId(), 'new')
        ]);
    }
    goToEdit(id: string): void {
        this.router.navigate([
            MY_ROUTES.secretaryPages.enrollment.form.absoluteFn(this.enrollmentId(), id)
        ]);
    }
}
