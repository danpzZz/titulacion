import { Component, inject, OnInit } from '@angular/core';
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
import { RippleModule } from 'primeng/ripple';
import { CustomMessageService } from '@utils/services/custom-message.service';
import { environment } from '@env/environment';
import { CoreService } from '@utils/services/core.service';
import { DatePickerModule } from 'primeng/datepicker';
import { MY_ROUTES } from '@routes';
import { LabelDirective } from '@utils/directives/label.directive';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { CatalogueService } from '@utils/services/catalogue.service';
import { AuthHttpService } from '@/pages/auth/auth-http.service';
import { CatalogueInterface } from '@utils/interfaces';
import { AuthService } from '@/pages/auth/auth.service';
import { Location } from '@angular/common';
import { CustomIcons } from '@modules/public/icons/custom-icons';
import { matchPasswords, passwordPolicesValidator } from '@utils/form-validators/custom-validator';
import { Divider } from 'primeng/divider';

@Component({
    selector: 'app-password-changed',
    templateUrl: './password-changed.component.html',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, DatePickerModule, LabelDirective, ErrorMessageDirective, Divider]
})
export default class PasswordChangedComponent implements OnInit {
    protected readonly CustomIcons = CustomIcons;
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly environment = environment;
    protected readonly coreService = inject(CoreService);

    protected form!: FormGroup;
    protected allSecurityQuestions: CatalogueInterface[] = [];
    protected selectedSecurityQuestions: CatalogueInterface[] = [];
    protected showOtpModal = false;
    protected transactionalCodeControl = new FormControl({ value: '', disabled: true });
    protected readonly authService = inject(AuthService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly catalogueService = inject(CatalogueService);
    private readonly authHttpService = inject(AuthHttpService);

    constructor() {
        this.buildForm();
    }

    protected get passwordField(): AbstractControl {
        return this.form.controls['password'];
    }

    protected get passwordConfirmField(): AbstractControl {
        return this.form.controls['passwordConfirm'];
    }

    async ngOnInit() {}

    public validateForm() {
        const errors: string[] = [];

        if (this.passwordField.invalid) errors.push('Contraseña');
        if (this.passwordConfirmField.invalid) errors.push('Contraseña');

        if (errors.length > 0) {
            this.form.markAllAsTouched();
            this.customMessageService.showFormErrors(errors);
            return false;
        }

        return true;
    }

    protected onSubmit() {
        if (this.validateForm()) {
            this.changePassword();
        }
    }

    protected changePassword() {
        this.authHttpService.changePassword(this.form.value).subscribe({
            next: (_) => {
                const auth = this.authService.auth;
                auth.passwordChanged = true;
                this.authService.auth = auth;

                this.router.navigate([MY_ROUTES.adminPages.user.profile.absolute], { replaceUrl: true });
            }
        });
    }

    protected watchFormChanges() {
        this.transactionalCodeControl.statusChanges.subscribe((status) => {
            if (status === 'VALID') {
                this.transactionalCodeControl.reset();
                this.transactionalCodeControl.disable();
                this.form.enable();
                this.showOtpModal = false;
            }
        });
    }

    private buildForm() {
        this.form = this.formBuilder.group(
            {
                password: [null, [Validators.required, passwordPolicesValidator()]],
                passwordConfirm: [null, [Validators.required]]
            },
            { validators: [matchPasswords('password', 'passwordConfirm')] }
        );

        this.passwordField.markAllAsTouched();
        this.watchFormChanges();
    }
}
