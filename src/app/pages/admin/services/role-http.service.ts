import { inject, Injectable } from '@angular/core';

import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CoreService } from '@utils/services/core.service';
import { HttpResponseInterface } from '@/pages/auth/work-flows';

@Injectable({
    providedIn: 'root'
})
export class RoleHttpService {
    protected readonly _coreService = inject(CoreService);
    private readonly _httpClient = inject(HttpClient);
    private readonly _apiUrl = `${environment.API_URL}/auth/roles`;

    findCatalogues() {
        return this._httpClient.get<HttpResponseInterface>(`${this._apiUrl}/catalogues`).pipe(
            map((response) => {
                return response.data;
            })
        );
    }
}
