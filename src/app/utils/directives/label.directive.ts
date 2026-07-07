import {
    AfterViewInit,
    computed,
    Directive,
    effect,
    ElementRef,
    HostBinding,
    inject,
    Input,
    OnChanges,
    Renderer2,
    signal,
    SimpleChanges,
    afterNextRender,
} from '@angular/core';
import {FieldState} from '@angular/forms/signals';

type SignalField = () => FieldState<unknown>;

@Directive({
    selector: '[appLabel]',
})
export class LabelDirective implements OnChanges {
    @HostBinding('style.display') display = 'block';
    @HostBinding('style.width') width = '100%';
    @HostBinding('style.whiteSpace') whiteSpace = 'normal';

    @Input() label: string | null = null;
    @Input() appendColon = false;

    @Input() set field(f: SignalField | null) {
        this._field.set(f);
    }

    private readonly el = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);

    private readonly _field = signal<SignalField | null>(null);
    private readonly _viewReady = signal(false); // signal en lugar de boolean

    private readonly _required = computed(() => {
        const f = this._field();
        if (!f) return false;
        const state = f() as any;
        const errors = state?.validationState?.errors?.() ?? [];
        return errors.some(
            (e: any) => e.kind === 'required' || e.message?.toLowerCase().includes('required')
        );
    });
    constructor() {
        // Marca el view como listo después del primer render
        afterNextRender(() => {
            this._viewReady.set(true);
            if (this.label != null && this.label !== '') {
                this.setInnerHTML(this.appendColon ? `${this.label}:` : this.label);
            }
        });

        // El effect lee _viewReady() y _required() — se re-ejecuta cuando cualquiera cambia
        effect(() => {
            if (!this._viewReady()) return; // espera al render
            this.updateRequiredIcon();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this._viewReady()) return;
        if ('label' in changes || 'appendColon' in changes) {
            if (this.label != null && this.label !== '') {
                this.setInnerHTML(this.appendColon ? `${this.label}:` : this.label);
                this.updateRequiredIcon();
            }
        }
    }

    private setInnerHTML(html: string): void {
        this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html + ':');
    }

    private updateRequiredIcon(): void {
        const host = this.el.nativeElement;
        const existing = host.querySelector('[data-app-label-icon="true"]');
        if (this._required()) {
            if (!existing) {
                const icon = this.renderer.createElement('i');
                this.renderer.setAttribute(icon, 'data-app-label-icon', 'true');
                this.renderer.addClass(icon, 'pi');
                this.renderer.addClass(icon, 'pi-asterisk');
                this.renderer.addClass(icon, 'text-red-500');
                this.renderer.addClass(icon, 'mr-1');
                this.renderer.setStyle(icon, 'font-size', '0.6rem');
                this.renderer.setAttribute(icon, 'aria-hidden', 'true');
                this.renderer.insertBefore(host, icon, host.firstChild);
            }
        }
    }
}
