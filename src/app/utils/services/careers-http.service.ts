import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '@env/environment';

@Injectable({providedIn: 'root'})
export class CareersHttpService {
  private readonly http = inject(HttpClient);
  private readonly API  = environment.API_URL;

  findAll(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/careers`)
      .pipe(map(r => r.data ?? []));
  }
}
