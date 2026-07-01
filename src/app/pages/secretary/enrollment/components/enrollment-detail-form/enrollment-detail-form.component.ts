import {Component, computed, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PrimeIcons} from 'primeng/api';
import {FieldTree, form, FormField, SchemaPathTree} from '@angular/forms/signals';

import {BreadcrumbService, CareersService, CataloguesHttpService, CurriculumsHttpService, MessageService, RoutesService} from '@services/core';
import {CatalogueModel, EnrollmentDetailModel, SubjectModel} from '@models/core';
import {
  BreadcrumbEnum,
  CatalogueEnrollmentStateEnum,
  CatalogueTypeEnum,
  IconButtonActionEnum,
  LabelButtonActionEnum,
  RolesEnum,
  RoutesEnum,
  SeverityButtonActionEnum,
  SkeletonEnum,
} from '@utils/enums';
import {FormRegistryService} from '@utils/services/form-registry.service';
import {EnrollmentStore} from '../../enrollment.store';
import {EnrollmentService} from '../../enrollment.service';
import {EnrollmentDetailStateModel} from '../../enrollment.state';
import {validateEnrollmentDetailForm} from './enrollment-detail-form.validation';

// PrimeNG v21
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {Select} from 'primeng/select';
import {InputNumberModule} from 'primeng/inputnumber';

import {InputTextModule} from 'primeng/inputtext';

import {PanelModule} from 'primeng/panel';
import {ToolbarModule} from 'primeng/toolbar';
import {CommonModule} from '@angular/common';
import {LabelDirective} from '@utils/directives/label.directive';
import {ErrorMessageDirective} from '@utils/directives/error-message.directive';

const FORM_KEY = 'enrollmentDetailForm';

@Component({
  selector: 'app-enrollment-detail-form',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    ButtonModule,
    DividerModule,
    Select,
    InputNumberModule,
    InputTextModule,
    PanelModule,
    ToolbarModule,
    LabelDirective,
    ErrorMessageDirective,
  ],
  templateUrl: './enrollment-detail-form.component.html',
})
export class EnrollmentDetailFormComponent implements OnInit, OnDestroy {
  private readonly route                  = inject(ActivatedRoute);
  private readonly router                 = inject(Router);
  private readonly routesService          = inject(RoutesService);
  private readonly breadcrumbService      = inject(BreadcrumbService);
  private readonly enrollmentService      = inject(EnrollmentService);
  private readonly careersService         = inject(CareersService);
  private readonly cataloguesHttpService  = inject(CataloguesHttpService);
  private readonly curriculumsHttpService = inject(CurriculumsHttpService);
  private readonly messageService         = inject(MessageService);
  private readonly formRegistryService    = inject(FormRegistryService);
  protected readonly store                = inject(EnrollmentStore);

  protected readonly PrimeIcons               = PrimeIcons;
  protected readonly IconButtonActionEnum     = IconButtonActionEnum;
  protected readonly LabelButtonActionEnum    = LabelButtonActionEnum;
  protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;
  protected readonly SkeletonEnum             = SkeletonEnum;

  protected enrollmentId    = signal<string>('');
  protected id              = signal<string>(RoutesEnum.NEW);
  protected isNew           = computed(() => this.id() === RoutesEnum.NEW);
  protected isLoading       = signal(false);
  protected isDetailReadOnly = signal(false);

  protected types          = signal<CatalogueModel[]>([]);
  protected workdays       = signal<CatalogueModel[]>([]);
  protected parallels      = signal<CatalogueModel[]>([]);
  protected academicStates = signal<CatalogueModel[]>([]);
  protected subjects       = signal<SubjectModel[]>([]);

  protected readonly form$ = signal<EnrollmentDetailStateModel>(this.store.detailFormSection());

  protected readonly formData: FieldTree<EnrollmentDetailStateModel> =
    form<EnrollmentDetailStateModel>(
      this.form$,
      (schema: SchemaPathTree<EnrollmentDetailStateModel>) =>
        validateEnrollmentDetailForm(schema, this.isNew())
    );

  constructor() {
    effect(() => { this.store.updateDetailForm(this.form$()); });
  }

  ngOnInit(): void {
    const snap = this.route.snapshot;
    this.enrollmentId.set(snap.params['enrollmentId']);
    const paramId = snap.params['id'];
    if (paramId !== RoutesEnum.NEW) this.id.set(paramId);

    this.breadcrumbService.setItems([
      {label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments(RolesEnum.SECRETARY)]},
      {label: BreadcrumbEnum.ENROLLMENT_DETAILS,
        routerLink: [this.routesService.enrollmentsDetailList(this.enrollmentId(), RolesEnum.SECRETARY)]},
      {label: BreadcrumbEnum.FORM},
    ]);

    this.formRegistryService.register('Datos de Asignatura', FORM_KEY, this.formData, this.form$());
    this.loadCatalogues();
    this.loadSubjects();
    if (!this.isNew()) {
      // Load detail after a tick so catalogues populate first
      setTimeout(() => this.loadDetail(this.id()), 300);
    }
  }

  ngOnDestroy(): void {
    this.formRegistryService.unregister(FORM_KEY);
    this.store.resetDetailForm();
  }

  private loadCatalogues(): void {
    const http = this.cataloguesHttpService;
    // Load all catalogues then optionally load detail
    http.findByTypeObservable(CatalogueTypeEnum.ENROLLMENTS_TYPE)
      .subscribe(v => this.types.set(v));
    http.findByTypeObservable(CatalogueTypeEnum.ENROLLMENTS_WORKDAY)
      .subscribe(v => this.workdays.set(v));
    http.findByTypeObservable(CatalogueTypeEnum.PARALLEL)
      .subscribe(v => this.parallels.set(v));
    http.findByTypeObservable(CatalogueTypeEnum.ENROLLMENTS_ACADEMIC_STATE)
      .subscribe(v => this.academicStates.set(v));
  }

  private loadSubjects(): void {
    const career = this.careersService.career;
    if (career?.curriculums?.[0]?.id) {
      this.curriculumsHttpService
        .findSubjectsAllByCurriculum(career.curriculums[0].id)
        .subscribe(items => this.subjects.set(items as SubjectModel[]));
    }
  }

  private loadDetail(id: string): void {
    this.isLoading.set(true);
    this.enrollmentService.findOneDetail(id).subscribe({
      next: (d) => {
        this.form$.set({
          subject:         d.subject         ?? null,
          type:            d.type            ?? null,
          workday:         d.workday         ?? null,
          parallel:        d.parallel        ?? null,
          number:          d.number          ?? null,
          date:            d.date            ?? null,
          finalGrade:      d.finalGrade      ?? null,
          finalAttendance: d.finalAttendance ?? null,
          academicState:   d.academicState   ?? null,
          observation:     d.observation     ?? null,
        });
        const code = d.enrollmentDetailState?.state?.code;
        this.isDetailReadOnly.set(
          code === CatalogueEnrollmentStateEnum.ENROLLED ||
          code === CatalogueEnrollmentStateEnum.REVOKED
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSubmit(): void {
    if (this.formRegistryService.hasErrors()) {
      this.messageService.errorsFields(this.formRegistryService.errors().map(e => e.message));
      return;
    }
    // cast null → undefined for the service's Partial<EnrollmentDetailModel>
    const payload = this.store.detailFormSection() as unknown as Partial<EnrollmentDetailModel>;

    if (this.isNew()) {
      this.enrollmentService.createDetail({...payload, enrollmentId: this.enrollmentId()})
        .subscribe(created => {
          this.enrollmentService.sendDetailRequest(created.id, payload).subscribe(() => {
            this.store.resetDetailForm();
            this.back();
          });
        });
    } else {
      this.enrollmentService.updateDetail(this.id(), payload).subscribe(() => {
        this.back();  // navigate first, then reset on destroy
      });
    }
  }

  back(): void {
    this.router.navigate([this.routesService.enrollmentsDetailList(this.enrollmentId(), RolesEnum.SECRETARY)]);
  }

  get subjectField()         { return this.formData.subject; }
  get typeField()            { return this.formData.type; }
  get workdayField()         { return this.formData.workday; }
  get parallelField()        { return this.formData.parallel; }
  get numberField()          { return this.formData.number; }
  get finalGradeField()      { return this.formData.finalGrade; }
  get finalAttendanceField() { return this.formData.finalAttendance; }
  get academicStateField()   { return this.formData.academicState; }
  get observationField()     { return this.formData.observation; }
}
