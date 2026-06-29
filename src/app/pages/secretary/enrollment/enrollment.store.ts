import {computed, Injectable, signal} from '@angular/core';
import {
  EnrollmentDetailStateModel,
  EnrollmentFiltersState,
  EnrollmentStateModel,
  ENROLLMENT_DETAIL_INITIAL_STATE,
  ENROLLMENT_FILTERS_INITIAL_STATE,
  ENROLLMENT_INITIAL_STATE,
} from './enrollment.state';
import {EnrollmentModel, PaginatorModel} from '@models/core';

@Injectable({providedIn: 'root'})
export class EnrollmentStore {

  // ─── Filters ───────────────────────────────────────────────────────────────
  readonly filters = signal<EnrollmentFiltersState>(ENROLLMENT_FILTERS_INITIAL_STATE);

  readonly selectedSchoolPeriod    = computed(() => this.filters().schoolPeriod);
  readonly selectedCareer          = computed(() => this.filters().career);
  readonly selectedAcademicPeriod  = computed(() => this.filters().academicPeriod);
  readonly selectedEnrollmentState = computed(() => this.filters().enrollmentState);
  readonly search                  = computed(() => this.filters().search);
  readonly canSearch               = computed(() => !!this.filters().schoolPeriod && !!this.filters().career);

  updateFilter<K extends keyof EnrollmentFiltersState>(key: K, value: EnrollmentFiltersState[K]): void {
    this.filters.update(s => ({...s, [key]: value}));
  }

  // ─── List ──────────────────────────────────────────────────────────────────
  readonly items     = signal<EnrollmentModel[]>([]);
  readonly paginator = signal<PaginatorModel>({limit: 10, offset: 0, page: 0, totalItems: 0});
  readonly isLoading = signal(false);

  setItems(items: EnrollmentModel[], paginator: PaginatorModel): void {
    this.items.set(items);
    this.paginator.set(paginator);
  }

  // ─── Selected ──────────────────────────────────────────────────────────────
  readonly selectedItem = signal<EnrollmentModel | null>(null);

  selectItem(item: EnrollmentModel): void { this.selectedItem.set(item); }

  // ─── Enrollment form state ─────────────────────────────────────────────────
  readonly enrollmentForm = signal<EnrollmentStateModel>(ENROLLMENT_INITIAL_STATE);
  readonly enrollmentFormSection = computed(() => this.enrollmentForm());

  updateEnrollmentForm(data: Partial<EnrollmentStateModel>): void {
    this.enrollmentForm.update(s => ({...s, ...data}));
  }
  resetEnrollmentForm(): void { this.enrollmentForm.set(ENROLLMENT_INITIAL_STATE); }

  // ─── Detail form state ─────────────────────────────────────────────────────
  readonly detailForm = signal<EnrollmentDetailStateModel>(ENROLLMENT_DETAIL_INITIAL_STATE);
  readonly detailFormSection = computed(() => this.detailForm());

  updateDetailForm(data: Partial<EnrollmentDetailStateModel>): void {
    this.detailForm.update(s => ({...s, ...data}));
  }
  resetDetailForm(): void { this.detailForm.set(ENROLLMENT_DETAIL_INITIAL_STATE); }
}
