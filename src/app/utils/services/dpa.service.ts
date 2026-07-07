import { inject, Injectable } from '@angular/core';
import { DpaInterface } from '@utils/interfaces';
import { CoreEnum } from '@utils/enums';
import { CoreSessionStorageService } from '@utils/services/core-session-storage.service';

@Injectable({
    providedIn: 'root'
})
export class DpaService {
    private readonly coreSessionStorageService = inject(CoreSessionStorageService);

    async findProvinces(): Promise<DpaInterface[]> {
        let dpa: DpaInterface[] = [];

        if (sessionStorage.getItem(CoreEnum.dpa)) {
            dpa = await this.coreSessionStorageService.getEncryptedValue(CoreEnum.dpa);
            dpa = Object.values(dpa);

            dpa = dpa.filter((item) => {
                return item.parentId === null;
            });
        }

        return dpa;
    }

    async findDpaByParentId(parentId:string): Promise<DpaInterface[]> {
        let dpa: DpaInterface[] = [];

        if (sessionStorage.getItem(CoreEnum.dpa)) {
            dpa = await this.coreSessionStorageService.getEncryptedValue(CoreEnum.dpa);
            dpa = Object.values(dpa);

            dpa = dpa.filter((item) => {
                return item.parentId === parentId;
            });
        }

        return dpa;
    }
}
