import { Component, effect, inject, Input, OnInit, signal } from '@angular/core';
import { FieldTree, form, FormField, SchemaPathTree } from '@angular/forms/signals';

import { AppService, CatalogueService, CataloguesHttpService, CustomMessageService } from '@utils/services';
import { FormRegistryService } from '@utils/services/form-registry.service';
import { CustomIcons } from '@utils/icons/custom-icons';

import { CatalogueInterface, EnrollmentDetailModel, SubjectModel } from '@utils/interfaces';
import { CatalogueTypeEnum, RoutesEnum } from '@utils/enums';
import { EnrollmentStore } from '../../enrollment.store';
import { EnrollmentService } from '../../enrollment.service';
import { EnrollmentDetailStateModel } from '../../enrollment.state';
import { validateEnrollmentDetailForm } from './enrollment-detail-form.validation';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { LabelDirective } from '@utils/directives/label.directive';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { FormField as FF } from '@angular/forms/signals';

const FORM_KEY = 'enrollmentDetailForm';

@Component({
    selector: 'app-enrollment-detail-form',
    standalone: true,
    imports: [
        CommonModule, FF,
        ButtonModule, DividerModule, Select,
        InputTextModule, LabelDirective, ErrorMessageDirective,
    ],
    templateUrl: './enrollment-detail-form.component.html',
})
export class EnrollmentDetailFormComponent implements OnInit {
    // Recibe parámetros del container — igual que principal-data recibe del career-form
    @Input() id: string = RoutesEnum.NEW;
    @Input() enrollmentId = '';

    protected readonly enrollmentService = inject(EnrollmentService);
    private readonly cataloguesHttpService = inject(CataloguesHttpService);
    private readonly catalogueService = inject(CatalogueService);
    private readonly messageService = inject(CustomMessageService);
    private readonly formRegistryService = inject(FormRegistryService);
    protected readonly appService = inject(AppService);
    protected readonly store = inject(EnrollmentStore);

    protected readonly CustomIcons = CustomIcons;

    get isNew(): boolean { return this.id === RoutesEnum.NEW; }

    protected isFormLoading = signal(false);
    protected enrolledSubjectIds = signal<string[]>([]);

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
                validateEnrollmentDetailForm(schema, this.isNew)
        );

    constructor() {
        // Sincroniza form$ → store → sessionStorage
        effect(() => { this.store.updateSection('detailForm', this.form$()); });

        // Recalcular autoNumber cuando cambia la asignatura
        effect(() => {
            const selectedSubject = this.form$().subject;
            if (this.isNew && selectedSubject?.id) {
                this.enrollmentService.findDetailsByEnrollment(this.enrollmentId)
                    .subscribe({
                        next: (details: EnrollmentDetailModel[]) => {
                            const count = details.filter(d => d.subject?.id === selectedSubject.id).length;
                            this.store.setAutoNumber(Math.min(count + 1, 3));
                        }
                    });
            }
        });
    }

    ngOnInit(): void {
        this.formRegistryService.register('Datos de Asignatura', FORM_KEY, this.formData, this.form$());
        this.loadCatalogues();
        this.loadSubjects();
        if (!this.isNew) this.loadData();
    }

    // USAR CON LOGIN — reemplazar loadCatalogues por esto:
    // private loadCatalogues(): void {
    //     this.types.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_type));
    //     this.workdays.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_workday));
    //     this.parallels.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_parallel));
    //     this.academicStates.set(this.catalogueService.findByType(CatalogueTypeEnum.enrollment_academic_state));
    // }
    private loadCatalogues(): void {
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_type)
            .subscribe({ next: v => this.types.set(v as CatalogueInterface[]) });
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_workday)
            .subscribe({ next: v => this.workdays.set(v as CatalogueInterface[]) });
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_parallel)
            .subscribe({ next: v => this.parallels.set(v as CatalogueInterface[]) });
        this.cataloguesHttpService.findByTypeObservable(CatalogueTypeEnum.enrollment_academic_state)
            .subscribe({ next: v => this.academicStates.set(v as CatalogueInterface[]) });
    }

    private loadSubjects(): void {
        const cachedCareerId = this.store.selectedItem()?.career?.id;
        if (cachedCareerId) {
            this.loadSubjectsByCareer(cachedCareerId);
            return;
        }
        // Si no hay selectedItem (recarga de página), reconstruir contexto
        this.enrollmentService.findEnrollment(this.enrollmentId).subscribe({
            next: (enrollment) => {
                const careerId = enrollment?.career?.id;
                if (careerId) {
                    this.store.selectItem(enrollment);
                    this.loadSubjectsByCareer(careerId);
                }
            }
        });
    }

    private loadSubjectsByCareer(careerId: string): void {
        this.enrollmentService.findSubjectsByCareer(careerId).subscribe({
            next: (items: SubjectModel[]) => {
                this.subjects.set(items);
                this.enrollmentService.findDetailsByEnrollment(this.enrollmentId).subscribe({
                    next: (details: EnrollmentDetailModel[]) => {
                        this.enrolledSubjectIds.set(
                            details.map(d => d.subject?.id).filter((id): id is string => !!id)
                        );
                        if (this.isNew) this.store.setAutoNumber(Math.min(details.length + 1, 3));
                    }
                });
            }
        });
    }

    private loadData(): void {
        this.isFormLoading.set(true);
        this.enrollmentService.findOneDetail(this.id).subscribe({
            next: (d: EnrollmentDetailModel | null) => {
                this.isFormLoading.set(false);
                if (!d) {
                    if (this.store.hasDetailFormData()) this.form$.set(this.store.detailFormSection());
                    return;
                }
                const stored = this.store.hasDetailFormData() ? this.store.detailFormSection() : null;
                this.form$.set({
                    subject: d.subject ?? null,
                    type: d.type ?? null,
                    workday: stored?.workday ?? d.workday ?? null,
                    parallel: stored?.parallel ?? d.parallel ?? null,
                    number: d.number ?? null,
                    date: d.date ?? null,
                    finalGrade: stored?.finalGrade ?? d.finalGrade ?? null,
                    finalAttendance: stored?.finalAttendance ?? d.finalAttendance ?? null,
                    academicState: stored?.academicState ?? d.academicState ?? null,
                    observation: stored?.observation ?? d.observation ?? null,
                });
                this.store.updateSection('detailForm', this.form$());
            },
            error: () => {
                this.isFormLoading.set(false);
                if (this.store.hasDetailFormData()) this.form$.set(this.store.detailFormSection());
            }
        });
    }

    isSubjectDisabled(subject: SubjectModel): boolean {
        return this.enrolledSubjectIds().includes(subject.id);
    }
}
