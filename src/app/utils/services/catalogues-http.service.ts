import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {environment} from '@env/environment';

@Injectable({providedIn: 'root'})
export class CataloguesHttpService {
  private readonly http = inject(HttpClient);
  private readonly API  = environment.API_URL;
  private readonly _cache: Record<string, Observable<any[]>> = {};

  /** Retorna Observable — usar cuando necesitas suscribirte al resultado */
  findByTypeObservable(type: string): Observable<any[]> {
    if (!this._cache[type]) {
      this._cache[type] = this.http
        .get<any>(`${this.API}/catalogues/catalogue`, {params: {type}})
        .pipe(
          map(r => r.data ?? []),
          shareReplay(1)
        );
    }
    return this._cache[type];
  }

  /** Retorna array sincrónico — puede estar vacío si aún no cargó */
  findByType(type: string): any[] {
    let result: any[] = [];
    this.findByTypeObservable(type).subscribe(v => result = v);
    return result;
  }
}
