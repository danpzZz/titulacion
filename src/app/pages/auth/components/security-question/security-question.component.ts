import { Component, inject, OnInit } from '@angular/core';
import {
    FormArray,
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
import { CatalogueTypeEnum } from '@utils/enums';
import { CatalogueService } from '@utils/services/catalogue.service';
import { AuthHttpService } from '@/pages/auth/auth-http.service';
import { CatalogueInterface } from '@utils/interfaces';
import { AuthService } from '@/pages/auth/auth.service';
import { Dialog } from 'primeng/dialog';
import { Location } from '@angular/common';
import { CustomIcons } from '@modules/public/icons/custom-icons';
import { TransactionalCodeComponent } from '@utils/components/transactional-code/transactional-code.component';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-security-question',
    templateUrl: './security-question.component.html',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, DatePickerModule, LabelDirective, ErrorMessageDirective, Dialog, TransactionalCodeComponent, Tooltip]
})
export default class SecurityQuestionComponent implements OnInit {
    protected readonly CustomIcons = CustomIcons;
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly environment = environment;
    protected readonly coreService = inject(CoreService);

    protected form!: FormGroup;
    protected allSecurityQuestions: CatalogueInterface[] = [];
    protected selectedSecurityQuestions: CatalogueInterface[] = [];
    protected showOtpModal = false;
    protected transactionalCodeControl = new FormControl({ value: '', disabled: true });
    private readonly formBuilder = inject(FormBuilder);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly catalogueService = inject(CatalogueService);
    private readonly authHttpService = inject(AuthHttpService);
    protected readonly authService = inject(AuthService);

    constructor() {
        this.buildForm();
    }

    protected get securityQuestionsField(): FormArray {
        return this.form.controls['securityQuestions'] as FormArray;
    }

    async ngOnInit() {
        await this.loadSecurityQuestions();

        if (this.authService.auth.securityQuestionAcceptedAt) {
            this.requestTransactionalCode();
        }
    }

    public validateForm() {
        const errors: string[] = [];

        const invalid = this.securityQuestionsField.controls.some((ctrl) => ctrl.get('answer')?.invalid);

        if (invalid) errors.push('Preguntas de seguridad');

        if (errors.length > 0) {
            this.form.markAllAsTouched();
            this.customMessageService.showFormErrors(errors);
            return false;
        }

        return true;
    }

    protected onSubmit() {
        if (this.validateForm()) {
            this.create();
        }
    }

    protected create() {
        this.authHttpService.createSecurityQuestions(this.form.value).subscribe({
            next: (_) => {
                const auth = this.authService.auth;
                auth.securityQuestionAcceptedAt = new Date();
                this.authService.auth = auth;
                this.router.navigate([MY_ROUTES.adminPages.user.profile.absolute], { replaceUrl: true });
            }
        });
    }

    protected requestTransactionalCode() {
        this.transactionalCodeControl.reset();
        this.transactionalCodeControl.disable();
        this.form.disable();

        this.showOtpModal = true;

        this.authHttpService.requestTransactionalCode().subscribe({
            next: (_) => {
                this.transactionalCodeControl.enable();
            }
        });
    }

    protected async loadSecurityQuestions() {
        this.allSecurityQuestions = await this.catalogueService.findByType(CatalogueTypeEnum.users_security_question);

        this.generateSecurityQuestions();
    }

    protected generateSecurityQuestions() {
        this.selectedSecurityQuestions = this.allSecurityQuestions.sort(() => Math.random() - 0.5).slice(0, 3);

        this.securityQuestionsField.clear();

        this.selectedSecurityQuestions.forEach((q) => this.addQuestion(q));
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
        this.transactionalCodeControl.statusChanges.subscribe((status) => {
            if (status === 'VALID') {
                this.transactionalCodeControl.reset();
                this.transactionalCodeControl.disable();
                this.form.enable();
                this.showOtpModal = false;
            }
        });
    }

    protected back() {
        this.location.back();
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            securityQuestions: this.formBuilder.array([])
        });

        this.watchFormChanges();
    }
}
