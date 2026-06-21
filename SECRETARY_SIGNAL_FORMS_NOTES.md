# Cambios aplicados en Secretaría / Matrículas

Se trabajó sobre la estructura original del primer proyecto:

`src/app/pages/core/secretary/enrollment`

## Requerimiento del video aplicado

La pantalla de matrícula principal quedó como cabecera. Se retiraron de `enrollment-form` los campos académicos:

- Tipo de matrícula
- Periodo académico
- Horario
- Paralelo

Estos campos ahora se administran en `enrollment-detail-form`, junto con la asignatura, número de matrícula, calificación, asistencia, estado académico y observación.

## Signal Forms

Los formularios `enrollment-form` y `enrollment-detail-form` fueron migrados a Signal Forms usando:

```ts
import {form, FormField, FormRoot, required, disabled, min, max, submit} from '@angular/forms/signals';
```

No se usa `FormBuilder`, `FormGroup`, `FormControl`, `ReactiveFormsModule`, `formGroup`, `formControlName` ni `[formControl]` dentro del módulo `secretary/enrollment`.

## Archivos modificados

- `src/app/pages/core/secretary/enrollment/enrollment.module.ts`
- `src/app/pages/core/secretary/enrollment/enrollment-list/enrollment-list.component.ts`
- `src/app/pages/core/secretary/enrollment/enrollment-list/enrollment-list.component.html`
- `src/app/pages/core/secretary/enrollment/enrollment-form/enrollment-form.component.ts`
- `src/app/pages/core/secretary/enrollment/enrollment-form/enrollment-form.component.html`
- `src/app/pages/core/secretary/enrollment/enrollment-detail-form/enrollment-detail-form.component.ts`
- `src/app/pages/core/secretary/enrollment/enrollment-detail-form/enrollment-detail-form.component.html`
- `src/app/pages/core/secretary/enrollment/enrollment-detail-list/enrollment-detail-list.component.ts`
- `src/app/pages/core/secretary/enrollment/shared/secretary-enrollment-form.models.ts`
- `src/app/utils/directives/label.directive.ts`
- `package.json`

## Importante

Este cambio requiere Angular 21+ porque depende de `@angular/forms/signals`.
Si el proyecto donde se copian estos archivos todavía tiene Angular 18, primero se debe actualizar Angular.
