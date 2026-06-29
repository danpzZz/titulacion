import {required, SchemaPathTree} from '@angular/forms/signals';
import {EnrollmentDetailStateModel} from '../../enrollment.state';

export function validateEnrollmentDetailForm(
  schema: SchemaPathTree<EnrollmentDetailStateModel>,
  isNew: boolean
): void {
  required(schema.type,    {message: 'El tipo de matrícula es requerido'});
  required(schema.workday, {message: 'El horario es requerido'});
  required(schema.parallel,{message: 'El paralelo es requerido'});
  required(schema.number,  {message: 'El número de matrícula es requerido'});

  // La observación es obligatoria solo al crear una asignatura nueva
  if (isNew) {
    required(schema.observation, {
      message: 'La observación es requerida al agregar una nueva asignatura',
    });
  }
}
