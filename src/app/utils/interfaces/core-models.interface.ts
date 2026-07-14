export interface CatalogueModel {
    id: string;
    name: string;
    code: string;
    description?: string;
    [key: string]: any;
}

export interface UserModel {
    id: string;
    identification: string;
    lastname: string;
    name: string;
    email?: string;
    cellPhone?: string;
    phone?: string;
    personalEmail?: string;
    [key: string]: any;
}

export interface StudentModel {
    id: string;
    user: UserModel;
    [key: string]: any;
}

export interface CareerModel {
    id: string;
    name: string;
    code?: string;
    acronym?: string;
    curriculums?: Array<{id: string; [key: string]: any}>;
    [key: string]: any;
}

export interface SchoolPeriodModel {
    id: string;
    name: string;
    shortName: string;
    [key: string]: any;
}

export interface SubjectModel {
    id: string;
    code: string;
    name: string;
    academicPeriod?: CatalogueModel;
    [key: string]: any;
}

export interface EnrollmentModel {
    id: string;
    code?: string;
    date?: string;
    student: StudentModel;
    career?: CareerModel;
    type?: CatalogueModel;
    academicPeriod?: CatalogueModel;
    workday?: CatalogueModel;
    parallel?: CatalogueModel;
    enrollmentState?: {state: CatalogueModel};
    observation?: string;
    socioeconomicCategory?: string;
    socioeconomicPercentage?: string | number;
    socioeconomicScore?: string | number;
    [key: string]: any;
}

export interface EnrollmentDetailModel {
    id: string;
    number?: number | string;
    date?: string;
    subject?: SubjectModel;
    type?: CatalogueModel;
    workday?: CatalogueModel;
    parallel?: CatalogueModel;
    enrollmentDetailState?: {state: CatalogueModel};
    finalGrade?: number | null;
    finalAttendance?: number | null;
    academicState?: CatalogueModel | null;
    observation?: string | null;
    [key: string]: any;
}

export interface PaginatorModel {
    totalItems: number;
    limit: number;
    page: number;
    offset: number;
}

export interface HttpResponseModel<T> {
    data: T;
    pagination?: PaginatorModel;
    message?: string;
    title?: string;
    [key: string]: any;
}
