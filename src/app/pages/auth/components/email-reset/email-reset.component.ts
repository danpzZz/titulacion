import { Component, inject, input, OnInit, output } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
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
import { AuthHttpService } from '@/pages/auth/auth-http.service';
import { AuthService } from '@/pages/auth/auth.service';
import { invalidEmailValidator } from '@utils/form-validators/custom-validator';
import { CustomIcons } from '@modules/public/icons/custom-icons';

@Component({
    selector: 'app-email-reset',
    templateUrl: './email-reset.component.html',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, DatePickerModule, LabelDirective, ErrorMessageDirective]
})
export default class EmailResetComponent implements OnInit {
    onSubmitted = output<string>();
    userId = input.required<string>();
    allSecurityQuestions = input.required<any[]>();
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly environment = environment;
    protected readonly coreService = inject(CoreService);

    protected form!: FormGroup;
    protected readonly CustomIcons = CustomIcons;
    private readonly formBuilder = inject(FormBuilder);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly router = inject(Router);
    private readonly authHttpService = inject(AuthHttpService);
    private readonly authService = inject(AuthService);

    constructor() {
        this.buildForm();
    }

    protected get securityQuestionsField(): FormArray {
        return this.form.controls['securityQuestions'] as FormArray;
    }

    protected get emailField(): AbstractControl {
        return this.form.controls['email'];
    }

    ngOnInit() {
        this.generateSecurityQuestions();
    }

    public validateForm() {
        const errors: string[] = [];

        const invalid = this.securityQuestionsField.controls.some((ctrl) => ctrl.get('answer')?.invalid);

        if (invalid) errors.push('Preguntas de seguridad');
        if (this.emailField.invalid) errors.push('Correo');

        if (errors.length > 0) {
            this.form.markAllAsTouched();
            this.customMessageService.showFormErrors(errors);
            return false;
        }

        return true;
    }

    protected onSubmit() {
        if (this.validateForm()) {
            this.verifySecurityQuestionsAndResetEmail();
        }
    }

    protected generateSecurityQuestions() {
        let selectedSecurityQuestions = this.allSecurityQuestions()
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        this.securityQuestionsField.clear();

        selectedSecurityQuestions.forEach((q) => this.addQuestion(q));
    }

    protected addQuestion(question: any): void {
        const group = this.formBuilder.group({
            code: [question.code, Validators.required],
            question: [question.question, Validators.required],
            answer: [null, Validators.required]
        });

        this.securityQuestionsField.push(group);
    }

    protected watchFormChanges() {}

    protected verifySecurityQuestionsAndResetEmail() {
        this.authHttpService.verifySecurityQuestionsAndResetEmail(this.userId(), this.form.value).subscribe({
            next: (_) => {
                this.onSubmitted.emit(this.emailField.value);
            }
        });
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            email: [null, [Validators.required, invalidEmailValidator()]],
            securityQuestions: this.formBuilder.array([])
        });

        this.watchFormChanges();
    }
}
