import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { disabled, FieldTree, form, FormField, SchemaPathTree, submit } from '@angular/forms/signals';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { SecretaryEnrollmentApiService } from '../services/secretary-enrollment-api.service';
import { EnrollmentModel, SecretaryEnrollmentHeaderFormModel } from '../shared/secretary-enrollment-form.models';

@Component({
    selector: 'app-enrollment-form',
    standalone: true,
    imports: [CommonModule, RouterLink, Button, InputText, FormField, ErrorMessageDirective],
    templateUrl: './enrollment-form.component.html',
    styleUrl: './enrollment-form.component.scss'
})
export class EnrollmentFormComponent implements OnInit {
    private readonly api = inject(SecretaryEnrollmentApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    protected readonly id = this.route.snapshot.paramMap.get('id') ?? '';
    protected readonly loading = signal(false);
    protected readonly message = signal('');
    protected readonly enrollment = signal<EnrollmentModel | null>(null);

    protected readonly model = signal<SecretaryEnrollmentHeaderFormModel>(this.initialModel());
    protected readonly enrollmentForm: FieldTree<SecretaryEnrollmentHeaderFormModel> = form(this.model, path => this.applyRules(path));

    ngOnInit(): void {
        this.get();
    }

    private initialModel(): SecretaryEnrollmentHeaderFormModel {
        return {
            student: {
                user: {
                    identification: '',
                    lastname: '',
                    name: '',
                    email: '',
                    personalEmail: '',
                    cellPhone: '',
                    phone: ''
                }
            },
            date: '',
            code: '',
            socioeconomicCategory: '',
            socioeconomicPercentage: '',
            socioeconomicScore: '',
            observation: '',
            enrollmentStateName: ''
        };
    }

    private applyRules(path: SchemaPathTree<SecretaryEnrollmentHeaderFormModel>): void {
        disabled(path.student.user.identification);
        disabled(path.student.user.lastname);
        disabled(path.student.user.name);
        disabled(path.student.user.email);
        disabled(path.student.user.personalEmail);
        disabled(path.student.user.cellPhone);
        disabled(path.student.user.phone);
        disabled(path.date);
        disabled(path.code);
        disabled(path.socioeconomicCategory);
        disabled(path.socioeconomicPercentage);
        disabled(path.socioeconomicScore);
        disabled(path.enrollmentStateName);
    }

    private get(): void {
        if (!this.id) return;

        this.loading.set(true);
        this.api.findEnrollment(this.id).subscribe({
            next: enrollment => {
                this.enrollment.set(enrollment);
                this.model.set(this.mapEnrollmentToForm(enrollment));
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    private mapEnrollmentToForm(enrollment: EnrollmentModel): SecretaryEnrollmentHeaderFormModel {
        const user = enrollment.student?.user;
        const enrollmentState = enrollment.enrollmentState as any;

        return {
            student: {
                user: {
                    identification: user?.identification ?? '',
                    lastname: user?.lastname ?? '',
                    name: user?.name ?? '',
                    email: user?.email ?? '',
                    personalEmail: user?.personalEmail ?? '',
                    cellPhone: user?.cellPhone ?? '',
                    phone: user?.phone ?? ''
                }
            },
            date: this.formatDate(enrollment.date) ?? '',
            code: enrollment.code ?? '',
            socioeconomicCategory: enrollment.socioeconomicCategory ?? '',
            socioeconomicPercentage: enrollment.socioeconomicPercentage ?? '',
            socioeconomicScore: enrollment.socioeconomicScore ?? '',
            observation: enrollment.observation ?? '',
            enrollmentStateName: (enrollment.states?.state ?? enrollmentState?.state ?? enrollmentState)?.name ?? ''
        };
    }

    protected async save(event: Event): Promise<void> {
        event.preventDefault();

        const ok = await submit(this.enrollmentForm, async () => {
            const current = this.model();
            await new Promise<void>((resolve, reject) => {
                this.api.updateEnrollment(this.id, { observation: current.observation }).subscribe({
                    next: () => {
                        this.message.set('Matrícula actualizada correctamente.');
                        resolve();
                    },
                    error: error => reject(error)
                });
            });
        });

        if (!ok) this.message.set('Revise los campos del formulario.');
    }

    protected back(): void {
        void this.router.navigate(['/main/secretary/enrollments']);
    }

    protected goToDetails(): void {
        void this.router.navigate(['/main/secretary/enrollments', this.id, 'enrollment-details']);
    }

    private formatDate(value: string | Date | null | undefined): string | null {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toISOString().substring(0, 10);
    }
}
