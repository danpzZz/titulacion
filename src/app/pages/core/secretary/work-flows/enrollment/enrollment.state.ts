import { CatalogueInterface } from '@utils/interfaces';
import { CareerModel, SchoolPeriodModel } from '@utils/interfaces';

// ─── Enrollment — forma del formulario principal de matrícula ─────────────────
// Define los campos que se pueden editar en el formulario de matrícula.

export interface EnrollmentStateModel {
    student: StudentStateModel;
    date: string | null;
    code: string | null;
    type: CatalogueInterface | null;
    academicPeriod: CatalogueInterface | null;
    workday: CatalogueInterface | null;
    parallel: CatalogueInterface | null;
    observation: string | null;
    enrollmentState: EnrollmentStateRefModel | null;
}

export interface StudentStateModel {
    user: UserStateModel;
}

export interface UserStateModel {
    identification: string | null;
    lastname: string | null;
    name: string | null;
    email: string | null;
    personalEmail: string | null;
    cellPhone: string | null;
    phone: string | null;
}

export interface EnrollmentStateRefModel {
    state: CatalogueInterface;
}

// Estado inicial vacío — se usa al crear una nueva matrícula o limpiar el formulario
export const ENROLLMENT_INITIAL_STATE: EnrollmentStateModel = {
    student: {
        user: {
            identification: null,
            lastname: null,
            name: null,
            email: null,
            personalEmail: null,
            cellPhone: null,
            phone: null,
        },
    },
    date: null,
    code: null,
    type: null,
    academicPeriod: null,
    workday: null,
    parallel: null,
    observation: null,
    enrollmentState: null,
};

// ─── Enrollment Detail — forma del formulario de asignatura ───────────────────
// Define los campos editables del formulario de asignatura (enrollment-detail-form).

export interface EnrollmentDetailStateModel {
    subject: any | null;
    type: CatalogueInterface | null;
    workday: CatalogueInterface | null;
    parallel: CatalogueInterface | null;
    number: number | string | null;
    date: string | null;
    finalGrade: number | null;
    finalAttendance: number | null;
    academicState: CatalogueInterface | null;
    observation: string | null;
}

// Estado inicial vacío — se usa al crear una nueva asignatura o limpiar el formulario
export const ENROLLMENT_DETAIL_INITIAL_STATE: EnrollmentDetailStateModel = {
    subject: null,
    type: null,
    workday: null,
    parallel: null,
    number: null,
    date: null,
    finalGrade: null,
    finalAttendance: null,
    academicState: null,
    observation: null,
};

// ─── Filters — filtros de la lista de matrículas ──────────────────────────────

export interface EnrollmentFiltersState {
    schoolPeriod: SchoolPeriodModel | null;
    career: CareerModel | null;
    academicPeriod: CatalogueInterface | null;
    enrollmentState: CatalogueInterface | null;
    search: string;
}

// Estado inicial — sin filtros seleccionados y búsqueda vacía
export const ENROLLMENT_FILTERS_INITIAL_STATE: EnrollmentFiltersState = {
    schoolPeriod: null,
    career: null,
    academicPeriod: null,
    enrollmentState: null,
    search: '',
};
