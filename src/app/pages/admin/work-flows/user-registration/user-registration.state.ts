export interface UserRegistrationState {
    access: AccessInfo;
    personalInfo: PersonalInfo;
    academicInfo: AcademicInfo;
    securityInfo: SecurityInfo;
    otro: Otro;
}

export interface AccessInfo {
    roles: string[];
}

export interface AcademicInfo {
    institutionId: string | null;
    careerIds: string[];
}

export interface PersonalInfo {
    documentType: string | null;
    documentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface SecurityInfo {
    password: string;
    mustChangePassword: boolean;
    changePasswordEnabled: boolean;
}

export interface Otro {
    name: string;
    code: string;
}

export const INITIAL_USER_REGISTRATION_STATE: UserRegistrationState = {
    access: {
        roles: []
    },

    academicInfo: {
        institutionId: null,
        careerIds: []
    },

    personalInfo: {
        documentType: null,
        documentNumber: '',
        firstName: '',
        lastName: '',
        email: ''
    },

    securityInfo: {
        password: '',
        mustChangePassword: true,
        changePasswordEnabled: true
    },

    otro: {
        name: '',
        code: ''
    }
};
