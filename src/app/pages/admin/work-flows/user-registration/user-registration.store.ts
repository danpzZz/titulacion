import {computed, Injectable, signal} from "@angular/core";
import {
    AcademicInfo,
    AccessInfo,
    INITIAL_USER_REGISTRATION_STATE, Otro, PersonalInfo, SecurityInfo,
    UserRegistrationState
} from "./user-registration.state";

const FORM_STATE_KEY = 'formState';

@Injectable({providedIn: 'root'})
export class UserRegistrationStore {
    readonly formState = signal<UserRegistrationState>(this.loadFromStorage());
    readonly formErrors = signal<Record<string, string[]>>({});


    readonly access = computed(() => this.formState().access);
    readonly academicInfo = computed(() => this.formState().academicInfo);
    readonly personalInfo = computed(() => this.formState().personalInfo);
    readonly securityInfo = computed(() => this.formState().securityInfo);
    readonly otro = computed(() => this.formState().otro);

    updateAccess(data: Partial<AccessInfo>) {
        this.formState.update(state => ({
            ...state,
            access: {
                ...state.access,
                ...data
            }
        }));
    }

    updateAcademicInfo(data: Partial<AcademicInfo>) {
        this.formState.update(state => ({
            ...state,

            academicInfo: {
                ...state.academicInfo,
                ...data
            }

        }));
    }

    updatePersonalInfo(data: Partial<PersonalInfo>) {
        this.formState.update(state => ({
            ...state,

            personalInfo: {
                ...state.personalInfo,
                ...data
            }

        }));
    }

    updateSecurityInfo(data: Partial<SecurityInfo>) {
        this.formState.update(state => ({
            ...state,

            securityInfo: {
                ...state.securityInfo,
                ...data
            }

        }));
    }

    updateOtro(data: Partial<Otro>) {
        this.formState.update(state => ({
            ...state,

            otro: {
                ...state.otro,
                ...data
            }

        }));
    }

    private loadFromStorage(): UserRegistrationState {
        const stored = sessionStorage.getItem(FORM_STATE_KEY);
        return stored ? JSON.parse(stored) : INITIAL_USER_REGISTRATION_STATE;
    }
}
