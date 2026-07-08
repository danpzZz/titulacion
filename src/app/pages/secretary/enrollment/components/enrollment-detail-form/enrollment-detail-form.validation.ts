import {required, SchemaPathTree} from '@angular/forms/signals';
import {EnrollmentDetailStateModel} from '../../enrollment.state';

export function validateEnrollmentDetailForm(
  schema: SchemaPathTree<EnrollmentDetailStateModel>,
  isNew: boolean
): void {
  // Siempre requeridos
  required(schema.workday,  {message: 'El horario es requerido'});
  required(schema.parallel, {message: 'El paralelo es requerido'});

  // Solo requeridos al crear
  if (isNew) {
    required(schema.subject,     {message: 'La asignatura es requerida'});
    required(schema.type,        {message: 'El tipo de matrícula es requerido'});
    required(schema.observation, {message: 'La observación es requerida al crear una asignatura'});
  }
}
