import { Component, inject } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Dialog } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { DatePickerModule } from 'primeng/datepicker';
import { CustomMessageService } from '@utils/services/custom-message.service';
import { AuthHttpService } from '../../auth-http.service';
import { environment } from '@env/environment';
import { AuthService } from '@modules/auth/auth.service';
import { LabelDirective } from '@utils/directives/label.directive';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { MY_ROUTES } from '@routes';
import { RoleInterface } from '@modules/auth/interfaces';
import { CoreService } from '@utils/services';
import { CustomIcons } from '@modules/public/icons/custom-icons';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { invalidEmailValidator } from '@utils/form-validators/custom-validator';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, DatePickerModule, LabelDirective, ErrorMessageDirective, Dialog, InputGroup, InputGroupAddon]
})
export default class SignInComponent {
    protected readonly environment = environment;
    protected readonly coreService = inject(CoreService);

    protected form!: FormGroup;
    protected roles: RoleInterface[] = [];
    protected roleControl = new FormControl(null);
    protected isVisibleRoles = false;
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly Validators = Validators;
    protected readonly CustomIcons = CustomIcons;
    protected requestEmailVerificationModal: boolean = false;
    private readonly formBuilder = inject(FormBuilder);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly authHttpService = inject(AuthHttpService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    constructor() {
        this.buildForm();
    }

    protected get usernameField(): AbstractControl {
        return this.form.controls['username'];
    }

    protected get passwordField(): AbstractControl {
        return this.form.controls['password'];
    }

    signOut() {
        this.authHttpService.signOut().subscribe({
            next: () => {
                this.isVisibleRoles = false;
            }
        });
    }

    protected onSubmit() {
        if (this.validateForm()) {
            this.signIn();
        }
    }

    protected selectRole(value: RoleInterface) {
        this.authService.role = value;
        this.router.navigate([MY_ROUTES.dashboards.absolute]);
    }

    protected closeRoleSelect() {
        this.authHttpService.signOut().subscribe();
    }

    protected resendEmailVerification() {
        this.authHttpService.requestVerifyEmail(this.usernameField.value!).subscribe({
            next: (response) => {
                this.requestEmailVerificationModal = false;

                this.customMessageService.showModalInfo({
                    summary: `¡Solicitud recibida!`,
                    detail: 'Si la identificación está registrada en nuestro sistema, se ha enviado un correo con el nuevo enlace'
                });
            }
        });
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            username: [null, [Validators.required,invalidEmailValidator()]],
            password: [null, [Validators.required]]
        });
    }

    private validateForm() {
        const errors: string[] = [];

        if (this.usernameField.invalid) errors.push('Usuario');
        if (this.passwordField.invalid) errors.push('Contraseña');

        if (errors.length > 0) {
            this.form.markAllAsTouched();
            this.customMessageService.showFormErrors(errors);
            return false;
        }

        return true;
    }

    private signIn() {
        this.roleControl.reset();

        this.authHttpService.signIn(this.form.value).subscribe({
            next: (data) => {
                if (data.roles.length === 1) {
                    this.router.navigate([MY_ROUTES.dashboards.absolute]);
                    return;
                }

                this.isVisibleRoles = true;
                this.roles = data.roles;
                this.roleControl.setValidators([Validators.required]);
            },
            error: (err) => {
                if (err.error.error === 'ACCOUNT_UNVERIFIED_EMAIL') {
                    this.requestEmailVerificationModal = true;
                }
            }
        });
    }
}
