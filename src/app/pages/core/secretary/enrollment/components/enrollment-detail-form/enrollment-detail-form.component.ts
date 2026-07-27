import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldTree, form, FormField, SchemaPathTree } from '@angular/forms/signals';

import { BreadcrumbService } from '@layout/service/breadcrumb.service';
import { AppService, CatalogueService, CataloguesHttpService, CustomMessageService } from '@utils/services';
import { FormRegistryService } from '@utils/services/form-registry.service';
import { CustomIcons } from '@utils/icons/custom-icons';
import { SECRETARY_ROUTES } from '@routes';

import { CatalogueInterface, EnrollmentDetailModel, SubjectModel } from '@utils/interfaces';
import { BreadcrumbEnum, CatalogueTypeEnum, RoutesEnum } from '@utils/enums';
import { EnrollmentStore } from '../../enrollment.store';
import { EnrollmentService } from '../../enrollment.service';
import { EnrollmentDetailStateModel } from '../../enrollment.state';
import { validateEnrollmentDetailForm } from './enrollment-detail-form.validation';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelDirective } from '@utils/directives/label.directive';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { FormField as FF } from '@angular/forms/signals';

const FORM_KEY = 'enrollmentDetailForm';

@Component({
    selector: 'app-enrollment-detail-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, FF,
        ButtonModule, DividerModule, Select,
        InputTextModule, LabelDirective, ErrorMessageDirective,
    ],
    templateUrl: './enrollment-detail-form.component.html',
})
export class EnrollmentDetailFormComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly breadcrumbService = inject(BreadcrumbService);
    protected readonly enrollmentService = inject(EnrollmentService);
    private readonly catalogueService       = inject(CatalogueService);
    private readonly cataloguesHttpService  = inject(CataloguesHttpService);
    private readonly messageService = inject(CustomMessageService);
    private readonly formRegistryService = inject(FormRegistryService);
    protected readonly appService = inject(AppService);
    protected readonly store = inject(EnrollmentStore);

    protected readonly CustomIcons = CustomIcons;

    protected readonly id = signal<string>(RoutesEnum.NEW);
    protected readonly enrollmentId = signal<string>('');

    protected isNew = computed(() => this.id() === RoutesEnum.NEW);
    protected isFormLoading = signal(false);


    protected enrolledSubjectIds = signal<string[]>([]);
    protected autoNumber = signal<number>(1);

    // Catálogos — síncronos con CatalogueService
    protected types = signal<CatalogueInterface[]>([]);
    protected workdays = signal<CatalogueInterface[]>([]);
    protected parallels = signal<CatalogueInterface[]>([]);
    protected academicStates = signal<CatalogueInterface[]>([]);
    protected subjects = signal<SubjectModel[]>([]);



    protected readonly form$ = signal<EnrollmentDetailStateModel>(this.store.detailFormSection());

    protected readonly formData: FieldTree<EnrollmentDetailStateModel> =
        form<EnrollmentDetailStateModel>(
            this.form$,
            (schema: SchemaPathTree<EnrollmentDetailStateModel>) =>
                validateEnrollmentDetailForm(schema, this.isNew())
        );

    constructor() {
        effect(() => { this.store.updateSection('detailForm', this.form$()); });

        effect(() => {
            const selectedSubject = this.form$().subject;
            if (this.isNew() && selectedSubject?.id) {
                this.enrollmentService.findDetailsByEnrollment(this.enrollmentId())
                    .subscribe({
                        next: (details: EnrollmentDetailModel[]) => {
                            const count = details.filter(d => d.subject?.id === selectedSubject.id).length;
                            this.autoNumber.set(Math.min(count + 1, 3));
                        }
                    });
            }
        });
    }

    ngOnInit(): void {
        const params = this.route.snapshot.params;
        this.enrollmentId.set(params['enrollmentId'] ?? '');
        const paramId = params['id'];
        if (paramId && paramId !== RoutesEnum.NEW) this.id.set(paramId);

        this.breadcrumbService.setItems([
            { label: BreadcrumbEnum.ENROLLMENTS, routerLink: SECRETARY_ROUTES.enrollment.absolute },
            { label: BreadcrumbEnum.ENROLLMENT_DETAILS, routerLink: SECRETARY_ROUTES.enrollment.detail.absoluteFn(this.enrollmentId()) },
            { label: BreadcrumbEnum.FORM },
        ]);

        this.formRegistryService.register('Datos de Asignatura', FORM_KEY, this.formData, this.form$());

        // Catálogos síncronos — patrón del tutor
        this.loadCatalogues();
        this.loadSubjects();

        if (this.id() !== RoutesEnum.NEW) this.loadData();
    }

    ngOnDestroy(): void {
        this.formRegistryService.unregister(FORM_KEY);
        this.store.resetDetailForm();
    }

    //USAR CON LOGIN
    // private loadCatalogues(): void {
    //     this.types.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_type));
    //     this.workdays.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_workday));
    //     this.parallels.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_parallel));
    //     this.academicStates.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_academic_state));
    // }

    private loadCatalogues(): void {
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_type)
            .subscribe({next: v => this.types.set(v as CatalogueInterface[])});
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_workday)
            .subscribe({next: v => this.workdays.set(v as CatalogueInterface[])});
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_parallel)
            .subscribe({next: v => this.parallels.set(v as CatalogueInterface[])});
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_academic_state)
            .subscribe({next: v => this.academicStates.set(v as CatalogueInterface[])});
    }
    private loadSubjects(): void {
        const careerId = this.store.selectedItem()?.career?.id ?? 'career00-0000-0000-0000-000000000001';
        this.enrollmentService.findSubjectsByCareer(careerId).subscribe({
            next: (items: SubjectModel[]) => {
                this.subjects.set(items);
                this.enrollmentService.findDetailsByEnrollment(this.enrollmentId()).subscribe({
                    next: (details: EnrollmentDetailModel[]) => {
                        this.enrolledSubjectIds.set(
                            details.map(d => d.subject?.id).filter((id): id is string => !!id)
                        );
                        if (this.isNew()) this.autoNumber.set(Math.min(details.length + 1, 3));
                    }
                });
            }
        });
    }

    private loadData(): void {
        this.isFormLoading.set(true);
        this.enrollmentService.findOneDetail(this.id()).subscribe({
            next: (d: EnrollmentDetailModel | null) => {
                this.isFormLoading.set(false);
                if (!d) {
                    // Detail not in server (e.g. newly created item in mock that was reset)
                    // Use whatever is in sessionStorage if available
                    if (this.store.hasDetailFormData()) {
                        this.form$.set(this.store.detailFormSection());
                    }
                    return;
                }
                const stored = this.store.hasDetailFormData()
                    ? this.store.detailFormSection()
                    : null;
                this.form$.set({
                    subject:         d.subject         ?? null,
                    type:            d.type            ?? null,
                    workday:         stored?.workday    ?? d.workday         ?? null,
                    parallel:        stored?.parallel   ?? d.parallel        ?? null,
                    number:          d.number          ?? null,
                    date:            d.date            ?? null,
                    finalGrade:      stored?.finalGrade      ?? d.finalGrade      ?? null,
                    finalAttendance: stored?.finalAttendance ?? d.finalAttendance ?? null,
                    academicState:   stored?.academicState   ?? d.academicState   ?? null,
                    observation:     stored?.observation     ?? d.observation     ?? null,
                });
                this.store.updateSection('detailForm', this.form$());
            },
            error: () => {
                this.isFormLoading.set(false);
                // On error, use sessionStorage data if available
                if (this.store.hasDetailFormData()) {
                    this.form$.set(this.store.detailFormSection());
                }
            },
        });
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
        console.log('[SUBMIT] hasErrors:', this.formRegistryService.hasErrors());
        console.log('[SUBMIT] errors:', this.formRegistryService.errors());
        console.log('[SUBMIT] form$:', this.form$());
        console.log('[SUBMIT] isNew:', this.isNew());
        console.log('[SUBMIT] id:', this.id());
        if (this.formRegistryService.hasErrors()) {
            this.messageService.showFormErrors(this.formRegistryService.errors());
            return;
        }
        const payload = this.store.detailFormSection() as unknown as Partial<EnrollmentDetailModel>;
        if (this.isNew()) {
            const newPayload = {
                ...payload,
                enrollmentId: this.enrollmentId(),
                date: new Date().toISOString().split('T')[0],
                number: this.autoNumber(),
            };
            this.enrollmentService.createDetail(newPayload).subscribe({
                next: created => {
                    this.enrollmentService.sendDetailRequest(created.id, newPayload).subscribe({
                        next: () => { this.store.resetDetailForm(); this.back(); }
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
        this.router.navigateByUrl(SECRETARY_ROUTES.enrollment.detail.absoluteFn(this.enrollmentId()));
    }

    isSubjectDisabled(subject: SubjectModel): boolean {
        return this.enrolledSubjectIds().includes(subject.id);
    }
}
