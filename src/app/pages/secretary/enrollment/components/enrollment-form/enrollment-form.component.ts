import {Component, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PrimeIcons} from 'primeng/api';
import {FieldTree, form, FormField, SchemaPathTree} from '@angular/forms/signals';

import {BreadcrumbService} from '@utils/services/breadcrumb.service';
import {CataloguesHttpService} from '@utils/services/catalogues-http.service';
import {CustomMessageService} from '@utils/services/custom-message.service';
import {RoutesService} from '@utils/services/routes.service';
import {CatalogueModel, EnrollmentModel} from '@models/core';
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
  EnrollmentCatalogueTypeEnum,
} from '@utils/enums';
import {FormRegistryService} from '@utils/services/form-registry.service';
import {EnrollmentStore} from '../../enrollment.store';
import {EnrollmentService} from '../../enrollment.service';
import {EnrollmentStateModel} from '../../enrollment.state';
import {validateEnrollmentForm} from './enrollment-form.validation';

// PrimeNG v21
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {Select} from 'primeng/select';
import {InputTextModule} from 'primeng/inputtext';

import {PanelModule} from 'primeng/panel';
import {Tag} from 'primeng/tag';
import {ToolbarModule} from 'primeng/toolbar';
import {CommonModule} from '@angular/common';
import {EnrollmentStatePipe} from '@utils/pipes/core/enrollment-state.pipe';
import {LabelDirective} from '@utils/directives/label.directive';
import {ErrorMessageDirective} from '@utils/directives/error-message.directive';

const FORM_KEY = 'enrollmentForm';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    ButtonModule,
    DividerModule,
    Select,
    InputTextModule,
    PanelModule,
    Tag,
    ToolbarModule,
    EnrollmentStatePipe,
    LabelDirective,
    ErrorMessageDirective,
  ],
  templateUrl: './enrollment-form.component.html',
})
export class EnrollmentFormComponent implements OnInit, OnDestroy {
  private readonly route                 = inject(ActivatedRoute);
  private readonly router                = inject(Router);
  private readonly routesService         = inject(RoutesService);
  private readonly breadcrumbService     = inject(BreadcrumbService);
  private readonly enrollmentService     = inject(EnrollmentService);
  private readonly cataloguesHttpService = inject(CataloguesHttpService);
  private readonly messageService        = inject(CustomMessageService);
  private readonly formRegistryService   = inject(FormRegistryService);
  protected readonly store               = inject(EnrollmentStore);

  protected readonly PrimeIcons               = PrimeIcons;
  protected readonly IconButtonActionEnum     = IconButtonActionEnum;
  protected readonly LabelButtonActionEnum    = LabelButtonActionEnum;
  protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;
  protected readonly SkeletonEnum             = SkeletonEnum;

  protected id        = signal<string>(RoutesEnum.NEW);
  protected isLoading = signal(false);
  protected isReadOnly = signal(false);

  protected types           = signal<CatalogueModel[]>([]);
  protected academicPeriods = signal<CatalogueModel[]>([]);
  protected workdays        = signal<CatalogueModel[]>([]);
  protected parallels       = signal<CatalogueModel[]>([]);

  protected readonly form$ = signal<EnrollmentStateModel>(this.store.enrollmentFormSection());

  protected readonly formData: FieldTree<EnrollmentStateModel> = form<EnrollmentStateModel>(
    this.form$,
    (schema: SchemaPathTree<EnrollmentStateModel>) => validateEnrollmentForm(schema)
  );

  constructor() {
    effect(() => { this.store.updateEnrollmentForm(this.form$()); });
  }

  ngOnInit(): void {
    this.formRegistryService.register('Datos de Matrícula', FORM_KEY, this.formData, this.form$());
    this.loadCatalogues();

    const paramId = this.route.snapshot.params['id'];
    if (paramId !== RoutesEnum.NEW) {
      this.id.set(paramId);
      this.loadEnrollment(paramId);
    }

    this.breadcrumbService.setItems([
      {label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments(RolesEnum.SECRETARY)]},
      {label: BreadcrumbEnum.FORM},
    ]);
  }

  ngOnDestroy(): void {
    this.formRegistryService.unregister(FORM_KEY);
    this.store.resetEnrollmentForm();
  }

  private loadCatalogues(): void {
    this.types.set(this.cataloguesHttpService.findByType(EnrollmentCatalogueTypeEnum.ENROLLMENTS_TYPE));
    this.academicPeriods.set(this.cataloguesHttpService.findByType(EnrollmentCatalogueTypeEnum.ACADEMIC_PERIOD));
    this.workdays.set(this.cataloguesHttpService.findByType(EnrollmentCatalogueTypeEnum.ENROLLMENTS_WORKDAY));
    this.parallels.set(this.cataloguesHttpService.findByType(EnrollmentCatalogueTypeEnum.PARALLEL));
  }

  private loadEnrollment(id: string): void {
    this.isLoading.set(true);
    this.enrollmentService.findOne(id).subscribe({
      next: (e) => {
        this.form$.set({
          student: {
            user: {
              identification: e.student?.user?.identification ?? null,
              lastname:       e.student?.user?.lastname       ?? null,
              name:           e.student?.user?.name           ?? null,
              email:          e.student?.user?.email          ?? null,
              personalEmail:  e.student?.user?.personalEmail  ?? null,
              cellPhone:      e.student?.user?.cellPhone       ?? null,
              phone:          e.student?.user?.phone           ?? null,
            },
          },
          date:                    e.date                    ?? null,
          code:                    e.code                    ?? null,
          type:                    e.type                    ?? null,
          academicPeriod:          e.academicPeriod          ?? null,
          workday:                 e.workday                 ?? null,
          parallel:                e.parallel                ?? null,
          observation:             e.observation             ?? null,
          enrollmentState:         e.enrollmentState         ?? null,
          socioeconomicCategory:   e.socioeconomicCategory   ?? null,
          socioeconomicPercentage: e.socioeconomicPercentage ?? null,
          socioeconomicScore:      e.socioeconomicScore      ?? null,
        });
        const code = e.enrollmentState?.state?.code;
        this.isReadOnly.set(
          code === CatalogueEnrollmentStateEnum.APPROVED ||
          code === CatalogueEnrollmentStateEnum.ENROLLED
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSubmit(): void {
    if (this.formRegistryService.hasErrors()) {
      this.messageService.showFormErrors(this.formRegistryService.errors());
      return;
    }
    // cast safely — nulls in state become undefined for the API
    const payload = this.store.enrollmentFormSection() as unknown as Partial<EnrollmentModel>;
    this.enrollmentService.update(this.id(), payload).subscribe(() => {
      this.store.resetEnrollmentForm();
      this.back();
    });
  }

  back(): void { this.router.navigate([this.routesService.enrollments(RolesEnum.SECRETARY)]); }

  get typeField()                    { return this.formData.type; }
  get academicPeriodField()          { return this.formData.academicPeriod; }
  get workdayField()                 { return this.formData.workday; }
  get parallelField()                { return this.formData.parallel; }
  get observationField()             { return this.formData.observation; }
  get enrollmentStateField()         { return this.formData.enrollmentState; }
  get socioeconomicCategoryField()   { return this.formData.socioeconomicCategory; }
  get socioeconomicPercentageField() { return this.formData.socioeconomicPercentage; }
  get socioeconomicScoreField()      { return this.formData.socioeconomicScore; }
}
