import { computed, effect, Injectable, signal } from '@angular/core';
import {
    EnrollmentDetailStateModel,
    EnrollmentFiltersState,
    EnrollmentStateModel,
    ENROLLMENT_DETAIL_INITIAL_STATE,
    ENROLLMENT_FILTERS_INITIAL_STATE,
    ENROLLMENT_INITIAL_STATE,
} from './enrollment.state';
import { EnrollmentModel, PaginatorModel } from '@utils/interfaces';

const DETAIL_FORM_KEY = 'enrollmentDetailForm';
const ENROLLMENT_FORM_KEY = 'enrollmentForm';

const PAGINATOR_INITIAL: PaginatorModel = {
    totalItems: 0, limit: 10, page: 0, offset: 0,
};

@Injectable({ providedIn: 'root' })
export class EnrollmentStore {

    // ─── Filtros de la lista ───────────────────────────────────────────────────
    readonly filters = signal<EnrollmentFiltersState>(ENROLLMENT_FILTERS_INITIAL_STATE);
    readonly canSearch = computed(() =>
        !!this.filters().schoolPeriod && !!this.filters().career
    );

    readonly selectedSchoolPeriod = computed(() => this.filters().schoolPeriod);
    readonly selectedCareer = computed(() => this.filters().career);
    readonly selectedAcademicPeriod = computed(() => this.filters().academicPeriod);
    readonly selectedEnrollmentState = computed(() => this.filters().enrollmentState);
    readonly search = computed(() => this.filters().search);

    updateFilter<K extends keyof EnrollmentFiltersState>(
        key: K, value: EnrollmentFiltersState[K]
    ): void {
        this.filters.update(s => ({ ...s, [key]: value }));
    }

    // ─── Lista de matrículas ───────────────────────────────────────────────────
    readonly items = signal<EnrollmentModel[]>([]);
    readonly paginator = signal<PaginatorModel>(PAGINATOR_INITIAL);
    readonly isLoading = signal(false);

    setItems(items: EnrollmentModel[], paginator: PaginatorModel): void {
        this.items.set(items);
        this.paginator.set(paginator);
    }

    // ─── Item seleccionado ─────────────────────────────────────────────────────
    readonly selectedItem = signal<EnrollmentModel | null>(null);

    selectItem(item: EnrollmentModel): void {
        this.selectedItem.set(item);
    }

    // ─── Formulario de matrícula ───────────────────────────────────────────────
    readonly enrollmentForm = signal<EnrollmentStateModel>(
        this.loadFromStorage<EnrollmentStateModel>(ENROLLMENT_FORM_KEY, ENROLLMENT_INITIAL_STATE)
    );

    readonly enrollmentFormSection = computed(() => this.enrollmentForm());

    updateEnrollmentForm(data: Partial<EnrollmentStateModel>): void {
        this.enrollmentForm.update(s => ({ ...s, ...data }));
    }

    resetEnrollmentForm(): void {
        this.enrollmentForm.set(ENROLLMENT_INITIAL_STATE);
        sessionStorage.removeItem(ENROLLMENT_FORM_KEY);
    }

    // ─── Formulario de detalle de asignatura ──────────────────────────────────
    readonly detailForm = signal<EnrollmentDetailStateModel>(
        this.loadFromStorage<EnrollmentDetailStateModel>(DETAIL_FORM_KEY, ENROLLMENT_DETAIL_INITIAL_STATE)
    );

    readonly detailFormSection = computed(() => this.detailForm());

    updateDetailForm(data: Partial<EnrollmentDetailStateModel>): void {
        this.detailForm.update(s => ({ ...s, ...data }));
    }

    resetDetailForm(): void {
        this.detailForm.set(ENROLLMENT_DETAIL_INITIAL_STATE);
        sessionStorage.removeItem(DETAIL_FORM_KEY);
    }

    // ─── Constructor — effect guarda automáticamente en sessionStorage ─────────
    constructor() {
        effect(() => {
            sessionStorage.setItem(ENROLLMENT_FORM_KEY, JSON.stringify(this.enrollmentForm()));
        });
        effect(() => {
            sessionStorage.setItem(DETAIL_FORM_KEY, JSON.stringify(this.detailForm()));
        });
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
    private loadFromStorage<T>(key: string, fallback: T): T {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    }
}