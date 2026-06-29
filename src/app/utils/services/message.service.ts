import {inject, Injectable} from '@angular/core';
import {CustomMessageService, FormError} from './custom-message.service';

@Injectable({providedIn: 'root'})
export class MessageService {
  private readonly msg = inject(CustomMessageService);

  showSuccess(summary: string, detail: string): void {
    this.msg.showSuccess({summary, detail});
  }

  showError(summary: string, detail: string): void {
    this.msg.showError({summary, detail});
  }

  errorCustom(summary: string, detail: string): void {
    this.msg.showError({summary, detail});
  }

  errorsFields(messages: string[]): void {
    // Convertir string[] a FormError[] para compatibilidad con showFormErrors
    const formErrors: FormError[] = messages.map(m => ({
      label: '',
      form: '',
      field: '',
      message: m,
    }));
    this.msg.showFormErrors(formErrors);
  }

  questionDelete(): Promise<{isConfirmed: boolean}> {
    return Promise.resolve({isConfirmed: confirm('¿Desea eliminar este registro?')});
  }
}
