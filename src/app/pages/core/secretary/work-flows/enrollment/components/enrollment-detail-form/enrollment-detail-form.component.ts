import { Component, computed, effect, inject, Injector, Input, OnInit, runInInjectionContext, signal } from '@angular/core';
import { FieldTree, form, FormField, SchemaPathTree } from '@angular/forms/signals';

import { AppService, CatalogueService, CataloguesHttpService, CustomMessageService } from '@utils/services';
import { FormRegistryService } from '@utils/services/form-registry.service';
import { CustomIcons } from '@utils/icons/custom-icons';

import { CatalogueInterface, EnrollmentDetailModel, SubjectModel } from '@utils/interfaces';
import { CatalogueEnrollmentStateEnum, CatalogueTypeEnum, RoutesEnum } from '@utils/enums';
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
    // ─── Parámetros recibidos del enrollment-container ─────────────────────────
    @Input() id: string = RoutesEnum.NEW;
    @Input() enrollmentId: string = '';

    protected readonly enrollmentService = inject(EnrollmentService);
    private readonly cataloguesHttpService = inject(CataloguesHttpService);
    private readonly catalogueService = inject(CatalogueService); // usar cuando haya login real
    private readonly messageService = inject(CustomMessageService);
    private readonly formRegistryService = inject(FormRegistryService);
    protected readonly appService = inject(AppService);
    protected readonly store = inject(EnrollmentStore);

    protected readonly CustomIcons = CustomIcons;

    get isNew(): boolean { return this.id === RoutesEnum.NEW; }

    protected isFormLoading = signal(false);
    protected enrolledSubjectIds = signal<string[]>([]);

    // solo se puede seleccionar el nivel que le corresponde al estudiante
    protected requiredAcademicPeriod = signal<string | null>(null);

    // si el nivel requerido ya agotó sus 3 intentos se destraba temporalmente el nivel
    // anterior (aunque ya esté aprobado) para que pueda volver a tomarlo; al
    // aprobarlo de nuevo, calculateEnrollmentNumber() del nivel atascado vuelve a
    // contar desde ahí en adelante de forma natural (cuenta reprobados con estado
    // Matriculado, no historial completo sin condición).
    protected unlockedPreviousLevel = signal<string | null>(null);

    // ─── Solo lectura si el período está cerrado o la matrícula fue anulada/rechazada.
    protected readonly isReadOnly = computed(() => {
        const parentCode = this.store.selectedItem()?.enrollmentState?.state?.code ?? '';
        const parentNotRevoked = parentCode !== CatalogueEnrollmentStateEnum.REVOKED &&
            parentCode !== CatalogueEnrollmentStateEnum.REJECTED;
        const isActivePeriod = this.store.isSchoolPeriodOpen(this.store.selectedItem()?.schoolPeriod?.id);
        return !(parentNotRevoked && isActivePeriod);
    });

    // ─── Catálogos para los dropdowns ─────────────────────────────────────────
    protected types = signal<CatalogueInterface[]>([]);
    protected workdays = signal<CatalogueInterface[]>([]);
    protected parallels = signal<CatalogueInterface[]>([]);
    protected academicStates = signal<CatalogueInterface[]>([]);
    protected subjects = signal<SubjectModel[]>([]);

    protected readonly form$ = signal<EnrollmentDetailStateModel>(this.store.detailFormSection());

    // ─── formData con runInInjectionContext ────────────────────────────────────
    private readonly injector = inject(Injector);
    protected formData!: FieldTree<EnrollmentDetailStateModel>;

    constructor() {
        effect(() => { this.store.updateSection('detailForm', this.form$()); });
    }

    ngOnInit(): void {

        this.formData = runInInjectionContext(this.injector, () =>
            form<EnrollmentDetailStateModel>(
                this.form$,
                (schema: SchemaPathTree<EnrollmentDetailStateModel>) =>
                    validateEnrollmentDetailForm(schema, this.isNew)
            )
        );
        this.formRegistryService.register('Datos de Asignatura', FORM_KEY, this.formData, this.form$());
        this.loadCatalogues();
        this.loadSubjects();
        if (!this.isNew) this.loadData();
    }

    // ─── Catálogos ────────────────────────────────────────────────────────────
    // TEMPORAL — usa CataloguesHttpService (petición HTTP con caché shareReplay)
    // porque CatalogueService.findByType() requiere sessionStorage del login real.
    // Al conectar el backend con login, reemplazar por el bloque comentado:
    //
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

    // ─── Asignaturas ──────────────────────────────────────────────────────────
    private loadSubjects(): void {
        const cachedItem = this.store.selectedItem();
        const cachedCareerId = cachedItem?.career?.id;
        const cachedStudentId = cachedItem?.student?.id;

        if (cachedCareerId && cachedStudentId) {
            this.loadSubjectsByCareer(cachedCareerId, cachedStudentId);
            return;
        }
        this.enrollmentService.findEnrollment(this.enrollmentId).subscribe({
            next: (enrollment) => {
                const careerId = enrollment?.career?.id;
                const studentId = enrollment?.student?.id;
                if (careerId && studentId) {
                    this.store.selectItem(enrollment);
                    this.loadSubjectsByCareer(careerId, studentId);
                }
            }
        });
    }

    private loadSubjectsByCareer(careerId: string, studentId: string): void {
        this.enrollmentService.findRequiredAcademicPeriod(studentId, careerId).subscribe({
            next: (level) => {
                this.requiredAcademicPeriod.set(level);

                this.enrollmentService.findSubjectsByCareer(careerId).subscribe({
                    next: (items: SubjectModel[]) => {
                        this.subjects.set(items);

                        // Detecta si el nivel requerido ya agotó sus 3 intentos —
                        // de ser así, destraba el nivel anterior para reintentarlo.
                        if (level !== null) {
                            const targetSubject = items.find(s => s.academicPeriod?.code === level);
                            if (targetSubject) {
                                this.enrollmentService.calculateEnrollmentNumber(studentId, targetSubject.id).subscribe({
                                    next: (attempts) => {
                                        if (attempts >= 3) {
                                            const previousLevel = (parseInt(level) - 1).toString();
                                            this.unlockedPreviousLevel.set(previousLevel);
                                        }
                                    }
                                });
                            }
                        }

                        this.enrollmentService.findDetailsByEnrollment(this.enrollmentId).subscribe({
                            next: (details: EnrollmentDetailModel[]) => {
                                this.enrolledSubjectIds.set(
                                    details.map(d => d.subject?.id).filter((id): id is string => !!id)
                                );
                                if (this.isNew) this.store.setAutoNumber(1);
                            }
                        });
                    }
                });
            }
        });
    }

    onSubjectChange(subject: SubjectModel | null): void {
        if (!subject?.id || !this.isNew) return;

        const studentId = this.store.selectedItem()?.student?.id;

        if (studentId) {
            this.calculateNumber(studentId, subject.id);
        } else {
            // Mismo respaldo que loadSubjects(): si no hay nada en el store (ej.
            // recarga de página), se busca la matrícula completa primero.
            this.enrollmentService.findEnrollment(this.enrollmentId).subscribe({
                next: (enrollment) => {
                    if (enrollment?.student?.id) {
                        this.calculateNumber(enrollment.student.id, subject.id);
                    }
                }
            });
        }
    }

    private calculateNumber(studentId: string, subjectId: string): void {
        this.enrollmentService.calculateEnrollmentNumber(studentId, subjectId).subscribe({
            next: (number) => this.store.setAutoNumber(number)
        });
    }


    // ─── Carga de datos al editar ─────────────────────────────────────────────
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
                    number: d.number ?? null,
                    date: d.date ?? null,
                    workday: stored?.workday ?? d.workday ?? null,
                    parallel: stored?.parallel ?? d.parallel ?? null,
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

    // revisa que sea el nivel que le corresponde al estudiante según su historial,
    // o el nivel anterior destrabado por atasco (ver unlockedPreviousLevel).
    isSubjectDisabled(subject: SubjectModel): boolean {
        if (this.enrolledSubjectIds().includes(subject.id)) return true;

        const required = this.requiredAcademicPeriod();
        if (required === null) return false;

        if (subject.academicPeriod?.code === required) return false;

        const unlocked = this.unlockedPreviousLevel();
        if (unlocked !== null && subject.academicPeriod?.code === unlocked) return false;

        return true;
    }
}