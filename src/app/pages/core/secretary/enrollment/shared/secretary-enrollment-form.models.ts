export interface ServerResponse<T = unknown> {
    data: T;
    pagination?: PaginationModel;
    message?: string;
    title?: string;
}

export interface PaginationModel {
    totalItems?: number;
    currentPage?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    lastPage?: number;
}

export interface CatalogueModel {
    id: string;
    name: string;
    code?: string;
    type?: string;
}

export interface SchoolPeriodModel {
    id: string;
    name: string;
    code?: string;
}

export interface CurriculumModel {
    id: string;
    name?: string;
}

export interface CareerModel {
    id: string;
    name: string;
    code?: string;
    curriculums?: CurriculumModel[];
}

export interface SubjectModel {
    id: string;
    code?: string;
    name: string;
    academicPeriod?: CatalogueModel | null;
}

export interface EnrollmentModel {
    id: string;
    career?: CareerModel | null;
    student?: {
        informationStudent?: unknown | null;
        user?: {
            identification?: string | null;
            lastname?: string | null;
            name?: string | null;
            email?: string | null;
            personalEmail?: string | null;
            cellPhone?: string | null;
            phone?: string | null;
        } | null;
    } | null;
    states?: {
        state?: CatalogueModel | null;
    } | null;
    date?: string | Date | null;
    code?: string | null;
    socioeconomicCategory?: string | null;
    socioeconomicPercentage?: string | null;
    socioeconomicScore?: string | null;
    observation?: string | null;
    enrollmentState?: { state?: CatalogueModel | null } | CatalogueModel | null;
}

export interface EnrollmentDetailModel {
    id: string;
    enrollmentId?: string | null;
    subject?: SubjectModel | null;
    academicPeriod?: CatalogueModel | null;
    type?: CatalogueModel | null;
    workday?: CatalogueModel | null;
    parallel?: CatalogueModel | null;
    number?: number | null;
    date?: string | Date | null;
    finalGrade?: number | null;
    finalAttendance?: number | null;
    academicState?: CatalogueModel | null;
    enrollmentDetailState?: { state?: CatalogueModel | null } | CatalogueModel | null;
    observation?: string | null;
}

export interface SecretaryEnrollmentHeaderFormModel {
    student: {
        user: {
            identification: string;
            lastname: string;
            name: string;
            email: string;
            personalEmail: string;
            cellPhone: string;
            phone: string;
        };
    };
    date: string;
    code: string;
    socioeconomicCategory: string;
    socioeconomicPercentage: string;
    socioeconomicScore: string;
    observation: string;
    enrollmentStateName: string;
}

export interface SecretaryEnrollmentDetailFormModel {
    enrollmentId: string;
    academicPeriodId: string;
    subjectId: string;
    typeId: string;
    workdayId: string;
    parallelId: string;
    number: number;
    date: string;
    finalGrade: number | null;
    finalAttendance: number | null;
    academicStateId: string;
    observation: string;
}

export type EnrollmentAction = 'edit' | 'subjects' | 'approve' | 'enroll' | 'reject' | 'certificate' | 'revoke';
