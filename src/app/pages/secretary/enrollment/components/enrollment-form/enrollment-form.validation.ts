import {required, SchemaPathTree} from '@angular/forms/signals';
import {EnrollmentStateModel} from '../../enrollment.state';

export function validateEnrollmentForm(schema: SchemaPathTree<EnrollmentStateModel>): void {
  required(schema.type,           {message: 'El tipo de matrícula es requerido'});
  required(schema.academicPeriod, {message: 'El periodo académico es requerido'});
  required(schema.workday,        {message: 'El horario es requerido'});
  required(schema.parallel,       {message: 'El paralelo es requerido'});
}
