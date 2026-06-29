import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { CustomMessageService } from '@utils/services/custom-message.service';
import { AuthHttpService } from '../../auth-http.service';
import { environment } from '@env/environment';
import { CoreService } from '@utils/services/core.service';
import { DatePickerModule } from 'primeng/datepicker';
import { LabelDirective } from '@utils/directives/label.directive';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { MY_ROUTES } from '@routes';
import { invalidEmailDomainValidator, invalidEmailValidator, matchPasswords, passwordPolicesValidator, unregisteredUserValidator } from '@utils/form-validators/custom-validator';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import EmailResetComponent from '@/pages/auth/components/email-reset/email-reset.component';
import { CatalogueInterface } from '@utils/interfaces';
import { CustomIcons } from '@modules/public/icons/custom-icons';
import { TransactionalCodeComponent } from '@utils/components/transactional-code/transactional-code.component';

@Component({
    selector: 'app-password-reset',
    templateUrl: './password-reset.component.html',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        ReactiveFormsModule,
        DatePickerModule,
        LabelDirective,
        ErrorMessageDirective,
        Tooltip,
        Dialog,
        EmailResetComponent,
        TransactionalCodeComponent
    ]
})
export default class PasswordResetComponent {
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly environment = environment;
    protected readonly coreService = inject(CoreService);

    protected form!: FormGroup;
    protected transactionalCodeControl = new FormControl({ value: '', disabled: true });
    protected securityQuestionsModal = false;
    protected allSecurityQuestions: CatalogueInterface[] = [];
    protected readonly CustomIcons = CustomIcons;
    private readonly formBuilder = inject(FormBuilder);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly authHttpService = inject(AuthHttpService);
    private readonly router = inject(Router);

    constructor() {
        this.buildForm();
    }

    protected get idField(): AbstractControl {
        return this.form.controls['id'];
    }

    protected get emailField(): AbstractControl {
        return this.form.controls['email'];
    }

    protected get passwordField(): AbstractControl {
        return this.form.controls['password'];
    }

    protected get passwordConfirmField(): AbstractControl {
        return this.form.controls['passwordConfirm'];
    }

    protected get identificationField(): AbstractControl {
        return this.form.controls['identification'];
    }

    protected get nameField(): AbstractControl {
        return this.form.controls['name'];
    }

    protected onSubmitEmailReset(email: string) {
        this.emailField.setValue(email);
        this.securityQuestionsModal = false;
    }

    protected verifyRegisteredUser() {
        this.authHttpService.verifyRegisteredUser(this.identificationField.value).subscribe({
            next: (response) => {
                this.idField.setValue(response.id);
                this.emailField.setValue(response.email);
                this.allSecurityQuestions = response.securityQuestions;
            }
        });
    }

    protected watchFormChanges() {
        this.identificationField.valueChanges.subscribe((value) => {
            this.transactionalCodeControl.reset();
            this.transactionalCodeControl.disable();
            this.passwordField.reset();
            this.passwordField.disable();

            if (!this.identificationField.errors) {
                this.verifyRegisteredUser();
            }
        });

        this.emailField.valueChanges.subscribe((value) => {
            this.transactionalCodeControl.reset();
            this.transactionalCodeControl.disable();
            this.passwordField.reset();
            this.passwordField.disable();
        });

        this.transactionalCodeControl.statusChanges.subscribe((status) => {
            if (status === 'VALID') {
                this.nameField.enable();
                this.passwordField.enable();
            }
        });
    }

    protected onSubmit() {
        if (this.validateForm()) {
            this.resetPassword();
        }
    }

    protected requestTransactionalCode() {
        this.nameField.disable();
        this.passwordField.disable();
        this.passwordField.reset();

        this.transactionalCodeControl.reset();
        this.transactionalCodeControl.disable();

        this.authHttpService.requestTransactionalPasswordResetCode(this.identificationField.value).subscribe({
            next: (_) => {
                this.transactionalCodeControl.enable();
            }
        });
    }

    protected showSecurityQuestionsModal() {
        if (this.allSecurityQuestions.length === 0) {
            this.customMessageService.showModalError({
                summary: 'No tiene preguntas de seguridad registradas',
                detail: 'Contactar con el administrador'
            });
            return;
        }

        this.securityQuestionsModal = true;
    }

    private buildForm() {
        this.form = this.formBuilder.group(
            {
                id: [null, [Validators.required]],
                email: [
                    {
                        value: null,
                        disabled: true
                    },
                    [Validators.required, invalidEmailValidator(), invalidEmailDomainValidator()]
                ],
                password: [null, [Validators.required, passwordPolicesValidator()]],
                passwordConfirm: [null, [Validators.required]],
                name: [null, [Validators.required]],
                identification: [
                    null,
                    {
                        validators: [Validators.required, Validators.minLength(10), Validators.maxLength(13)],
                        asyncValidators: [unregisteredUserValidator(this.authHttpService)]
                    }
                ]
            },
            { validators: [matchPasswords('password', 'passwordConfirm')] }
        );

        this.idField.disable();
        this.emailField.disable();
        this.nameField.disable();
        this.passwordField.disable();

        this.watchFormChanges();
    }

    private resetPassword() {
        this.authHttpService
            .resetPassword({
                identification: this.identificationField.value,
                password: this.passwordField.value,
                passwordConfirm: this.passwordConfirmField.value
            })
            .subscribe({
                next: () => {
                    this.form.reset();
                    this.router.navigate([MY_ROUTES.authPages.signIn.absolute]);
                }
            });
    }

    private validateForm() {
        const errors: string[] = [];

        if (this.emailField.invalid) errors.push('Correo Electrónico');
        if (this.passwordField.invalid) errors.push('Contraseña');
        if (this.identificationField.invalid) errors.push('RUC');

        if (errors.length > 0) {
            this.form.markAllAsTouched();
            this.customMessageService.showFormErrors(errors);
            return false;
        }

        return true;
    }
}
