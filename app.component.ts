import {Component, inject, signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CoreService, CustomMessageService} from "@utils/services";
import {MessageModalComponent} from "@utils/components/message-modal/message-modal.component";
import {Toast} from "primeng/toast";
import {ConfirmDialog} from "primeng/confirmdialog";
import {MessageProcessingComponent} from "@utils/components/message-processing/message-processing.component";

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
export class AppComponent {
    protected readonly coreService = inject(CoreService);
    protected readonly customMessageService = inject(CustomMessageService);
    protected loading = signal(true);
}
