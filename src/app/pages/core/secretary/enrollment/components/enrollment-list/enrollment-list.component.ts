import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { BreadcrumbService } from '@layout/service/breadcrumb.service';
import { AppService, CatalogueService, CataloguesHttpService, CustomMessageService } from '@utils/services';
import { CustomIcons } from '@utils/icons/custom-icons';
import { debouncedSignal } from '@utils/helpers';
import { SECRETARY_ROUTES } from '@routes';

import { CatalogueInterface, CareerModel, EnrollmentModel, SchoolPeriodModel } from '@utils/interfaces';
import { BreadcrumbEnum, CatalogueEnrollmentStateEnum, CatalogueTypeEnum } from '@utils/enums';
import { ButtonActionComponent } from '@utils/components/button-action/button-action.component';
import { EnrollmentStore } from '../../enrollment.store';
import { EnrollmentService } from '../../enrollment.service';

import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { EnrollmentStatePipe } from '@utils/pipes/enrollment-state.pipe';

@Component({
    selector: 'app-enrollment-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, Select, InputGroupModule, InputGroupAddonModule,
        InputTextModule, PaginatorModule, TableModule, Tag,
        TooltipModule, EnrollmentStatePipe, ButtonActionComponent,
    ],
    templateUrl: './enrollment-list.component.html',
})
export class EnrollmentListComponent implements OnInit {


    private readonly cataloguesHttpService = inject(CataloguesHttpService);

    protected readonly appService = inject(AppService);
    private readonly router = inject(Router);
    private readonly breadcrumbService = inject(BreadcrumbService);
    private readonly enrollmentService = inject(EnrollmentService);
    private readonly messageService = inject(CustomMessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly catalogueService = inject(CatalogueService);

    protected readonly store = inject(EnrollmentStore);
    protected readonly CustomIcons = CustomIcons;

    // Career para guardar la seleccionada al navegar a asignaturas
    private selectedCareerForDetail: CareerModel | null = null;

    protected schoolPeriods = signal<SchoolPeriodModel[]>([]);
    protected careers = signal<CareerModel[]>([]);
    protected academicPeriods = signal<CatalogueInterface[]>([]);
    protected enrollmentStates = signal<CatalogueInterface[]>([]);

    protected isButtonActionsEnabled = false;
    protected isMoreActionsEnabled = false;
    protected buttonActions = signal<MenuItem[]>([]);

    protected readonly search = signal('');
    private readonly debouncedSearch = debouncedSignal(this.search);

    protected readonly moreActions: MenuItem[] = [
        { label: 'Matriculados por Carrera', icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadByCareer() },
        { label: 'Matriculados por Periodo', icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadBySchoolPeriod() },
        { label: 'Asignaturas por Periodo', icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadDetailsBySchoolPeriod() },
    ];

    constructor() {
        this.breadcrumbService.setItems([{ label: BreadcrumbEnum.ENROLLMENTS }]);

        effect(() => {
            const filters = this.store.filters();
            if (filters.schoolPeriod && filters.career) {
                this.findEnrollments();
            }
        });

        effect(() => {
            const term = this.debouncedSearch();
            if (this.store.canSearch()) {
                this.store.updateFilter('search', term);
                this.findEnrollments();
            }
        });
    }

    ngOnInit(): void {
        this.loadSchoolPeriods();
        this.loadCareers();
        this.loadAcademicPeriods();
        this.loadEnrollmentStates();
    }

    protected onSearchInput(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value);
    }

    private loadSchoolPeriods(): void {
        this.enrollmentService.findAllSchoolPeriods().subscribe({
            next: (periods: SchoolPeriodModel[]) => {
                this.schoolPeriods.set(periods);
                this.enrollmentService.findOpenSchoolPeriod().subscribe({
                    next: (open: SchoolPeriodModel) => {
                        if (open) this.store.updateFilter('schoolPeriod', open);
                    }
                });
            }
        });
    }

    private loadCareers(): void {
        this.enrollmentService.findAllCareers().subscribe({
            next: (list: CareerModel[]) => {
                this.careers.set(list);
                if (list.length === 1) {
                    this.selectedCareerForDetail = list[0];
                    this.store.updateFilter('career', list[0]);
                }
            }
        });
    }

    // Catálogos con CatalogueService — síncrono, sin subscribe
    // private loadAcademicPeriods(): void {
    //     this.academicPeriods.set(
    //         this.catalogueService.findByType(CatalogueTypeEnum.enrollment_academic_period)
    //     );
    // }

    // private loadEnrollmentStates(): void {
    //     this.enrollmentStates.set(
    //         [...this.catalogueService.findByType(CatalogueTypeEnum.enrollment_state)]
    //             .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')));
    // }


    private loadAcademicPeriods(): void {
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_academic_period)
            .subscribe({ next: v => this.academicPeriods.set(v as CatalogueInterface[]) });
    }

    private loadEnrollmentStates(): void {
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_state)
            .subscribe({
                next: v => this.enrollmentStates.set(
                    [...v as CatalogueInterface[]].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                )
            });
    }

    findEnrollments(page: number = 0): void {
        if (!this.store.canSearch()) return;
        const { career, schoolPeriod, academicPeriod, enrollmentState, search } = this.store.filters();
        this.appService.showLoading();
        this.enrollmentService
            .findEnrollmentsByCareer(career!.id, schoolPeriod!.id, academicPeriod?.id, enrollmentState?.id, page, search)
            .subscribe({
                next: response => {
                    this.store.setItems(response.data, response.pagination!);
                    this.appService.hideLoading();
                },
                error: () => this.appService.hideLoading(),
            });
    }

    enroll(id: string): void {
        this.enrollmentService.enroll(id).subscribe({
            next: () => {
                this.messageService.showSuccess({ summary: 'Matriculado', detail: 'El estudiante fue matriculado correctamente' });
                this.isButtonActionsEnabled = false;
                this.findEnrollments();
            }
        });
    }

    approve(id: string): void {
        this.enrollmentService.approve(id).subscribe({
            next: () => {
                this.messageService.showSuccess({ summary: 'Aprobada', detail: 'La solicitud fue aprobada' });
                this.isButtonActionsEnabled = false;
                this.findEnrollments();
            }
        });
    }

    reject(id: string): void {
        this.confirmationService.confirm({
            key: 'confirmdialog',
            message: '¿Está seguro de rechazar esta matrícula?',
            header: 'Rechazar Matrícula',
            icon: CustomIcons.CIRCLE_XMARK_SOLID,
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
            acceptButtonProps: { label: 'Sí, Rechazar', severity: 'danger' },
            accept: () => {
                this.enrollmentService.reject(id).subscribe({
                    next: () => {
                        this.messageService.showSuccess({ summary: 'Rechazada', detail: 'La solicitud fue rechazada' });
                        this.isButtonActionsEnabled = false;
                        this.findEnrollments();
                    }
                });
            }
        });
    }

    revoke(id: string): void {
        this.confirmationService.confirm({
            key: 'confirmdialog',
            message: '¿Está seguro de anular esta matrícula? Esta acción afectará también las asignaturas.',
            header: 'Anular Matrícula',
            icon: CustomIcons.BAN_SOLID,
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
            acceptButtonProps: { label: 'Sí, Anular', severity: 'danger' },
            accept: () => {
                this.enrollmentService.revoke(id).subscribe({
                    next: () => {
                        this.messageService.showSuccess({ summary: 'Anulada', detail: 'La matrícula fue anulada' });
                        this.isButtonActionsEnabled = false;
                        this.findEnrollments();
                    }
                });
            }
        });
    }

    downloadCertificate(enrollment: EnrollmentModel): void {
        if (enrollment.enrollmentState?.state?.code === CatalogueEnrollmentStateEnum.ENROLLED) {
            this.enrollmentService.downloadEnrollmentCertificate(enrollment.id, enrollment.student.user.identification);
        } else {
            this.messageService.showError({ summary: 'No disponible', detail: 'El estudiante debe estar matriculado para descargar el certificado' });
        }
    }

    downloadByCareer(): void {
        const { career, schoolPeriod } = this.store.filters();
        if (career && schoolPeriod) this.enrollmentService.downloadEnrollmentsByCareer(career, schoolPeriod.id);
    }
    downloadBySchoolPeriod(): void {
        const sp = this.store.filters().schoolPeriod;
        if (sp) this.enrollmentService.downloadEnrollmentsBySchoolPeriod(sp);
    }
    downloadDetailsBySchoolPeriod(): void {
        const sp = this.store.filters().schoolPeriod;
        if (sp) this.enrollmentService.downloadEnrollmentDetailsBySchoolPeriod(sp);
    }

    selectItem(item: EnrollmentModel): void {
        this.store.selectItem(item);
        // Guardar la carrera del item seleccionado para usarla al navegar a asignaturas
        if (item.career) {
            this.selectedCareerForDetail = item.career;
        }

        const code = item.enrollmentState?.state?.code ?? '';
        const isRegistered = code === 'registered';
        const isRequested = code === CatalogueEnrollmentStateEnum.REQUESTED;
        const isApproved = code === CatalogueEnrollmentStateEnum.APPROVED;
        const isEnrolled = code === CatalogueEnrollmentStateEnum.ENROLLED;
        const isRejected = code === CatalogueEnrollmentStateEnum.REJECTED;
        const isRevoked = code === CatalogueEnrollmentStateEnum.REVOKED;

        const actions: MenuItem[] = [];

        if (!isRevoked && !isRejected) {
            actions.push({
                label: 'Asignaturas', icon: CustomIcons.BOOK_SOLID,
                command: () => {
                    this.isButtonActionsEnabled = false;
                    setTimeout(() => this.goToDetails(item.id), 300);
                }
            });
        }
        if (isRegistered || isRequested) {
            actions.push({ label: 'Aprobar', icon: CustomIcons.CHECK_SOLID, command: () => this.approve(item.id) });
        }
        if (isApproved) {
            actions.push({ label: 'Matricular', icon: CustomIcons.STAR_SOLID, command: () => this.enroll(item.id) });
        }
        if (isRegistered || isRequested || isApproved) {
            actions.push({ label: 'Rechazar', icon: CustomIcons.CIRCLE_XMARK_SOLID, command: () => this.reject(item.id) });
        }
        if (isEnrolled) {
            actions.push({ label: 'Descargar Certificado', icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadCertificate(item) });
        }
        if (isApproved || isEnrolled) {
            actions.push({ label: 'Anular Matrícula', icon: CustomIcons.BAN_SOLID, command: () => this.revoke(item.id) });
        }

        this.buttonActions.set(actions);
        this.isButtonActionsEnabled = true;
    }

    paginate(event: { page?: number }): void { this.findEnrollments(event.page ?? 0); }

    goToDetails(enrollmentId: string): void {
        this.router.navigateByUrl(SECRETARY_ROUTES.enrollment.detail.absoluteFn(enrollmentId));
    }
}
