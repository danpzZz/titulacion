import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormRegistryService} from "@/pages/admin/services/form-registry.service";
import {email, FieldTree, form, FormField, minLength, required, SchemaPathTree} from "@angular/forms/signals";
import {Button} from "primeng/button";
import {JsonPipe} from "@angular/common";
import {InputText} from "primeng/inputtext";
import {Password, PasswordDirective} from "primeng/password";
import {ErrorMessageDirective} from "@utils/directives/error-message.directive";
import {Otro} from "@/pages/admin/work-flows/user-registration/user-registration.state";

interface UserInterface {
    email: string;
    password: string;
}

@Component({
    selector: 'app-otro-form',
    imports: [
        Button,
        FormField,
        JsonPipe,
        InputText,
        Password,
        PasswordDirective,
        ErrorMessageDirective
    ],
    templateUrl: './otro-form.html'
})
export class OtroForm implements OnInit, OnDestroy {
    private readonly formRegistryService = inject(FormRegistryService);

    protected form$ = signal<Otro>({
        name: '',
        code: '',
    });

    protected form: FieldTree<Otro> = this.buildForm;

    constructor() {

    }

    ngOnInit(): void {
        this.formRegistryService.register(
            'otro',
            this.form,
            this.form$()
        );
    }

    ngOnDestroy(): void {
        this.formRegistryService.unregister('login');
    }

    get buildForm() {
        return form(this.form$,(schema)=>{
            this.validateForm(schema)
        });
    }

    private validateForm(schema: SchemaPathTree<Otro>): void {
        //name
        required(schema.name, {message: 'El name es requerido'});
        email(schema.name, {message: 'Ingresa un name válido'});

        //code
        minLength(schema.code, 2, {message: 'El email debe tener al menos 2 caracteres'});
    }

    async save() {
        console.log(await this.formRegistryService.getFormErrors());
    }
}
