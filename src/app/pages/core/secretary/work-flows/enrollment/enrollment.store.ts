import { computed, effect, Injectable, signal } from '@angular/core';
import { pickKeys } from '@utils/helpers/pickKeys.helper';
import {
    EnrollmentDetailStateModel,
    EnrollmentFiltersState,
    EnrollmentStateModel,
    ENROLLMENT_DETAIL_INITIAL_STATE,
    ENROLLMENT_FILTERS_INITIAL_STATE,
    ENROLLMENT_INITIAL_STATE,
} from './enrollment.state';
import { EnrollmentModel, PaginationInterface } from '@utils/interfaces';

// ─── Claves de sessionStorage ─────────────────────────────────────────────────
const DETAIL_FORM_KEY = 'enrollmentDetailForm';
const ENROLLMENT_FORM_KEY = 'enrollmentForm';

// ─── Keys válidas por sección ─────────────────────────────────────────────────
const DETAIL_FORM_KEYS: Array<keyof EnrollmentDetailStateModel> = [
    'subject', 'type', 'workday', 'parallel', 'number',
    'date', 'finalGrade', 'finalAttendance', 'academicState', 'observation',
];

const ENROLLMENT_FORM_KEYS: Array<keyof EnrollmentStateModel> = [
    'student', 'date', 'code', 'type', 'academicPeriod',
    'workday', 'parallel', 'observation', 'enrollmentState',
];

// Paginación inicial
const PAGINATOR_INITIAL: PaginationInterface = {
    page: 1, limit: 10, totalItems: 0,
};

@Injectable({ providedIn: 'root' })
export class EnrollmentStore {

    // ─── Filtros de la lista ───────────────────────────────────────────────────
    readonly filters = signal<EnrollmentFiltersState>(ENROLLMENT_FILTERS_INITIAL_STATE);
    readonly canSearch = computed(() =>
        !!this.filters().schoolPeriod && !!this.filters().career
    );

    // Accesos directos para el HTML
    // Accesos directos para el HTML
    readonly selectedSchoolPeriod = computed(() => this.filters().schoolPeriod);
    readonly selectedCareer = computed(() => this.filters().career);
    readonly selectedSubject = computed(() => this.filters().subject);
    readonly selectedEnrollmentState = computed(() => this.filters().enrollmentState);
    readonly search = computed(() => this.filters().search);

    updateFilter<K extends keyof EnrollmentFiltersState>(key: K, value: EnrollmentFiltersState[K]): void {
        this.filters.update(s => ({ ...s, [key]: value }));
    }

    // ─── Lista de matrículas ───────────────────────────────────────────────────
    readonly items = signal<EnrollmentModel[]>([]);
    readonly paginator = signal<PaginationInterface>(PAGINATOR_INITIAL);

    // Actualiza lista y paginación en una sola operación
    setItems(items: EnrollmentModel[], paginator: PaginationInterface): void {
        this.items.set(items);
        this.paginator.set(paginator);
    }

    // ─── Item seleccionado ─────────────────────────────────────────────────────
    readonly selectedItem = signal<EnrollmentModel | null>(null);

    selectItem(item: EnrollmentModel): void {
        this.selectedItem.set(item);
    }

    // ─── Periodo lectivo abierto ───────────────────────────────────────────────
    // Guarda el ID del periodo que el backend marcó como "abierto/activo".
    readonly openSchoolPeriodId = signal<string>('');

    setOpenSchoolPeriod(id: string): void {
        this.openSchoolPeriodId.set(id);
    }
    readonly isOpenPeriodSelected = computed(() => {
        const selected = this.filters().schoolPeriod;
        if (!selected?.id || !this.openSchoolPeriodId()) return true;
        return selected.id === this.openSchoolPeriodId();
    });

    isSchoolPeriodOpen(schoolPeriodId: string | undefined | null): boolean {
        if (!schoolPeriodId || !this.openSchoolPeriodId()) return true;
        return schoolPeriodId === this.openSchoolPeriodId();
    }

    // ─── Número automático de matrícula ───────────────────────────────────────
    readonly autoNumber = signal<number>(1);

    setAutoNumber(n: number): void {
        this.autoNumber.set(n);
    }

    // ─── Formulario de matrícula ───────────────────────────────────────────────
    readonly enrollmentForm = signal<EnrollmentStateModel>(
        this.loadFromStorage<EnrollmentStateModel>(ENROLLMENT_FORM_KEY, ENROLLMENT_INITIAL_STATE)
    );
    readonly enrollmentFormSection = computed(() => this.enrollmentForm());

    resetEnrollmentForm(): void {
        this.enrollmentForm.set(ENROLLMENT_INITIAL_STATE);
        sessionStorage.removeItem(ENROLLMENT_FORM_KEY);
    }

    // ─── Formulario de detalle de asignatura ──────────────────────────────────
    readonly detailForm = signal<EnrollmentDetailStateModel>(
        this.loadFromStorage<EnrollmentDetailStateModel>(DETAIL_FORM_KEY, ENROLLMENT_DETAIL_INITIAL_STATE)
    );
    readonly detailFormSection = computed(() => this.detailForm());

    // Usado por enrollment-detail-form para saber si debe recuperar del storage
    // o cargar todo desde el servidor al abrir el formulario de edición
    hasDetailFormData(): boolean {
        return !!sessionStorage.getItem(DETAIL_FORM_KEY);
    }

    resetDetailForm(): void {
        this.detailForm.set(ENROLLMENT_DETAIL_INITIAL_STATE);
        sessionStorage.removeItem(DETAIL_FORM_KEY);
    }

    // ─── updateSection ───────────────────────
    updateSection(section: 'enrollmentForm', data: Partial<EnrollmentStateModel>): void;
    updateSection(section: 'detailForm', data: Partial<EnrollmentDetailStateModel>): void;
    updateSection(section: 'enrollmentForm' | 'detailForm', data: any): void {
        if (section === 'enrollmentForm') {
            const filtered = pickKeys(data, ENROLLMENT_FORM_KEYS);
            this.enrollmentForm.update(s => ({ ...s, ...filtered }));
        } else {
            const filtered = pickKeys(data, DETAIL_FORM_KEYS);
            this.detailForm.update(s => ({ ...s, ...filtered }));
        }
    }

    // ─── Constructor — persistencia automática en sessionStorage ──────────────
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
