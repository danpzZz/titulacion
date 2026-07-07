import {Component, computed, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldTree, form, FormField, SchemaPathTree} from '@angular/forms/signals';

import {BreadcrumbService} from '@utils/services/breadcrumb.service';
import {CustomMessageService} from '@utils/services/custom-message.service';
import {CataloguesHttpService} from '@utils/services/catalogues-http.service';
import {CareersService} from '@utils/services/careers.service';
import {CurriculumsHttpService} from '@utils/services/curriculums-http.service';
import {FormRegistryService} from '@utils/services/form-registry.service';
import {RoutesService} from '@utils/services/routes.service';
import {CustomIcons} from '@utils/icons/custom-icons';

import {CatalogueModel, EnrollmentDetailModel, SubjectModel} from '@models/core';
import {BreadcrumbEnum, CatalogueEnrollmentStateEnum, EnrollmentCatalogueTypeEnum, RoutesEnum} from '@utils/enums';
import {EnrollmentStore} from '../../enrollment.store';
import {EnrollmentService} from '../../enrollment.service';
import {EnrollmentDetailStateModel} from '../../enrollment.state';
import {validateEnrollmentDetailForm} from './enrollment-detail-form.validation';

import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {Select} from 'primeng/select';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {CommonModule} from '@angular/common';
import {LabelDirective} from '@utils/directives/label.directive';
import {ErrorMessageDirective} from '@utils/directives/error-message.directive';

const FORM_KEY = 'enrollmentDetailForm';

@Component({
    selector: 'app-enrollment-detail-form',
    standalone: true,
    imports: [
        CommonModule, FormField,
        ButtonModule, DividerModule, Select, InputNumberModule,
        InputTextModule, LabelDirective, ErrorMessageDirective,
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
    private readonly messageService         = inject(CustomMessageService);
    private readonly formRegistryService    = inject(FormRegistryService);
    protected readonly store                = inject(EnrollmentStore);

    protected readonly CustomIcons = CustomIcons;

    protected enrollmentId = signal<string>('');
    protected id           = signal<string>(RoutesEnum.NEW);
    protected isNew        = computed(() => this.id() === RoutesEnum.NEW);
    protected isLoading    = signal(false);

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
        effect(() => {this.store.updateDetailForm(this.form$());});
    }

    ngOnInit(): void {
        const snap = this.route.snapshot;
        this.enrollmentId.set(snap.params['enrollmentId']);
        const paramId = snap.params['id'];
        if (paramId !== RoutesEnum.NEW) this.id.set(paramId);

        this.breadcrumbService.setItems([
            {label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments()]},
            {label: BreadcrumbEnum.ENROLLMENT_DETAILS,
                routerLink: [this.routesService.enrollmentsDetailList(this.enrollmentId())]},
            {label: BreadcrumbEnum.FORM},
        ]);

        this.formRegistryService.register('Datos de Asignatura', FORM_KEY, this.formData, this.form$());
        this.loadCatalogues();
        this.loadSubjects();
        if (!this.isNew()) {
            setTimeout(() => this.loadDetail(this.id()), 300);
        }
    }

    ngOnDestroy(): void {
        this.formRegistryService.unregister(FORM_KEY);
        this.store.resetDetailForm();
    }

    private loadCatalogues(): void {
        const http = this.cataloguesHttpService;
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_TYPE).subscribe((v: any[]) => this.types.set(v));
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_WORKDAY).subscribe((v: any[]) => this.workdays.set(v));
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.PARALLEL).subscribe((v: any[]) => this.parallels.set(v));
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_ACADEMIC_STATE).subscribe((v: any[]) => this.academicStates.set(v));
    }

    private loadSubjects(): void {
        const career = this.careersService.career;
        const curriculumId = career?.curriculums?.[0]?.id ?? 'cu000001-0000-0000-0000-000000000001';
        this.curriculumsHttpService
            .findSubjectsAllByCurriculum(curriculumId)
            .subscribe((items: any[]) => this.subjects.set(items as SubjectModel[]));
    }

    private loadDetail(id: string): void {
        this.isLoading.set(true);
        this.enrollmentService.findOneDetail(id).subscribe({
            next: (d) => {
                this.form$.set({
                    subject: d.subject ?? null, type: d.type ?? null,
                    workday: d.workday ?? null, parallel: d.parallel ?? null,
                    number: d.number ?? null, date: d.date ?? null,
                    finalGrade: d.finalGrade ?? null, finalAttendance: d.finalAttendance ?? null,
                    academicState: d.academicState ?? null, observation: d.observation ?? null,
                });
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
            this.enrollmentService.updateDetail(this.id(), payload).subscribe(() => this.back());
        }
    }

    back(): void {
        this.router.navigate([this.routesService.enrollmentsDetailList(this.enrollmentId())]);
    }

    get subjectField()         {return this.formData.subject;}
    get typeField()            {return this.formData.type;}
    get workdayField()         {return this.formData.workday;}
    get parallelField()        {return this.formData.parallel;}
    get numberField()          {return this.formData.number;}
    get finalGradeField()      {return this.formData.finalGrade;}
    get finalAttendanceField() {return this.formData.finalAttendance;}
    get academicStateField()   {return this.formData.academicState;}
    get observationField()     {return this.formData.observation;}
}
