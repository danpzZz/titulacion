import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoreService } from '@utils/services/core.service';
import { CustomMessageService } from '@utils/services/custom-message.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const coreService = inject(CoreService);
    const customMessageService = inject(CustomMessageService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.error.error !== 'EXPIRED_TOKEN') {
                coreService.hideLoading();
                coreService.hideProcessing();
                customMessageService.showHttpError(error.error);
            }

            return throwError(() => error);
        })
    );
};
