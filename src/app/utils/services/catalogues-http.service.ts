import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CataloguesHttpService {
    private readonly http = inject(HttpClient);
    private readonly API = environment.API_URL;
    private readonly _cache: Record<string, Observable<any[]>> = {};

    findByTypeObservable(type: string): Observable<any[]> {
        if (!this._cache[type]) {
            this._cache[type] = this.http
                // .get<any>(`${this.API}/catalogues/catalogue`, {params: {type}})

                .get<any>(`${this.API}/core/catalogues`, { params: { type } })

                .pipe(map(r => r.data ?? []), shareReplay(1));
        }
        return this._cache[type];
    }
}