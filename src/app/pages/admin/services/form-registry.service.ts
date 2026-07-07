// form-registry.service.ts
import {Injectable, signal} from '@angular/core';
import {FieldTree, submit} from '@angular/forms/signals';

// Evitamos FieldTree<any> usando unknown y casteamos solo donde lo necesitamos
type AnyFieldTree = FieldTree<unknown>;

interface RegisteredForm {
    fieldTree: AnyFieldTree;
    keys: string[];
}

@Injectable({providedIn: 'root'})
export class FormRegistryService {

    readonly submitTrigger = signal(0);

    private readonly _forms = new Map<string, RegisteredForm>();

    register<T extends object>(
        name: string,
        fieldTree: FieldTree<T>,
        model: T,
    ): void {
        this._forms.set(name, {
            fieldTree: fieldTree as AnyFieldTree,
            keys: Object.keys(model),
        });
    }

    unregister(name: string): void {
        this._forms.delete(name);
    }

    async triggerAll(): Promise<void> {
        for (const [name, {fieldTree, keys}] of this._forms) {
            await submit(fieldTree, async () => {
            });

            const errors = new Map<string, string[]>();

            for (const key of keys) {
                const state = (fieldTree as any)[key]?.();
                if (state?.invalid?.()) {
                    errors.set(
                        key,
                        state.errors().map((e: any) => e.message ?? e.kind),
                    );
                }
            }

            console.log(`[${name}]`, Object.fromEntries(errors));
        }
    }

    async getFormErrors2(): Promise<Map<string, string[]>> {
        let errors = new Map<string, string[]>();

        for (const [name, {fieldTree, keys}] of this._forms) {
            await submit(fieldTree, async () => {
            });

            errors = new Map<string, string[]>();

            for (const key of keys) {
                const state = (fieldTree as any)[key]?.();

                if (state?.invalid?.()) {
                    errors.set(
                        key,
                        state.errors().map((e: any) => e.message ?? e.kind),
                    );
                }
            }

            console.log(`[${name}]`, Object.fromEntries(errors));
        }

        return errors;
    }

    async getFormErrors(): Promise<string[]> {
        let errors: string[] = [];

        for (const [name, {fieldTree, keys}] of this._forms) {
            // await submit(fieldTree, async () => {});

            for (const key of keys) {
                const state = (fieldTree as any)[key]?.();

                if (state?.invalid?.()) {
                    errors.push(...state.errors().map((e: any) => e.message ?? e.kind),)
                }
            }
        }

        return errors;
    }
}
