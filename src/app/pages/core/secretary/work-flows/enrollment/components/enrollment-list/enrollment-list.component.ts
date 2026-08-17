import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { BreadcrumbService } from '@layout/service/breadcrumb.service';
import { AppService, CatalogueService, CataloguesHttpService, CustomMessageService } from '@utils/services';
import { CustomIcons } from '@utils/icons/custom-icons';
import { debouncedSignal } from '@utils/helpers';
import { SECRETARY_ROUTES } from '@routes';

import { CatalogueInterface, CareerModel, EnrollmentModel, SchoolPeriodModel, SubjectModel } from '@utils/interfaces';
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
    // ─── Servicios ────────────────────────────────────────────────────────────
    private readonly cataloguesHttpService = inject(CataloguesHttpService); // temporal hasta login real
    protected readonly appService = inject(AppService);
    private readonly router = inject(Router);
    private readonly breadcrumbService = inject(BreadcrumbService);
    private readonly enrollmentService = inject(EnrollmentService);
    private readonly messageService = inject(CustomMessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly catalogueService = inject(CatalogueService); // usar cuando haya login real

    protected readonly store = inject(EnrollmentStore);
    protected readonly CustomIcons = CustomIcons;

    private selectedCareerForDetail: CareerModel | null = null;

    // ─── Datos para los filtros ───────────────────────────────────────────────
    protected schoolPeriods = signal<SchoolPeriodModel[]>([]);
    protected careers = signal<CareerModel[]>([]);
    protected subjects = signal<SubjectModel[]>([]);
    protected enrollmentStates = signal<CatalogueInterface[]>([]);

    // ─── Estado del drawer de acciones ────────────────────────────────────────
    protected isButtonActionsEnabled = false;
    protected isMoreActionsEnabled = false;
    protected buttonActions = signal<MenuItem[]>([]);

    // ─── Buscador con debounce ────────────────────────────────────────────────
    protected readonly search = signal('');
    private readonly debouncedSearch = debouncedSignal(this.search);

    // ─── Acciones de descarga (menú secundario) ───────────────────────────────
    protected readonly moreActions: MenuItem[] = [
        {
            label: 'Matriculados por Carrera', icon: CustomIcons.DOWNLOAD_SOLID, command: () => {
                this.isMoreActionsEnabled = false;
                this.downloadByCareer();
            }
        },
        {
            label: 'Matriculados por Periodo', icon: CustomIcons.DOWNLOAD_SOLID, command: () => {
                this.isMoreActionsEnabled = false;
                this.downloadBySchoolPeriod();
            }
        },
        {
            label: 'Asignaturas por Periodo', icon: CustomIcons.DOWNLOAD_SOLID, command: () => {
                this.isMoreActionsEnabled = false;
                this.downloadDetailsBySchoolPeriod();
            }
        },
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
        this.loadEnrollmentStates();
    }
    protected onSearchInput(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value);
    }

    // ─── Carga inicial de datos ───────────────────────────────────────────────

    private loadSchoolPeriods(): void {
        this.enrollmentService.findAllSchoolPeriods().subscribe({
            next: (periods: SchoolPeriodModel[]) => {
                this.schoolPeriods.set(periods);
                this.enrollmentService.findOpenSchoolPeriod().subscribe({
                    next: (open: SchoolPeriodModel) => {
                        if (open) {
                            this.store.updateFilter('schoolPeriod', open);
                            this.store.setOpenSchoolPeriod(open.id);
                        }
                    }
                });
            },
            error: () => {
                // TEMPORAL: el endpoint /core/shared/school-periods aún no existe.
                // Se fuerza el periodo real de pruebas para poder probar el flujo.
                // Quitar cuando el backend implemente el endpoint.
                this.store.updateFilter('schoolPeriod', {
                    id: '64712a47-6566-4ec2-a3bc-8f82a3720d65',
                    name: 'JULIO 2026 - SEPTIEMBRE 2026',
                } as SchoolPeriodModel);
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
                    this.loadSubjects(list[0].id);
                }
            }
        });
    }

    // Asignaturas de la carrera — llenan el filtro "Todas las Asignaturas" 
    private loadSubjects(careerId: string): void {
        this.enrollmentService.findSubjectsByCareer(careerId).subscribe({
            next: (list: SubjectModel[]) => this.subjects.set(list)
        });
    }

    // ─── Catálogos — TEMPORAL hasta login real ────────────────────────────────
    // CatalogueService.findByType() requiere que el backend haya guardado los
    // catálogos en sessionStorage durante el login. Sin login, devuelve vacío.
    // Al conectar el backend con login, descomentar el bloque de CatalogueService
    // y eliminar las llamadas a cataloguesHttpService.
    //
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

    private loadEnrollmentStates(): void {
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_state)
            .subscribe({
                next: v => this.enrollmentStates.set(
                    [...v as CatalogueInterface[]].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                )
            });
    }

    // ─── Petición principal ───────────────────────────────────────────────────
    findEnrollments(page: number = 0): void {
        if (!this.store.canSearch()) return;
        const { career, schoolPeriod, subject, enrollmentState, search } = this.store.filters();
        this.appService.showLoading();
        this.enrollmentService
            .findEnrollmentsByCareer(career!.id, schoolPeriod!.id, subject?.id, enrollmentState?.id, page, search)
            .subscribe({
                next: response => {
                    this.store.setItems(response.data, response.pagination!);
                    this.appService.hideLoading();
                },
                error: () => this.appService.hideLoading(),
            });
    }

    // ─── Acciones de cambio de estado ─────────────────────────────────────────

    enroll(id: string): void {
        this.enrollmentService.enroll(id).subscribe({
            next: () => {
                this.isButtonActionsEnabled = false;
                this.findEnrollments();
            }
        });
    }

    approve(id: string): void {
        this.enrollmentService.approve(id).subscribe({
            next: () => {
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
                        this.isButtonActionsEnabled = false;
                        this.findEnrollments();
                    }
                });
            }
        });
    }

    downloadCertificate(enrollment: EnrollmentModel): void {
        this.isButtonActionsEnabled = false;
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

    // ─── Selección de item — construye el drawer de acciones ──────────────────
    selectItem(item: EnrollmentModel): void {
        this.store.selectItem(item);
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

        const isActivePeriod = this.store.isSchoolPeriodOpen(item.schoolPeriod?.id);

        const actions: MenuItem[] = [];

        // Asignaturas siempre visible, sin importar el estado 
        actions.push({
            label: isActivePeriod ? 'Asignaturas' : 'Ver Asignaturas', icon: CustomIcons.BOOK_SOLID,
            command: () => {
                this.isButtonActionsEnabled = false;
                this.goToDetails(item.id);
            }
        });

        if (isActivePeriod) {
            // ─── Periodo activo — cada estado permite avanzar o revertir un paso
            if (isRegistered || isRequested) {
                actions.push({ label: 'Aprobar', icon: CustomIcons.CHECK_SOLID, command: () => this.approve(item.id) });
                actions.push({ label: 'Rechazar', icon: CustomIcons.CIRCLE_XMARK_SOLID, command: () => this.reject(item.id) });
            }
            if (isApproved) {
                actions.push({ label: 'Matricular', icon: CustomIcons.STAR_SOLID, command: () => this.enroll(item.id) });
                actions.push({ label: 'Rechazar', icon: CustomIcons.CIRCLE_XMARK_SOLID, command: () => this.reject(item.id) });
            }
            if (isEnrolled) {
                actions.push({ label: 'Descargar Certificado', icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadCertificate(item) });
                actions.push({ label: 'Anular Matrícula', icon: CustomIcons.BAN_SOLID, command: () => this.revoke(item.id) });
                actions.push({ label: 'Aprobar', icon: CustomIcons.CHECK_SOLID, command: () => this.approve(item.id) });
            }
            if (isRejected) {
                actions.push({ label: 'Aprobar', icon: CustomIcons.CHECK_SOLID, command: () => this.approve(item.id) });
            }
            if (isRevoked) {
                actions.push({ label: 'Matricular', icon: CustomIcons.STAR_SOLID, command: () => this.enroll(item.id) });
            }
        } else {
            // ─── Periodo histórico — solo consulta, certificado si terminó matriculado ──
            if (isEnrolled) {
                actions.push({
                    label: 'Descargar Certificado', icon: CustomIcons.DOWNLOAD_SOLID,
                    command: () => this.downloadCertificate(item)
                });
            }
        }

        this.buttonActions.set(actions);
        this.isButtonActionsEnabled = true;
    }

    paginate(event: { page?: number }): void { this.findEnrollments(event.page ?? 0); }

    goToDetails(enrollmentId: string): void {
        this.router.navigateByUrl(SECRETARY_ROUTES.enrollment.detail.absoluteFn(enrollmentId));
    }

    // Muestra todos los códigos de asignatura de la matrícula. 
    protected getSubjectCodes(row: EnrollmentModel): string {
        const codes = (row.enrollmentDetails ?? [])
            .map(d => d.subject?.code)
            .filter((code): code is string => !!code);
        return codes.length > 0 ? codes.join(', ') : '—';
    }
}