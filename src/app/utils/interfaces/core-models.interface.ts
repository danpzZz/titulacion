// Minimal model stubs so the secretary/enrollment module compiles

export interface CatalogueModel {
    id: string;
    name: string;
    code: string;
    description?: string;
    [key: string]: any;
}

export interface CareerModel {
    id: string;
    name: string;
    curriculums?: CurriculumModel[];
    [key: string]: any;
}

export interface CurriculumModel {
    id: string;
    name: string;
    [key: string]: any;
}

export interface SchoolPeriodModel {
    id: string;
    name: string;
    shortName?: string;
    [key: string]: any;
}

export interface SubjectModel {
    id: string;
    name: string;
    code: string;
    academicPeriod?: CatalogueModel;
    [key: string]: any;
}

export interface EnrollmentModel {
    id: string;
    student: StudentModel;
    date?: string;
    code?: string;
    type?: CatalogueModel;
    academicPeriod?: CatalogueModel;
    workday?: CatalogueModel;
    parallel?: CatalogueModel;
    observation?: string;
    enrollmentState?: { state: CatalogueModel };
    socioeconomicCategory?: string;
    socioeconomicPercentage?: string;
    socioeconomicScore?: string;
    career?: CareerModel;
    [key: string]: any;
}

export interface StudentModel {
    user: UserModel;
    [key: string]: any;
}

export interface UserModel {
    identification: string;
    lastname: string;
    name: string;
    email?: string;
    personalEmail?: string;
    cellPhone?: string;
    phone?: string;
    [key: string]: any;
}

export interface EnrollmentDetailModel {
    id: string;
    subject?: SubjectModel;
    type?: CatalogueModel;
    workday?: CatalogueModel;
    parallel?: CatalogueModel;
    number?: number;
    date?: string;
    finalGrade?: number;
    finalAttendance?: number;
    academicState?: CatalogueModel;
    observation?: string;
    enrollmentDetailState?: { state: CatalogueModel };
    [key: string]: any;
}

export interface HttpResponseModel<T> {
    data: T;
    pagination?: PaginatorModel;
    [key: string]: any;
}

export interface PaginatorModel {
    limit: number;
    offset: number;
    page: number;
    totalItems: number;
}
