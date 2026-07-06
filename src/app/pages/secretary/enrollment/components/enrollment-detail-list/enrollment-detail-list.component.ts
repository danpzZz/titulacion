import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MenuItem} from 'primeng/api';

import {BreadcrumbService} from '@utils/services/breadcrumb.service';
import {CustomMessageService} from '@utils/services/custom-message.service';
import {RoutesService} from '@utils/services/routes.service';
import {CustomIcons} from '@utils/icons/custom-icons';
import {BreadcrumbEnum} from '@utils/enums';
import {EnrollmentDetailModel} from '@models/core';
import {EnrollmentService} from '../../enrollment.service';
import {ButtonActionComponent} from '@utils/components/button-action/button-action.component';

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
    private readonly route             = inject(ActivatedRoute);
    private readonly router            = inject(Router);
    private readonly routesService     = inject(RoutesService);
    private readonly breadcrumbService = inject(BreadcrumbService);
    private readonly enrollmentService = inject(EnrollmentService);
    private readonly messageService    = inject(CustomMessageService);

    protected readonly CustomIcons = CustomIcons;

    protected enrollmentId           = signal('');
    protected items                  = signal<EnrollmentDetailModel[]>([]);
    protected isLoading              = signal(false);
    protected isButtonActionsEnabled = false;
    protected buttonActions          = signal<MenuItem[]>([]);

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

    ngOnInit(): void {
        this.enrollmentId.set(this.route.snapshot.params['enrollmentId']);
        this.breadcrumbService.setItems([
            {label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments()]},
            {label: 'Detalle de Matrícula'},
        ]);
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
            this.loadDetails();
        });
    }
    revoke(id: string): void {
        this.enrollmentService.revokeDetail(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Anulado', detail: 'La asignatura fue anulada'});
            this.loadDetails();
        });
    }
    approve(id: string): void {
        this.enrollmentService.approveDetail(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Aprobado', detail: 'La asignatura fue aprobada'});
            this.loadDetails();
        });
    }
    reject(id: string): void {
        this.enrollmentService.rejectDetail(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Rechazado', detail: 'La asignatura fue rechazada'});
            this.loadDetails();
        });
    }
    remove(id: string): void {
        if (confirm('¿Desea eliminar esta asignatura?')) {
            this.enrollmentService.removeDetail(id).subscribe(() => {
                this.items.update(items => items.filter(i => i.id !== id));
            });
        }
    }

    selectItem(item: EnrollmentDetailModel): void {
        this.buttonActions.set([
            {label: 'Editar',    icon: CustomIcons.PENCIL_SOLID,      command: () => {setTimeout(() => this.goToEdit(item.id), 200);}},
            {label: 'Matricular',icon: CustomIcons.BOOK_SOLID,         command: () => this.enroll(item.id)},
            {label: 'Anular',    icon: CustomIcons.BAN_SOLID,          command: () => this.revoke(item.id)},
            {label: 'Aprobar',   icon: CustomIcons.CHECK_SOLID,        command: () => this.approve(item.id)},
            {label: 'Rechazar',  icon: CustomIcons.CIRCLE_XMARK_SOLID, command: () => this.reject(item.id)},
            {label: 'Eliminar',  icon: CustomIcons.TRASH_CAN_SOLID,    command: () => this.remove(item.id)},
        ]);
        this.isButtonActionsEnabled = true;
    }

    goToCreate(): void {
        this.router.navigate([this.routesService.enrollmentsDetailForm(this.enrollmentId()), 'new']);
    }
    goToEdit(id: string): void {
        this.router.navigate([this.routesService.enrollmentsDetailForm(this.enrollmentId()), id]);
    }
}
