import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MenuItem} from 'primeng/api';

import {BreadcrumbService} from '@utils/services/breadcrumb.service';
import {CustomMessageService} from '@utils/services/custom-message.service';
import {CataloguesHttpService} from '@utils/services/catalogues-http.service';
import {CareersHttpService} from '@utils/services/careers-http.service';
import {CareersService} from '@utils/services/careers.service';
import {SchoolPeriodsHttpService} from '@utils/services/school-periods-http.service';
import {SchoolPeriodsService} from '@utils/services/school-periods.service';
import {RoutesService} from '@utils/services/routes.service';
import {CustomIcons} from '@utils/icons/custom-icons';

import {CatalogueModel, CareerModel, EnrollmentModel, SchoolPeriodModel} from '@models/core';
import {BreadcrumbEnum, CatalogueEnrollmentStateEnum, EnrollmentCatalogueTypeEnum} from '@utils/enums';
import {ButtonActionComponent} from '@utils/components/button-action/button-action.component';
import {EnrollmentStore} from '../../enrollment.store';
import {EnrollmentService} from '../../enrollment.service';

import {ButtonModule} from 'primeng/button';
import {Select} from 'primeng/select';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputTextModule} from 'primeng/inputtext';
import {PaginatorModule} from 'primeng/paginator';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TooltipModule} from 'primeng/tooltip';
import {EnrollmentStatePipe} from '@utils/pipes/enrollment-state.pipe';

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
    private readonly router                   = inject(Router);
    private readonly routesService            = inject(RoutesService);
    private readonly breadcrumbService        = inject(BreadcrumbService);
    private readonly enrollmentService        = inject(EnrollmentService);
    private readonly careersService           = inject(CareersService);
    private readonly careersHttpService       = inject(CareersHttpService);
    private readonly cataloguesHttpService    = inject(CataloguesHttpService);
    private readonly schoolPeriodsHttpService = inject(SchoolPeriodsHttpService);
    private readonly schoolPeriodsService     = inject(SchoolPeriodsService);
    private readonly messageService           = inject(CustomMessageService);

    protected readonly store       = inject(EnrollmentStore);
    protected readonly CustomIcons = CustomIcons;

    protected schoolPeriods    = signal<SchoolPeriodModel[]>([]);
    protected careers          = signal<CareerModel[]>([]);
    protected academicPeriods  = signal<CatalogueModel[]>([]);
    protected enrollmentStates = signal<CatalogueModel[]>([]);

    protected isButtonActionsEnabled = false;
    protected isMoreActionsEnabled   = false;
    protected buttonActions          = signal<MenuItem[]>([]);

    protected readonly moreActions: MenuItem[] = [
        {label: 'Matriculados por Carrera',    icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadByCareer()},
        {label: 'Matriculados por Periodo',    icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadBySchoolPeriod()},
        {label: 'Asignaturas por Periodo',     icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadDetailsBySchoolPeriod()},
        {label: 'Fichas Socioeconómicas',      icon: CustomIcons.DOWNLOAD_SOLID, command: () => this.downloadSocioeconomicForms()},
    ];

    protected readonly columns = [
        {field: 'career',                         sortField: 'career.name',                        header: 'Carrera'},
        {field: 'identification',                 sortField: 'student.user.identification',         header: 'Número de Documento'},
        {field: 'lastname',                       sortField: 'student.user.lastname',               header: 'Apellidos'},
        {field: 'name',                           sortField: 'student.user.name',                   header: 'Nombres'},
        {field: 'type',                           sortField: 'type.name',                           header: 'Tipo de Matrícula'},
        {field: 'academicPeriod',                 sortField: 'academicPeriod.name',                 header: 'Periodo académico'},
        {field: 'workday',                        sortField: 'workday.name',                        header: 'Horario'},
        {field: 'parallel',                       sortField: 'parallel.name',                       header: 'Paralelo'},
        {field: 'enrollmentState',                sortField: 'enrollmentState.state.name',          header: 'Estado'},
    ];

    constructor() {
        this.breadcrumbService.setItems([{label: BreadcrumbEnum.ENROLLMENTS}]);
        effect(() => {
            const filters = this.store.filters();
            if (filters.schoolPeriod && filters.career) {
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

    private loadSchoolPeriods(): void {
        this.schoolPeriodsHttpService.findAll().subscribe((periods: any[]) => {
            this.schoolPeriods.set(periods);
            this.schoolPeriodsHttpService.findOpenSchoolPeriod().subscribe((open: any) => {
                if (open) {
                    this.schoolPeriodsService.openSchoolPeriod = open;
                    this.store.updateFilter('schoolPeriod', open);
                }
            });
        });
    }

    private loadCareers(): void {
        this.careersHttpService.findAll().subscribe((list: any[]) => {
            this.careers.set(list);
            this.careersService.careers = list;
            if (list.length === 1) {
                this.careersService.career = list[0];
                this.store.updateFilter('career', list[0]);
            }
        });
    }

    private loadAcademicPeriods(): void {
        this.cataloguesHttpService
            .findByTypeObservable(EnrollmentCatalogueTypeEnum.ACADEMIC_PERIOD)
            .subscribe((v: any[]) => this.academicPeriods.set(v));
    }

    private loadEnrollmentStates(): void {
        this.cataloguesHttpService
            .findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_STATE)
            .subscribe((v: any[]) => this.enrollmentStates.set([...v].sort((a, b) => a.name.localeCompare(b.name))));
    }

    findEnrollments(page: number = 0): void {
        if (!this.store.canSearch()) return;
        const {career, schoolPeriod, academicPeriod, enrollmentState, search} = this.store.filters();
        this.store.isLoading.set(true);
        this.enrollmentService
            .findEnrollmentsByCareer(career!.id, schoolPeriod!.id, academicPeriod?.id, enrollmentState?.id, page, search)
            .subscribe({
                next: r => {this.store.setItems(r.data, r.pagination!); this.store.isLoading.set(false);},
                error: () => this.store.isLoading.set(false),
            });
    }

    enroll(id: string): void {
        this.enrollmentService.enroll(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Matriculado', detail: 'El estudiante fue matriculado correctamente'});
            this.findEnrollments();
        });
    }
    approve(id: string): void {
        this.enrollmentService.approve(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Aprobada', detail: 'La solicitud fue aprobada'});
            this.findEnrollments();
        });
    }
    reject(id: string): void {
        this.enrollmentService.reject(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Rechazada', detail: 'La solicitud fue rechazada'});
            this.findEnrollments();
        });
    }
    revoke(id: string): void {
        this.enrollmentService.revoke(id).subscribe(() => {
            this.messageService.showSuccess({summary: 'Anulada', detail: 'La matrícula fue anulada'});
            this.findEnrollments();
        });
    }

    downloadCertificate(enrollment: EnrollmentModel): void {
        if (enrollment.enrollmentState?.state?.code === CatalogueEnrollmentStateEnum.ENROLLED) {
            this.enrollmentService.downloadEnrollmentCertificate(enrollment.id, enrollment.student.user.identification);
        } else {
            this.messageService.showError({summary: 'No disponible', detail: 'El estudiante no se encuentra matriculado'});
        }
    }
    downloadByCareer(): void {
        const {career, schoolPeriod} = this.store.filters();
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
    downloadSocioeconomicForms(): void {
        const sp = this.store.filters().schoolPeriod;
        if (sp) this.enrollmentService.downloadSocioeconomicFormsBySchoolPeriod(sp);
    }

    selectItem(item: EnrollmentModel): void {
        this.store.selectItem(item);
        if (item.career) {
            this.careersService.career = this.careersService.careers.find((c: any) => c.id === item.career!.id);
        }
        this.buttonActions.set([
            {label: 'Editar',                icon: CustomIcons.PENCIL_SOLID,       command: () => {setTimeout(() => this.goToEdit(item.id), 200);}},
            {label: 'Asignaturas',           icon: CustomIcons.BOOK_SOLID,          command: () => {setTimeout(() => this.goToDetails(item.id), 200);}},
            {label: 'Aprobar',               icon: CustomIcons.CHECK_SOLID,         command: () => this.approve(item.id)},
            {label: 'Matricular',            icon: CustomIcons.STAR_SOLID,          command: () => this.enroll(item.id)},
            {label: 'Rechazar',              icon: CustomIcons.CIRCLE_XMARK_SOLID,  command: () => this.reject(item.id)},
            {label: 'Descargar Certificado', icon: CustomIcons.DOWNLOAD_SOLID,      command: () => this.downloadCertificate(item)},
            {label: 'Anular Matrícula',      icon: CustomIcons.BAN_SOLID,           command: () => this.revoke(item.id)},
        ]);
        this.isButtonActionsEnabled = true;
    }

    paginate(event: any): void {this.findEnrollments(event.page);}

    goToEdit(id: string): void {
        this.router.navigate([this.routesService.enrollments(), id]);
    }
    goToDetails(enrollmentId: string): void {
        this.router.navigate([this.routesService.enrollmentsDetailList(enrollmentId)]);
    }
}
