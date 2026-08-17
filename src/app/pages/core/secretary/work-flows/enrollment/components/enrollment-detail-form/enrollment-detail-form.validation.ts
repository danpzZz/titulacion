import { required, min, max, SchemaPathTree } from '@angular/forms/signals';
import { EnrollmentDetailStateModel } from '../../enrollment.state';

// ─── Umbral de aprobación ───────────────────────────────────────────────────
export const MIN_APPROVING_GRADE = 7;
export const MIN_APPROVING_ATTENDANCE = 70;

// Códigos del catálogo "Estado Académico" que representan aprobado/reprobado
export const ACADEMIC_STATE_APPROVED_CODES = ['a', 'approved'];
export const ACADEMIC_STATE_FAILED_CODES = ['r', 'failed'];

// ─── Validaciones del formulario de asignatura ────────────────────────────────
export function validateEnrollmentDetailForm(
    schema: SchemaPathTree<EnrollmentDetailStateModel>,
    isNew: boolean
): void {
    // Siempre requeridos — tanto al crear como al editar
    required(schema.workday, { message: 'El horario es requerido' });
    required(schema.parallel, { message: 'El paralelo es requerido' });

    // Solo requeridos al crear una nueva asignatura
    if (isNew) {
        required(schema.subject, { message: 'La asignatura es requerida' });
        required(schema.type, { message: 'El tipo de matrícula es requerido' });
        required(schema.observation, { message: 'La observación es requerida al crear una asignatura' });
    }

    // Rangos de calificación y asistencia
    if (!isNew) {
        min(schema.finalGrade, 0, { message: 'La calificación no puede ser menor a 0' });
        max(schema.finalGrade, 10, { message: 'La calificación no puede ser mayor a 10' });
        min(schema.finalAttendance, 0, { message: 'La asistencia no puede ser menor a 0' });
        max(schema.finalAttendance, 100, { message: 'La asistencia no puede ser mayor a 100' });
    }
}