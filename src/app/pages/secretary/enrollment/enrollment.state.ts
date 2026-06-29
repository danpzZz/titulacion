import {CatalogueModel, CareerModel, SchoolPeriodModel} from '@models/core';

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface EnrollmentStateModel {
  student: StudentStateModel;
  date: string | null;
  code: string | null;
  type: CatalogueModel | null;
  academicPeriod: CatalogueModel | null;
  workday: CatalogueModel | null;
  parallel: CatalogueModel | null;
  observation: string | null;
  enrollmentState: EnrollmentStateRefModel | null;
  socioeconomicCategory: string | null;
  socioeconomicPercentage: string | null;
  socioeconomicScore: string | null;
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
  state: CatalogueModel;
}

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
  socioeconomicCategory: null,
  socioeconomicPercentage: null,
  socioeconomicScore: null,
};

// ─── Enrollment Detail ────────────────────────────────────────────────────────

export interface EnrollmentDetailStateModel {
  subject: any | null;
  type: CatalogueModel | null;
  workday: CatalogueModel | null;
  parallel: CatalogueModel | null;
  number: number | null;
  date: string | null;
  finalGrade: number | null;
  finalAttendance: number | null;
  academicState: CatalogueModel | null;
  observation: string | null;
}

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

// ─── Filters (list) ───────────────────────────────────────────────────────────

export interface EnrollmentFiltersState {
  schoolPeriod: SchoolPeriodModel | null;
  career: CareerModel | null;
  academicPeriod: CatalogueModel | null;
  enrollmentState: CatalogueModel | null;
  search: string;
}

export const ENROLLMENT_FILTERS_INITIAL_STATE: EnrollmentFiltersState = {
  schoolPeriod: null,
  career: null,
  academicPeriod: null,
  enrollmentState: null,
  search: '',
};
