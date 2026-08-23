import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LabelButtonActionEnum } from '@utils/enums';
import { MenuItem } from 'primeng/api';
import { format } from 'date-fns';
import { Drawer } from 'primeng/drawer';
import { PanelMenu } from 'primeng/panelmenu';
import { environment } from '@env/environment';
import { CustomIcons } from '@utils/icons/custom-icons';
import { Divider } from 'primeng/divider';

@Component({
    selector: 'app-button-action',
    templateUrl: './button-action.component.html',
    imports: [Drawer, PanelMenu, Divider],
    standalone: true
})
export class ButtonActionComponent implements OnInit, OnDestroy {
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
    protected readonly CustomIcons = CustomIcons;

    // ─── Red de seguridad: overlay atascado a mitad de su animación de salida ──
    private maskObserver?: MutationObserver;

    ngOnInit(): void {
        this.maskObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement && node.classList.contains('p-drawer-mask')) {
                        this.watchMaskForStuckLeaveAnimation(node);
                    }
                });
            }
        });
        this.maskObserver.observe(document.body, { childList: true });
    }

    ngOnDestroy(): void {
        this.maskObserver?.disconnect();
    }

    // Vigila los cambios de clase de UNA máscara puntual. 
    private watchMaskForStuckLeaveAnimation(mask: HTMLElement): void {
        const classObserver = new MutationObserver(() => {
            if (mask.classList.contains('p-overlay-mask-leave-active')) {
                classObserver.disconnect();

                setTimeout(() => {
                    const stillStuck = document.body.contains(mask) && mask.classList.contains('p-overlay-mask-leave-active');
                    if (stillStuck) {
                        mask.remove();
                        document.body.style.overflow = '';
                        document.body.classList.remove('p-overflow-hidden');
                    }
                }, 1000);
            }
        });

        classObserver.observe(mask, { attributes: true, attributeFilter: ['class'] });
    }
}