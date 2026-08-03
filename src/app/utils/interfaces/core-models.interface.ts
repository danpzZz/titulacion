import {CatalogueInterface} from './catalogue.interface';
import {PaginationInterface} from './paginator.interface';

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
    academicPeriod?: CatalogueInterface;
    [key: string]: any;
}

export interface EnrollmentModel {
    id: string;
    code?: string;
    date?: string;
    student: StudentModel;
    career?: CareerModel;
    type?: CatalogueInterface;
    academicPeriod?: CatalogueInterface;
    workday?: CatalogueInterface;
    parallel?: CatalogueInterface;
    enrollmentState?: {state: CatalogueInterface};
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
    type?: CatalogueInterface;
    workday?: CatalogueInterface;
    parallel?: CatalogueInterface;
    enrollmentDetailState?: {state: CatalogueInterface};
    finalGrade?: number | null;
    finalAttendance?: number | null;
    academicState?: CatalogueInterface | null;
    observation?: string | null;
    [key: string]: any;
}

// Typed HTTP response for enrollment module
export interface HttpResponseModel<T> {
    data: T;
    pagination?: PaginationInterface;
    message?: string;
    title?: string;
    [key: string]: any;
}
