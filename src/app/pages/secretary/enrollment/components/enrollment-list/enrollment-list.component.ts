import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {PrimeIcons} from 'primeng/api';

import {
  BreadcrumbService,
  CareersHttpService,
  CareersService,
  CataloguesHttpService,
  MessageService,
  RoutesService,
  SchoolPeriodsHttpService,
  SchoolPeriodsService,
} from '@services/core';
import {CatalogueModel, CareerModel, EnrollmentModel, SchoolPeriodModel} from '@models/core';
import {
  BreadcrumbEnum,
  CatalogueEnrollmentStateEnum,
  CatalogueTypeEnum,
  LabelButtonActionEnum,
  RolesEnum,
  SeverityButtonActionEnum,
} from '@utils/enums';
import {EnrollmentStore} from '../../enrollment.store';
import {EnrollmentService} from '../../enrollment.service';

import {ButtonModule} from 'primeng/button';
import {Select} from 'primeng/select';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputTextModule} from 'primeng/inputtext';
import {PaginatorModule} from 'primeng/paginator';
import {Drawer} from 'primeng/drawer';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {DividerModule} from 'primeng/divider';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TooltipModule} from 'primeng/tooltip';
import {EnrollmentStatePipe} from '@utils/pipes/core/enrollment-state.pipe';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, Select, InputGroupModule, InputGroupAddonModule,
    InputTextModule, PaginatorModule, Drawer, TableModule, Tag,
    DividerModule, TooltipModule, EnrollmentStatePipe,
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
  private readonly messageService           = inject(MessageService);

  protected readonly store = inject(EnrollmentStore);

  protected readonly PrimeIcons               = PrimeIcons;
  protected readonly LabelButtonActionEnum    = LabelButtonActionEnum;
  protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;

  protected schoolPeriods    = signal<SchoolPeriodModel[]>([]);
  protected careers          = signal<CareerModel[]>([]);
  protected academicPeriods  = signal<CatalogueModel[]>([]);
  protected enrollmentStates = signal<CatalogueModel[]>([]);

  protected isButtonActions     = signal(false);
  protected isMoreButtonActions = signal(false);

  protected readonly columns = [
    {field: 'career',          header: 'Carrera'},
    {field: 'identification',  header: 'Número de Documento'},
    {field: 'lastname',        header: 'Apellidos'},
    {field: 'name',            header: 'Nombres'},
    {field: 'type',            header: 'Tipo de Matrícula'},
    {field: 'academicPeriod',  header: 'Periodo académico'},
    {field: 'workday',         header: 'Horario'},
    {field: 'parallel',        header: 'Paralelo'},
    {field: 'enrollmentState', header: 'Estado'},
  ];

  constructor() {
    this.breadcrumbService.setItems([{label: BreadcrumbEnum.ENROLLMENTS}]);
    effect(() => {
      const _ = this.store.filters();
      this.findEnrollments();
    });
  }

  ngOnInit(): void {
    this.loadSchoolPeriods();
    this.loadCareers();
    this.loadAcademicPeriods();
    this.loadEnrollmentStates();
  }

  private loadSchoolPeriods(): void {
    this.schoolPeriodsHttpService.findAll().subscribe(periods => {
      this.schoolPeriods.set(periods);
      // Preseleccionar el periodo abierto si existe
      this.schoolPeriodsHttpService.findOpenSchoolPeriod().subscribe(open => {
        if (open) {
          this.schoolPeriodsService.openSchoolPeriod = open;
          this.store.updateFilter('schoolPeriod', open);
        }
      });
    });
  }

  private loadCareers(): void {
    this.careersHttpService.findAll().subscribe(list => {
      this.careers.set(list);
      this.careersService.careers = list;
      // Preseleccionar la primera carrera si solo hay una (YEC)
      if (list.length === 1) {
        this.careersService.career = list[0];
        this.store.updateFilter('career', list[0]);
      }
    });
  }

  private loadAcademicPeriods(): void {
    this.academicPeriods.set(
      this.cataloguesHttpService.findByType(CatalogueTypeEnum.ACADEMIC_PERIOD)
    );
  }

  private loadEnrollmentStates(): void {
    this.enrollmentStates.set(
      this.cataloguesHttpService
        .findByType(CatalogueTypeEnum.ENROLLMENTS_STATE)
        .sort((a: CatalogueModel, b: CatalogueModel) => a.name.localeCompare(b.name))
    );
  }

  findEnrollments(page: number = 0): void {
    if (!this.store.canSearch()) return;
    const {career, schoolPeriod, academicPeriod, enrollmentState, search} = this.store.filters();
    this.store.isLoading.set(true);
    this.enrollmentService
      .findEnrollmentsByCareer(career!.id, schoolPeriod!.id, academicPeriod?.id, enrollmentState?.id, page, search)
      .subscribe({
        next: r => { this.store.setItems(r.data, r.pagination!); this.store.isLoading.set(false); },
        error: ()  => this.store.isLoading.set(false),
      });
  }

  enroll(id: string): void {
    this.enrollmentService.enroll(id).subscribe(() => {
      this.messageService.showSuccess('Matriculado', 'El estudiante fue matriculado correctamente');
      this.findEnrollments();
    });
  }

  approve(id: string): void {
    this.enrollmentService.approve(id).subscribe(() => {
      this.messageService.showSuccess('Aprobada', 'La solicitud fue aprobada');
      this.findEnrollments();
    });
  }

  reject(id: string): void {
    this.enrollmentService.reject(id).subscribe(() => {
      this.messageService.showSuccess('Rechazada', 'La solicitud fue rechazada');
      this.findEnrollments();
    });
  }

  revoke(id: string): void {
    this.enrollmentService.revoke(id).subscribe(() => {
      this.messageService.showSuccess('Anulada', 'La matrícula fue anulada');
      this.findEnrollments();
    });
  }

  downloadCertificate(enrollment: EnrollmentModel): void {
    const code = enrollment.enrollmentState?.state?.code;
    if (code === CatalogueEnrollmentStateEnum.ENROLLED) {
      this.enrollmentService.downloadEnrollmentCertificate(
        enrollment.id, enrollment.student.user.identification
      );
    } else {
      this.messageService.errorCustom('No disponible', 'El estudiante no se encuentra matriculado');
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
      this.careersService.career = this.careersService.careers.find(c => c.id === item.career!.id);
    }
    this.isButtonActions.set(true);
  }

  paginate(event: any): void { this.findEnrollments(event.page); }

  goToEdit(id: string): void {
    this.router.navigate([this.routesService.enrollments(RolesEnum.SECRETARY), id]);
  }
  goToDetails(enrollmentId: string): void {
    this.router.navigate([this.routesService.enrollmentsDetailList(enrollmentId, RolesEnum.SECRETARY)]);
  }
}
