import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { disabled, FieldTree, form, FormField, max, min, required, SchemaPathTree, submit } from '@angular/forms/signals';
import { Button } from 'primeng/button';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Divider } from 'primeng/divider';
import { Skeleton } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { MY_ROUTES } from '@routes';
import { SecretaryEnrollmentApiService } from '../services/secretary-enrollment-api.service';
import {
    CatalogueModel,
    EnrollmentDetailModel,
    EnrollmentModel,
    SecretaryEnrollmentDetailFormModel,
    SubjectModel
} from '../shared/secretary-enrollment-form.models';

@Component({
    selector: 'app-enrollment-detail-form',
    standalone: true,
    imports: [CommonModule, FormsModule, Button, Select, FormField, ErrorMessageDirective, Breadcrumb, Divider, Skeleton],
    templateUrl: './enrollment-detail-form.component.html',
    styleUrl: './enrollment-detail-form.component.scss'
})
export class EnrollmentDetailFormComponent implements OnInit {
    private readonly api = inject(SecretaryEnrollmentApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    protected readonly enrollmentId = this.route.snapshot.paramMap.get('enrollmentId') ?? '';
    protected readonly id = this.route.snapshot.paramMap.get('id');
    protected readonly isEditMode = computed(() => !!this.id && this.id !== 'new');

    protected readonly enrollment = signal<EnrollmentModel | null>(null);
    protected readonly academicPeriods = signal<CatalogueModel[]>([]);
    protected readonly types = signal<CatalogueModel[]>([]);
    protected readonly workdays = signal<CatalogueModel[]>([]);
    protected readonly parallels = signal<CatalogueModel[]>([]);
    protected readonly academicStates = signal<CatalogueModel[]>([]);
    protected readonly subjects = signal<SubjectModel[]>([]);
    protected readonly loading = signal(false);
    protected readonly message = signal('');

    protected readonly model = signal<SecretaryEnrollmentDetailFormModel>(this.initialModel());
    protected readonly detailForm: FieldTree<SecretaryEnrollmentDetailFormModel> = form(this.model, path => this.applyRules(path));

    protected readonly filteredSubjects = computed(() => {
        const periodId = this.model().academicPeriodId;
        if (!periodId) return this.subjects();
        return this.subjects().filter(subject => subject.academicPeriod?.id === periodId);
    });

    ngOnInit(): void {
        this.getEnrollment();
        this.loadCatalogues();
    }

    private initialModel(): SecretaryEnrollmentDetailFormModel {
        return {
            enrollmentId: this.enrollmentId,
            academicPeriodId: '',
            subjectId: '',
            typeId: '',
            workdayId: '',
            parallelId: '',
            number: 1,
            date: new Date().toISOString().substring(0, 10),
            finalGrade: null,
            finalAttendance: null,
            academicStateId: '',
            observation: ''
        };
    }

    private applyRules(path: SchemaPathTree<SecretaryEnrollmentDetailFormModel>): void {
        required(path.academicPeriodId, { message: 'Periodo académico requerido.' });
        required(path.subjectId, { message: 'Asignatura requerida.' });
        required(path.typeId, { message: 'Tipo de matrícula requerido.' });
        required(path.workdayId, { message: 'Horario requerido.' });
        required(path.parallelId, { message: 'Paralelo requerido.' });
        required(path.number, { message: 'Número de matrícula requerido.' });
        min(path.number, 1, { message: 'El número mínimo permitido es 1.' });
        max(path.number, 3, { message: 'El número máximo permitido es 3.' });
        disabled(path.date);
        disabled(path.subjectId, () => this.isEditMode());
    }

    private getEnrollment(): void {
        this.api.findEnrollment(this.enrollmentId).subscribe(enrollment => {
            this.enrollment.set(enrollment);
            const curriculumId = enrollment.career?.curriculums?.[0]?.id;
            if (curriculumId) this.api.findSubjectsByCurriculum(curriculumId).subscribe(items => this.subjects.set(items));
            if (this.isEditMode()) this.getDetail();
        });
    }

    private loadCatalogues(): void {
        this.api.findCataloguesByType('ACADEMIC_PERIOD').subscribe(items => this.academicPeriods.set(items));
        this.api.findCataloguesByType('ENROLLMENTS_TYPE').subscribe(items => this.types.set(items));
        this.api.findCataloguesByType('ENROLLMENTS_WORKDAY').subscribe(items => this.workdays.set(items));
        this.api.findCataloguesByType('PARALLEL').subscribe(items => this.parallels.set(items));
        this.api.findCataloguesByType('ENROLLMENTS_ACADEMIC_STATE').subscribe(items => this.academicStates.set(items));
    }

    private getDetail(): void {
        if (!this.id || this.id === 'new') return;
        this.loading.set(true);
        this.api.findEnrollmentDetail(this.id).subscribe({
            next: detail => {
                this.model.set(this.mapDetailToForm(detail));
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    private mapDetailToForm(detail: EnrollmentDetailModel): SecretaryEnrollmentDetailFormModel {
        return {
            enrollmentId: this.enrollmentId,
            academicPeriodId: detail.academicPeriod?.id ?? detail.subject?.academicPeriod?.id ?? '',
            subjectId: detail.subject?.id ?? '',
            typeId: detail.type?.id ?? '',
            workdayId: detail.workday?.id ?? '',
            parallelId: detail.parallel?.id ?? '',
            number: detail.number ?? 1,
            date: this.formatDate(detail.date) ?? new Date().toISOString().substring(0, 10),
            finalGrade: detail.finalGrade ?? null,
            finalAttendance: detail.finalAttendance ?? null,
            academicStateId: detail.academicState?.id ?? '',
            observation: detail.observation ?? ''
        };
    }

    protected async save(event: Event): Promise<void> {
        event.preventDefault();

        const ok = await submit(this.detailForm, async () => {
            const payload = this.buildPayload();
            await new Promise<void>((resolve, reject) => {
                const request = this.isEditMode() && this.id
                    ? this.api.updateEnrollmentDetail(this.id, payload)
                    : this.api.createEnrollmentDetail(payload);

                request.subscribe({
                    next: () => {
                        this.message.set('Detalle de matrícula guardado correctamente.');
                        resolve();
                    },
                    error: error => reject(error)
                });
            });
        });

        if (ok) this.back();
        else this.message.set('Revise los campos requeridos del formulario.');
    }

    private buildPayload(): Partial<EnrollmentDetailModel> {
        const value = this.model();
        return {
            enrollmentId: this.enrollmentId,
            academicPeriod: this.academicPeriods().find(item => item.id === value.academicPeriodId) ?? null,
            subject: this.subjects().find(item => item.id === value.subjectId) ?? null,
            type: this.types().find(item => item.id === value.typeId) ?? null,
            workday: this.workdays().find(item => item.id === value.workdayId) ?? null,
            parallel: this.parallels().find(item => item.id === value.parallelId) ?? null,
            number: value.number,
            date: value.date,
            finalGrade: value.finalGrade,
            finalAttendance: value.finalAttendance,
            academicState: this.academicStates().find(item => item.id === value.academicStateId) ?? null,
            observation: value.observation
        };
    }

    protected back(): void {
        void this.router.navigate([MY_ROUTES.corePages.secretary.enrollment.absolute, this.enrollmentId, 'enrollment-details']);
    }

    private formatDate(value: string | Date | null | undefined): string | null {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toISOString().substring(0, 10);
    }
}
