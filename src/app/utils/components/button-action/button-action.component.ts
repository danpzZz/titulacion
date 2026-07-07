import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {LabelButtonActionEnum} from '@utils/enums';
import {MenuItem} from 'primeng/api';
import {Drawer} from 'primeng/drawer';
import {PanelMenu} from 'primeng/panelmenu';
import {environment} from '@env/environment';
import {CustomIcons} from '@utils/icons/custom-icons';
import {Divider} from 'primeng/divider';

@Component({
    selector: 'app-button-action',
    templateUrl: './button-action.component.html',
    imports: [Drawer, PanelMenu, Divider],
    standalone: true
})
export class ButtonActionComponent implements OnChanges, OnDestroy {
    @Input() enabled: boolean = false;
    @Input() buttonActions: MenuItem[] = [];
    @Output() isHide: EventEmitter<boolean> = new EventEmitter<boolean>(false);

    protected visible: boolean = false;
    protected readonly LabelButtonActionEnum = LabelButtonActionEnum;
    protected currentYear: string;

    constructor() {
        this.currentYear = new Date().toLocaleDateString('es-EC');
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['enabled']) {
            this.visible = changes['enabled'].currentValue;
        }
    }

    ngOnDestroy(): void {
        // Eliminar el overlay del body al destruir el componente
        document.querySelectorAll('.p-drawer-mask, .p-overlay-mask, .p-component-overlay')
            .forEach(el => el.remove());
    }

    close(): void {
        this.visible = false;
        setTimeout(() => this.isHide.emit(false), 300);
    }

    protected readonly environment = environment;
    protected readonly CustomIcons = CustomIcons;
}
