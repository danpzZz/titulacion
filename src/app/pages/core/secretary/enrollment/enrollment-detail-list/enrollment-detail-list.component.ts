import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Divider } from 'primeng/divider';
import { MY_ROUTES } from '@routes';
import { SecretaryEnrollmentApiService } from '../services/secretary-enrollment-api.service';
import { EnrollmentDetailModel, EnrollmentModel } from '../shared/secretary-enrollment-form.models';

@Component({
    selector: 'app-enrollment-detail-list',
    standalone: true,
    imports: [CommonModule, Button, Tag, TableModule, Breadcrumb, Divider],
    templateUrl: './enrollment-detail-list.component.html',
    styleUrl: './enrollment-detail-list.component.scss'
})
export class EnrollmentDetailListComponent implements OnInit {
    private readonly api = inject(SecretaryEnrollmentApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    protected readonly enrollmentId = this.route.snapshot.paramMap.get('enrollmentId') ?? '';
    protected readonly enrollment = signal<EnrollmentModel | null>(null);
    protected readonly details = signal<EnrollmentDetailModel[]>([]);
    protected readonly loading = signal(false);

    ngOnInit(): void {
        this.getEnrollment();
        this.findDetails();
    }

    private getEnrollment(): void {
        if (!this.enrollmentId) return;
        this.api.findEnrollment(this.enrollmentId).subscribe(item => this.enrollment.set(item));
    }

    protected findDetails(): void {
        if (!this.enrollmentId) return;
        this.loading.set(true);
        this.api.findEnrollmentDetails(this.enrollmentId).subscribe({
            next: items => {
                this.details.set(items);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    protected create(): void {
        void this.router.navigate([MY_ROUTES.corePages.secretary.enrollment.absolute, this.enrollmentId, 'enrollment-details', 'new']);
    }

    protected edit(item: EnrollmentDetailModel): void {
        void this.router.navigate([MY_ROUTES.corePages.secretary.enrollment.absolute, this.enrollmentId, 'enrollment-details', item.id]);
    }

    protected back(): void {
        void this.router.navigate([MY_ROUTES.corePages.secretary.enrollment.absolute]);
    }

    protected approve(item: EnrollmentDetailModel): void {
        this.api.approveEnrollmentDetail(item.id).subscribe(() => this.findDetails());
    }

    protected enroll(item: EnrollmentDetailModel): void {
        this.api.enrollEnrollmentDetail(item.id).subscribe(() => this.findDetails());
    }

    protected reject(item: EnrollmentDetailModel): void {
        this.api.rejectEnrollmentDetail(item.id).subscribe(() => this.findDetails());
    }

    protected revoke(item: EnrollmentDetailModel): void {
        this.api.revokeEnrollmentDetail(item.id).subscribe(() => this.findDetails());
    }

    protected remove(item: EnrollmentDetailModel): void {
        this.api.removeEnrollmentDetail(item.id).subscribe(() => this.findDetails());
    }

    protected getStudentName(): string {
        const user = this.enrollment()?.student?.user;
        return `${user?.lastname ?? ''} ${user?.name ?? ''}`.trim();
    }

    protected getDetailState(item: EnrollmentDetailModel): string {
        const state = item.enrollmentDetailState as any;
        return state?.state?.name ?? state?.name ?? 'Sin estado';
    }

    protected getSeverity(item: EnrollmentDetailModel): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const state = item.enrollmentDetailState as any;
        const code = ((state?.state?.code ?? state?.code ?? '') as string).toUpperCase();
        if (code.includes('APPROVED') || code.includes('APROB')) return 'success';
        if (code.includes('ENROLLED') || code.includes('MATR')) return 'info';
        if (code.includes('REJECT')) return 'danger';
        if (code.includes('REVOK')) return 'warn';
        return 'secondary';
    }
}
