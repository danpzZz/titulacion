import { RoleInterface } from '@modules/auth/interfaces';
import { CatalogueInterface } from '@utils/interfaces';
import { RucInterface } from '@/pages/core/shared/interfaces';

export interface AuthInterface {
    id: string;
    roles?: RoleInterface[];
    avatar?: string;
    email: string;
    emailVerifiedAt?: Date;
    lastname?: string;
    name?: string;
    identification?: string;
    username: string;
    termsAcceptedAt?: Date;
    ruc?: RucInterface;
    securityQuestionAcceptedAt?: Date;
    passwordChanged: boolean;
    nationality: CatalogueInterface;
    bloodType: CatalogueInterface;
    sex: CatalogueInterface;
    birthdate: Date;
    hasDisability: boolean;
    phone: string;
}
