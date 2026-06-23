import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { MY_ROUTES } from '@routes';
import { SecretaryEnrollmentApiService } from '../services/secretary-enrollment-api.service';
import { CatalogueModel, CareerModel, EnrollmentModel, SchoolPeriodModel } from '../shared/secretary-enrollment-form.models';

@Component({
    selector: 'app-enrollment-list',
    standalone: true,
    imports: [CommonModule, FormsModule, Button, InputText, Select, Tag, TableModule, Paginator, IconField, InputIcon, Tooltip],
    templateUrl: './enrollment-list.component.html',
    styleUrl: './enrollment-list.component.scss'
})
export class EnrollmentListComponent implements OnInit {
    private readonly api = inject(SecretaryEnrollmentApiService);
    private readonly router = inject(Router);

    protected readonly schoolPeriods = signal<SchoolPeriodModel[]>([]);
    protected readonly careers = signal<CareerModel[]>([]);
    protected readonly academicPeriods = signal<CatalogueModel[]>([]);
    protected readonly enrollmentStates = signal<CatalogueModel[]>([]);
    protected readonly enrollments = signal<EnrollmentModel[]>([]);
    protected readonly loading = signal(false);

    protected readonly selectedSchoolPeriod = signal<SchoolPeriodModel | null>(null);
    protected readonly selectedCareer = signal<CareerModel | null>(null);
    protected readonly selectedAcademicPeriod = signal<CatalogueModel | null>(null);
    protected readonly selectedEnrollmentState = signal<CatalogueModel | null>(null);
    protected readonly search = signal('');

    protected readonly totalRecords = signal(0);
    protected readonly first = signal(0);
    protected readonly rows = signal(10);

    protected readonly canSearch = computed(() => !!this.selectedCareer() && !!this.selectedSchoolPeriod());

    ngOnInit(): void {
        this.loadFilters();
    }

    private loadFilters(): void {
        this.api.findSchoolPeriods().subscribe(items => {
            this.schoolPeriods.set(items);
            if (items.length) this.selectedSchoolPeriod.set(items[0]);
            this.findEnrollments();
        });

        this.api.findCareers().subscribe(items => {
            this.careers.set(items);
            if (items.length) this.selectedCareer.set(items[0]);
            this.findEnrollments();
        });

        this.api.findCataloguesByType('ACADEMIC_PERIOD').subscribe(items => this.academicPeriods.set(items));
        this.api.findCataloguesByType('ENROLLMENTS_STATE').subscribe(items => this.enrollmentStates.set(items));
    }

    protected findEnrollments(page = 0): void {
        const career = this.selectedCareer();
        const schoolPeriod = this.selectedSchoolPeriod();

        if (!career || !schoolPeriod) return;

        this.loading.set(true);
        this.api.findEnrollmentsByCareer(
            career.id,
            schoolPeriod.id,
            this.selectedAcademicPeriod()?.id,
            this.selectedEnrollmentState()?.id,
            page,
            this.search()
        ).subscribe({
            next: response => {
                this.enrollments.set(response.data ?? []);
                this.totalRecords.set(response.pagination?.totalItems ?? response.data?.length ?? 0);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    protected onPage(event: any): void {
        this.first.set(event.first ?? 0);
        this.rows.set(event.rows ?? 10);
        this.findEnrollments(event.page ?? 0);
    }

    protected edit(item: EnrollmentModel): void {
        void this.router.navigate([MY_ROUTES.corePages.secretary.enrollment.absolute, item.id]);
    }

    protected subjects(item: EnrollmentModel): void {
        void this.router.navigate([MY_ROUTES.corePages.secretary.enrollment.absolute, item.id, 'enrollment-details']);
    }

    protected approve(item: EnrollmentModel): void {
        this.api.approveEnrollment(item.id).subscribe(() => this.findEnrollments());
    }

    protected enroll(item: EnrollmentModel): void {
        this.api.enrollEnrollment(item.id).subscribe(() => this.findEnrollments());
    }

    protected reject(item: EnrollmentModel): void {
        this.api.rejectEnrollment(item.id).subscribe(() => this.findEnrollments());
    }

    protected revoke(item: EnrollmentModel): void {
        this.api.revokeEnrollment(item.id).subscribe(() => this.findEnrollments());
    }

    protected getStudentName(item: EnrollmentModel): string {
        const user = item.student?.user;
        return `${user?.lastname ?? ''} ${user?.name ?? ''}`.trim();
    }

    protected getEnrollmentState(item: EnrollmentModel): string {
        const enrollmentState = item.enrollmentState as any;
        return item.states?.state?.name ?? enrollmentState?.state?.name ?? enrollmentState?.name ?? 'Sin estado';
    }

    protected getSeverity(item: EnrollmentModel): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const code = ((item.states?.state?.code ?? (item.enrollmentState as any)?.state?.code ?? (item.enrollmentState as any)?.code ?? '') as string).toUpperCase();
        if (code.includes('APPROVED') || code.includes('APROB')) return 'success';
        if (code.includes('ENROLLED') || code.includes('MATR')) return 'info';
        if (code.includes('REJECT')) return 'danger';
        if (code.includes('REVOK')) return 'warn';
        return 'secondary';
    }
}
