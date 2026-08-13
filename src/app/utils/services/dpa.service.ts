import { Injectable } from '@angular/core';
import { DpaInterface } from '@utils/interfaces';
import { CoreEnum } from '@utils/enums';

@Injectable({ providedIn: 'root' })
export class DpaService {
    findProvinces(): DpaInterface[] {
        const dpa = sessionStorage.getItem(CoreEnum.dpa);
        const dpaParse = dpa ? JSON.parse(dpa) as DpaInterface[] : [];
        return dpaParse.filter(item => item.parentId === null);
    }

    findDpaByParentId(parentId: string): DpaInterface[] {
        const dpa = sessionStorage.getItem(CoreEnum.dpa);
        const dpaParse = dpa ? JSON.parse(dpa) as DpaInterface[] : [];
        return dpaParse.filter(item => item.parentId === parentId);
    }

    setDpa(value: DpaInterface[]): void {
        sessionStorage.setItem(CoreEnum.dpa, JSON.stringify(value));
    }
}