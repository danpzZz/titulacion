import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { CustomMessageService } from '@utils/services/custom-message.service';
import { AuthHttpService } from '../../auth-http.service';
import { environment } from '@env/environment';
import { DatePickerModule } from 'primeng/datepicker';
import { LabelDirective } from '@utils/directives/label.directive';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { invalidEmailDomainValidator, invalidEmailValidator, matchPasswords, passwordPolicesValidator, unavailableEmailValidator, unavailableUserValidator } from '@utils/form-validators/custom-validator';
import { KeyFilter } from 'primeng/keyfilter';
import { MY_ROUTES } from '@routes';
import { CatalogueService } from '@utils/services/catalogue.service';
import { CatalogueTypeEnum, CoreEnum } from '@utils/enums';
import { Tooltip } from 'primeng/tooltip';
import { CustomIcons } from '@modules/public/icons/custom-icons';
import { CatalogueHttpService, CoreService, CoreSessionStorageService } from '@utils/services';
import { TransactionalCodeComponent } from '@utils/components/transactional-code/transactional-code.component';
import { CatalogueInterface } from '@utils/interfaces';
import { Message } from 'primeng/message';
import { debounceTime } from 'rxjs';
import { AutoFocus } from 'primeng/autofocus';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
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
        KeyFilter,
        Tooltip,
        TransactionalCodeComponent,
        Message,
        AutoFocus
    ]
})
export default class SignUpComponent implements OnInit {
    protected readonly environment = environment;

    protected form!: FormGroup;
    protected transactionalCodeControl = new FormControl({ value: '', disabled: true });
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly CustomIcons = CustomIcons;
    protected allSecurityQuestions: CatalogueInterface[] = [];
    private readonly formBuilder = inject(FormBuilder);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly coreSessionStorageService = inject(CoreSessionStorageService);
    protected readonly coreService = inject(CoreService);
    private readonly catalogueHttpService = inject(CatalogueHttpService);
    private readonly catalogueService = inject(CatalogueService);
    private readonly authHttpService = inject(AuthHttpService);
    private readonly router = inject(Router);

    constructor() {
        this.buildForm();
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

    protected get usernameField(): AbstractControl {
        return this.form.controls['username'];
    }

    protected get rucField(): AbstractControl {
        return this.form.controls['ruc'];
    }

    protected get termsAcceptedAtField(): AbstractControl {
        return this.form.controls['termsAcceptedAt'];
    }

    protected get securityQuestionsField(): FormArray {
        return this.form.controls['securityQuestions'] as FormArray;
    }

    async ngOnInit() {
        await this.loadSecurityQuestions();
    }

    protected async loadSecurityQuestions() {
        this.catalogueHttpService.findCache().subscribe({
            next: async (response) => {
                await this.coreSessionStorageService.setEncryptedValue(CoreEnum.catalogues, response);

                this.allSecurityQuestions = await this.catalogueService.findByType(CatalogueTypeEnum.users_security_question);
            }
        });
    }

    protected generateSecurityQuestions() {
        const selectedSecurityQuestions = this.allSecurityQuestions.sort(() => Math.random() - 0.5).slice(0, 3);

        this.securityQuestionsField.clear();

        selectedSecurityQuestions.forEach((q) => this.addQuestion(q));
    }

    protected openTerms() {
        window.open(`${environment.APP_PATH_ASSETS}/auth/files/legal.pdf`, '_blank');
    }

    protected addQuestion(question: any): void {
        const group = this.formBuilder.group({
            code: [question.code, Validators.required],
            question: [question.name, Validators.required],
            answer: [null, Validators.required]
        });

        this.securityQuestionsField.push(group);
    }

    protected watchFormChanges() {
        this.identificationField.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
            this.emailField.disable();
            this.rucField.reset();

            if (this.identificationField.valid) this.findRUC(value);
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

    protected requestTransactionalCode() {
        this.nameField.disable();
        // this.nameField.reset();
        this.passwordField.disable();
        this.passwordField.reset();

        this.transactionalCodeControl.reset();
        this.transactionalCodeControl.disable();

        this.generateSecurityQuestions();

        this.authHttpService.requestTransactionalSignupCode(this.emailField.value).subscribe({
            next: (_) => {
                this.transactionalCodeControl.enable();
            }
        });
    }

    protected onSubmit() {
        this.usernameField.setValue(this.emailField.value);

        if (this.validateForm()) {
            this.signUpExternal();
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group(
            {
                email: [
                    null,
                    {
                        validators: [Validators.required, invalidEmailValidator(), invalidEmailDomainValidator()],
                        asyncValidators: [unavailableEmailValidator(this.authHttpService)]
                    }
                ],
                password: [null, [Validators.required, passwordPolicesValidator()]],
                passwordConfirm: [null, [Validators.required]],
                ruc: [false, [Validators.required]],
                name: [null, [Validators.required]],
                username: [null, [Validators.required]],
                termsAcceptedAt: [false, [Validators.requiredTrue]],
                identification: [
                    null,
                    {
                        validators: [Validators.required, Validators.maxLength(13), Validators.minLength(13)],
                        asyncValidators: [unavailableUserValidator(this.authHttpService)]
                    }
                ],
                securityQuestions: this.formBuilder.array([], [Validators.required, Validators.minLength(3)])
            },
            { validators: [matchPasswords('password', 'passwordConfirm')] }
        );

        this.emailField.disable();
        this.nameField.disable();
        this.passwordField.disable();

        this.watchFormChanges();
    }

    private findRUC(ruc: string) {
        this.authHttpService.findRUC(ruc).subscribe({
            next: (response) => {
                if (response) {
                    this.rucField.setValue(response);
                    this.nameField.setValue(response.razonSocial);

                    if (response.estadoContribuyente === 'ACTIVO') {
                        this.transactionalCodeControl.reset();
                        this.transactionalCodeControl.disable();
                        this.emailField.reset();
                        this.emailField.enable();
                        this.passwordField.reset();
                        this.passwordField.disable();
                    }
                }
            }
        });
    }

    private signUpExternal() {
        this.authHttpService.signUpExternal(this.form.value).subscribe({
            next: (_) => {
                this.form.reset();
                this.router.navigate([MY_ROUTES.authPages.signIn.absolute]);
            }
        });
    }

    private validateForm() {
        const errors: string[] = [];

        if (this.nameField.invalid) errors.push('Nombres');
        if (this.emailField.invalid) errors.push('Correo Electrónico');
        if (this.passwordField.invalid) errors.push('Contraseña');
        if (this.identificationField.invalid) errors.push('Identificación');
        if (this.termsAcceptedAtField.invalid) errors.push('Términos y Condiciones');

        const invalidSecurityQuestions = this.securityQuestionsField.controls.some((ctrl) => ctrl.get('answer')?.invalid);
        if (invalidSecurityQuestions || this.securityQuestionsField.invalid) errors.push('Preguntas de seguridad');

        if (errors.length > 0) {
            this.form.markAllAsTouched();
            this.customMessageService.showFormErrors(errors);
            return false;
        }

        return true;
    }
}
