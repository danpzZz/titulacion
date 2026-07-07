import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG & UI
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';

// Custom / Local
import { environment } from '@env/environment';
import { MY_ROUTES } from '@routes';
import { CustomIcons } from '@modules/public/icons/custom-icons';
import { AuthHttpService } from '@/pages/auth/auth-http.service';
import { CustomMessageService } from '@utils/services';
import { ErrorMessageDirective } from '@utils/directives/error-message.directive';
import { LabelDirective } from '@utils/directives/label.directive';

// Tipos para el estado de la UI
type VerificationStatus = 'LOADING' | 'SUCCESS' | 'INVALID' | 'USED' | 'EXPIRED' | 'ACCOUNT_VERIFIED';

interface UIState {
    icon: string;
    title: string;
    message: string;
    color: string;
    iconClass: string;
}

@Component({
    selector: 'app-email-verification',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, ButtonModule, NgClass, Dialog, ErrorMessageDirective, LabelDirective, InputText, ReactiveFormsModule, FormsModule],
    templateUrl: './email-verification.component.html',
    styles: [
        `
            .icon-color-info {
                color: var(--p-sky-600);
            }
            .icon-color-warn {
                color: var(--p-orange-600);
            }
            .icon-color-danger {
                color: var(--p-red-600);
            }
            .icon-color-success {
                color: var(--p-green-600);
            }
            .icon-color-help {
                color: var(--p-purple-600);
            }
        `
    ]
})
export default class EmailVerificationComponent implements OnInit {
    // Inputs
    public token = input.required<string>();
    protected currentStatus = signal<VerificationStatus>('LOADING');
    // Constantes expuestas al template
    protected readonly environment = environment;
    protected readonly MY_ROUTES = MY_ROUTES;
    protected readonly CustomIcons = CustomIcons;
    // Estado Reactivo (Signals)
    protected uiState = signal<UIState>(this.getConfigForStatus('LOADING'));
    protected counter = signal<number>(5);
    protected requestEmailVerificationModal = signal<boolean>(false);
    // Formularios
    protected usernameControl = new FormControl<string | null>(null, [Validators.required]);
    // Inyecciones
    private readonly router = inject(Router);
    private readonly authHttpService = inject(AuthHttpService);
    private readonly customMessageService = inject(CustomMessageService);
    private readonly destroyRef = inject(DestroyRef);
    // Variables internas
    private intervalId: number | null = null;

    ngOnInit() {
        this.verifyEmail();
    }

    verifyEmail() {
        this.authHttpService.verifyEmail(this.token()).subscribe({
            next: () => this.handleStatus('SUCCESS'),
            error: (err) => {
                const errorCode = err.error?.error;

                const statusMap: Record<string, VerificationStatus> = {
                    INVALID_TOKEN: 'INVALID',
                    USED_TOKEN: 'USED',
                    EXPIRED_TOKEN: 'EXPIRED',
                    ACCOUNT_VERIFIED_EMAIL: 'ACCOUNT_VERIFIED'
                };

                this.handleStatus(statusMap[errorCode] || 'INVALID');
            }
        });
    }

    resendEmailVerification() {
        if (this.usernameControl.invalid || !this.usernameControl.value) return;

        this.authHttpService.requestVerifyEmail(this.usernameControl.value).subscribe({
            next: () => {
                this.usernameControl.reset();
                this.requestEmailVerificationModal.set(false);

                this.customMessageService.showModalInfo({
                    summary: '¡Solicitud recibida!',
                    detail: 'Si la identificación está registrada en el sistema, recibirás un enlace en tu correo electrónico.'
                });
            }
        });
    }

    backToSignIn() {
        this.router.navigate([MY_ROUTES.authPages.signIn.absolute]);
    }

    /**
     * Centraliza la lógica de cambio de estado y efectos secundarios (redirección)
     */
    private handleStatus(status: VerificationStatus) {
        this.uiState.set(this.getConfigForStatus(status));
        this.currentStatus.set(status);

        if (status === 'SUCCESS' || status === 'USED' || status === 'ACCOUNT_VERIFIED') {
            this.startRedirectCountdown();
        }
    }

    private startRedirectCountdown() {
        if (this.intervalId) clearInterval(this.intervalId);

        this.intervalId = window.setInterval(() => {
            this.counter.update((v) => v - 1);

            if (this.counter() === 0) {
                this.backToSignIn();
                clearInterval(this.intervalId!);
            }
        }, 1000);

        this.destroyRef.onDestroy(() => {
            if (this.intervalId) clearInterval(this.intervalId);
        });
    }

    private getConfigForStatus(status: VerificationStatus): UIState {
        const config: Record<VerificationStatus, UIState> = {
            LOADING: {
                icon: CustomIcons.SPINNER_SOLID,
                title: 'Verificando...',
                message: 'Estamos verificando tu cuenta',
                color: 'var(--p-sky-600)',
                iconClass: 'icon-color-info'
            },
            SUCCESS: {
                icon: CustomIcons.ENVELOPE_CIRCLE_CHECK_SOLID,
                title: '¡Verificación Exitosa!',
                message: 'Ya puedes iniciar sesión',
                color: 'var(--p-green-600)',
                iconClass: 'icon-color-success'
            },
            INVALID: {
                icon: CustomIcons.LINK_SLASH_SOLID,
                title: 'Enlace no válido',
                message: 'El enlace de verificación no es válido o ya no está disponible',
                color: 'var(--p-red-600)',
                iconClass: 'icon-color-danger'
            },
            USED: {
                icon: CustomIcons.USER_CHECK_SOLID,
                title: 'Cuenta ya activa',
                message: 'Este enlace ya se utilizó. Tu cuenta está activa.',
                color: 'var(--p-purple-600)',
                iconClass: 'icon-color-help'
            },
            EXPIRED: {
                icon: CustomIcons.CALENDAR_XMARK_REGULAR,
                title: 'El enlace ha caducado',
                message: 'Por seguridad, los enlaces duran 24 horas. Necesitas uno nuevo.',
                color: 'var(--p-orange-600)',
                iconClass: 'icon-color-warn'
            },
            ACCOUNT_VERIFIED: {
                icon: CustomIcons.ENVELOPE_CIRCLE_CHECK_SOLID,
                title: 'Cuenta ya activa',
                message: 'Tu cuenta ya fue verificada. Puedes iniciar sesión o continuar con el proceso.',
                color: 'var(--p-sky-600)',
                iconClass: 'icon-color-info'
            }
        };

        return config[status];
    }
}
