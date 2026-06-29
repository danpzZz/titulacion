import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from '@env/environment';

@Injectable({providedIn: 'root'})
export class CataloguesHttpService {
  private readonly http = inject(HttpClient);
  private readonly API  = environment.API_URL;
  private readonly _cache: Record<string, any[]> = {};

  findByType(type: string): any[] {
    if (!this._cache[type]) {
      this._cache[type] = [];
      this.http
        .get<any>(`${this.API}/catalogues/catalogue`, {params: {type}})
        .pipe(map(r => r.data ?? []))
        .subscribe(data => { this._cache[type] = data; });
    }
    return this._cache[type];
  }
}
