import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { AppService, CustomMessageService } from "@utils/services";
import { MessageModalComponent } from "@utils/components/message-modal/message-modal.component";
import { Toast } from "primeng/toast";
import { ConfirmDialog } from "primeng/confirmdialog";
import { MessageProcessingComponent } from "@utils/components/message-processing/message-processing.component";
import { AuthService } from "@modules/auth/auth.service";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, MessageModalComponent, Toast, ConfirmDialog, MessageProcessingComponent],
    template: `
        <!-- show a modal for http response -->
        @if (coreService.processing()) {
            <app-message-processing/>
        }

        <!-- show a modal for custom messages -->
        @if (customMessageService.modalVisible()) {
            <app-message-modal/>
        }

        <!-- show a toast for custom messages (http response) -->
        <p-toast position="top-center" [life]="customMessageService.modalLife"/>

        <!-- show a confirm modal for custom messages (ex. delete) -->
        <p-confirmDialog key="confirmdialog"></p-confirmDialog>

        <!-- render components -->
        @if (loading()) {
            <router-outlet/>
        }`
})
export class AppComponent implements OnInit {
    protected readonly authService = inject(AuthService);
    protected readonly coreService = inject(AppService);
    protected readonly customMessageService = inject(CustomMessageService);
    private readonly router = inject(Router);
    protected loading = signal(true);

    ngOnInit() {
        // this.authService.accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgyOGE2ZWY4LTNlOGYtNDNiYS1hYmZjLTAwY2QxY2EyMDljMiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3ODM0Njc1NDgsImV4cCI6MTc4MzU1Mzk0OH0.05D-qtR9pO5j9LXoQ0C2wNfRr-pRjp8utT-GvMbS8Bs';

        // RED DE SEGURIDAD: p-drawer/p-dialog de PrimeNG (con appendTo="body") a
        // veces no alcanza a limpiar su overlay/mask si el router destruye el
        // componente antes de que termine la animación de cierre — deja la pantalla
        // bloqueada con un div fantasma. En vez de perseguir el timing exacto de cada
        // caso (frágil, difícil de verificar sin probar en vivo en el navegador), se
        // limpia cualquier overlay huérfano al iniciar cada navegación. Esto es un
        // parche defensivo; la causa raíz (en el componente compartido
        // utils/components/button-action, u otros que usen appendTo="body") 
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                document.querySelectorAll('.p-overlay-mask, .p-drawer-mask, .p-dialog-mask').forEach((el) => el.remove());
                document.body.style.overflow = '';
                document.body.classList.remove('p-overflow-hidden');
            }
        });
    }
}