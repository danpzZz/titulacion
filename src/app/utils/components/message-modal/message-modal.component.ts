import { Component, inject } from '@angular/core';
import { CustomMessageService } from '@utils/services/custom-message.service';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { FontAwesome } from '@modules/public/icons/font-awesome';

@Component({
    selector: 'app-message-modal',
    templateUrl: './message-modal.component.html',
    imports: [Dialog, Button],
    standalone: true
})
export class MessageModalComponent {
    protected readonly customMessageService = inject(CustomMessageService);
    protected readonly Array = Array;

    protected readonly FontAwesome = FontAwesome;
}
