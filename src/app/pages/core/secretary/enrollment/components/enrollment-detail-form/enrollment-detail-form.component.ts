import {Component, computed, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FieldTree, form, FormField, SchemaPathTree} from '@angular/forms/signals';

import {BreadcrumbService} from '@layout/service/breadcrumb.service';
import {CustomMessageService} from '@utils/services/custom-message.service';
import {CataloguesHttpService} from '@utils/services/catalogues-http.service';
import {CareersService} from '@utils/services/careers.service';
import {CareersHttpService} from '@utils/services/careers-http.service';
import {FormRegistryService} from '@utils/services/form-registry.service';
import {AppService} from '@utils/services';
import {CustomIcons} from '@utils/icons/custom-icons';
import {SECRETARY_ROUTES} from '@routes';

import {CatalogueModel, EnrollmentDetailModel, SubjectModel} from '@utils/interfaces';
import {BreadcrumbEnum, EnrollmentCatalogueTypeEnum, RoutesEnum} from '@utils/enums';
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
import {FormsModule} from '@angular/forms';
import {LabelDirective} from '@utils/directives/label.directive';
import {ErrorMessageDirective} from '@utils/directives/error-message.directive';

const FORM_KEY = 'enrollmentDetailForm';

@Component({
    selector: 'app-enrollment-detail-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, FormField,
        ButtonModule, DividerModule, Select, InputNumberModule,
        InputTextModule, LabelDirective, ErrorMessageDirective,
    ],
    templateUrl: './enrollment-detail-form.component.html',
})
export class EnrollmentDetailFormComponent implements OnInit, OnDestroy {
    private readonly route                 = inject(ActivatedRoute);
    private readonly router                = inject(Router);
    private readonly breadcrumbService     = inject(BreadcrumbService);
    protected readonly enrollmentService   = inject(EnrollmentService);
    private readonly careersService        = inject(CareersService);
    private readonly careersHttpService    = inject(CareersHttpService);
    private readonly cataloguesHttpService = inject(CataloguesHttpService);
    private readonly messageService        = inject(CustomMessageService);
    private readonly formRegistryService   = inject(FormRegistryService);
    protected readonly appService          = inject(AppService);
    protected readonly store               = inject(EnrollmentStore);

    protected readonly CustomIcons = CustomIcons;

    // Leídos de la ruta en ngOnInit
    protected readonly id           = signal<string>(RoutesEnum.NEW);
    protected readonly enrollmentId = signal<string>('');

    protected isNew              = computed(() => this.id() === RoutesEnum.NEW);
    protected enrolledSubjectIds = signal<string[]>([]);
    protected autoNumber         = signal<number>(1);

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
        effect(() => {this.store.updateSection('detailForm', this.form$());});

        effect(() => {
            const selectedSubject = this.form$().subject;
            if (this.isNew() && selectedSubject?.id) {
                this.enrollmentService.findDetailsByEnrollment(this.enrollmentId())
                    .subscribe({
                        next: (details: EnrollmentDetailModel[]) => {
                            const sameSubjectCount = details.filter(
                                d => d.subject?.id === selectedSubject.id
                            ).length;
                            this.autoNumber.set(Math.min(sameSubjectCount + 1, 3));
                        }
                    });
            }
        });
    }

    ngOnInit(): void {
        // Leer parámetros de ruta — disponibles en ngOnInit
        const params = this.route.snapshot.params;
        this.enrollmentId.set(params['enrollmentId'] ?? '');
        const paramId = params['id'];
        if (paramId && paramId !== RoutesEnum.NEW) {
            this.id.set(paramId);
        }

        this.breadcrumbService.setItems([
            {
                label: BreadcrumbEnum.ENROLLMENTS,
                routerLink: SECRETARY_ROUTES.enrollment.absolute,
            },
            {
                label: BreadcrumbEnum.ENROLLMENT_DETAILS,
                routerLink: SECRETARY_ROUTES.enrollment.detail.absoluteFn(this.enrollmentId()),
            },
            {label: BreadcrumbEnum.FORM},
        ]);

        this.formRegistryService.register('Datos de Asignatura', FORM_KEY, this.formData, this.form$());
        this.loadCatalogues();
        this.loadSubjects();

        if (this.id() !== RoutesEnum.NEW) {
            this.loadData();
        }
    }

    ngOnDestroy(): void {
        this.formRegistryService.unregister(FORM_KEY);
        this.store.resetDetailForm();
    }

    private loadCatalogues(): void {
        const http = this.cataloguesHttpService;
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_TYPE)
            .subscribe({next: (v: CatalogueModel[]) => this.types.set(v)});
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_WORKDAY)
            .subscribe({next: (v: CatalogueModel[]) => this.workdays.set(v)});
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.PARALLEL)
            .subscribe({next: (v: CatalogueModel[]) => this.parallels.set(v)});
        http.findByTypeObservable(EnrollmentCatalogueTypeEnum.ENROLLMENTS_ACADEMIC_STATE)
            .subscribe({next: (v: CatalogueModel[]) => this.academicStates.set(v)});
    }

    private loadSubjects(): void {
        const careerId = this.careersService.career?.id ?? 'career00-0000-0000-0000-000000000001';
        this.careersHttpService.findSubjectsByCareer(careerId).subscribe({
            next: (items: SubjectModel[]) => {
                this.subjects.set(items);
                this.enrollmentService.findDetailsByEnrollment(this.enrollmentId()).subscribe({
                    next: (details: EnrollmentDetailModel[]) => {
                        this.enrolledSubjectIds.set(
                            details.map(d => d.subject?.id).filter((id): id is string => !!id)
                        );
                        if (this.isNew()) {
                            this.autoNumber.set(Math.min(details.length + 1, 3));
                        }
                    }
                });
            }
        });
    }

    private loadData(): void {
        if (this.store.hasDetailFormData()) {
            this.enrollmentService.findOneDetail(this.id()).subscribe({
                next: (d: EnrollmentDetailModel) => {
                    this.store.updateSection('detailForm', {
                        subject: d.subject ?? null,
                        type:    d.type    ?? null,
                        number:  d.number  ?? null,
                        date:    d.date    ?? null,
                    });
                    this.form$.set(this.store.detailFormSection());
                }
            });
        } else {
            this.appService.showLoading();
            this.enrollmentService.findOneDetail(this.id()).subscribe({
                next: (d: EnrollmentDetailModel) => {
                    this.store.updateSection('detailForm', {
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
                    this.form$.set(this.store.detailFormSection());
                    this.appService.hideLoading();
                },
                error: () => this.appService.hideLoading(),
            });
        }
    }

    onSubmit(): void {
        if (!this.isNew()) {
            const s = this.store.detailFormSection();
            if (s.academicState && (s.finalGrade === null || s.finalAttendance === null)) {
                this.messageService.showError({
                    summary: 'Campos incompletos',
                    detail: 'Para asignar un estado académico debe ingresar la calificación y la asistencia'
                });
                return;
            }
        }

        if (this.formRegistryService.hasErrors()) {
            this.messageService.showFormErrors(this.formRegistryService.errors());
            return;
        }

        const payload = this.store.detailFormSection() as unknown as Partial<EnrollmentDetailModel>;

        if (this.isNew()) {
            const newPayload = {
                ...payload,
                enrollmentId: this.enrollmentId(),
                date:   new Date().toISOString().split('T')[0],
                number: this.autoNumber(),
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

    isSubjectDisabled(subject: SubjectModel): boolean {
        return this.enrolledSubjectIds().includes(subject.id);
    }
}
