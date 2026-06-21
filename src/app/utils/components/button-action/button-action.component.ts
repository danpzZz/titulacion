import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LabelButtonActionEnum } from '@utils/enums';
import { MenuItem } from 'primeng/api';
import { format } from 'date-fns';
import { Drawer } from 'primeng/drawer';
import { PanelMenu } from 'primeng/panelmenu';
import { environment } from '@env/environment';
import { FontAwesome } from '@modules/public/icons/font-awesome';
import { Divider } from 'primeng/divider';

@Component({
    selector: 'app-button-action',
    templateUrl: './button-action.component.html',
    styleUrls: ['./button-action.component.scss'],
    imports: [Drawer, PanelMenu, Divider],
    standalone: true
})
export class ButtonActionComponent {
    @Input() enabled: boolean = false;
    @Input() buttonActions: MenuItem[] = [];
    @Output() isHide: EventEmitter<boolean> = new EventEmitter<boolean>(false);

    protected readonly LabelButtonActionEnum = LabelButtonActionEnum;
    protected currentYear: string;

    constructor() {
        this.currentYear = format(new Date(), 'yyyy');
    }

    close(): void {
        this.isHide.emit(false);
    }

    protected readonly environment = environment;
    protected readonly FontAwesome = FontAwesome;
}
