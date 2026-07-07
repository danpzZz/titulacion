import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '@env/environment';

@Injectable({providedIn: 'root'})
export class SchoolPeriodsHttpService {
  private readonly http = inject(HttpClient);
  private readonly API  = environment.API_URL;

  findAll(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API}/school-periods`)
      .pipe(map(r => r.data ?? []));
  }

  findOpenSchoolPeriod(): Observable<any> {
    return this.http
      .get<any>(`${this.API}/school-periods/states/open`)
      .pipe(map(r => r.data));
  }
}
