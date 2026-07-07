import {Injectable, signal} from '@angular/core';

export interface BreadcrumbItem { label: string; routerLink?: string[]; }

@Injectable({providedIn: 'root'})
export class BreadcrumbService {
    readonly items = signal<BreadcrumbItem[]>([]);
    setItems(items: BreadcrumbItem[]): void { this.items.set(items); }
}
