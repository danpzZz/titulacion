import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormRegistryService} from "@/pages/admin/services/form-registry.service";
import {email, FieldTree, form, FormField, minLength, Field, required} from "@angular/forms/signals";
import {Button} from "primeng/button";
import {JsonPipe} from "@angular/common";
import {InputText} from "primeng/inputtext";
import {Password, PasswordDirective} from "primeng/password";
import {ErrorMessageDirective} from "@utils/directives/error-message.directive";
import {OtroForm} from "@/pages/admin/components/otro-form/otro-form";

interface UserInterface {
    email: string;
    password: string;
}

@Component({
    selector: 'app-user-form',
    imports: [
        Button,
        FormField,
        JsonPipe,
        InputText,
        Password,
        PasswordDirective,
        ErrorMessageDirective,
        OtroForm
    ],
    templateUrl: './user-form.html'
})
export class UserForm implements OnInit, OnDestroy {
    private readonly formRegistryService = inject(FormRegistryService);

    protected form$ = signal<UserInterface>({
        email: '',
        password: '',
    });

    protected form: FieldTree<UserInterface> = this.buildForm;

    constructor() {

    }

    ngOnInit(): void {
        this.formRegistryService.register(
            'login',
            this.form,
            this.form$()
        );
    }

    ngOnDestroy(): void {
        this.formRegistryService.unregister('login');
    }

    get buildForm() {
        return form(this.form$, (schema) => {
            this.validateForm(schema);
        });
    }

    private validateForm(schema: any): void {
        required(schema.email, { message: 'El email es requerido' });
        email(schema.email, { message: 'Ingresa un email válido' });
        minLength(schema.email, 2, { message: 'El email debe tener al menos 2 caracteres' });
    }

    async save() {
        console.log(await this.formRegistryService.getFormErrors());
    }
}
