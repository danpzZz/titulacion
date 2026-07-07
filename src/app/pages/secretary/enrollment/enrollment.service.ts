import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {
  EnrollmentModel,
  EnrollmentDetailModel,
  HttpResponseModel,
  CareerModel,
  SchoolPeriodModel,
} from '@models/core';
import {environment} from '@env/environment';

@Injectable({providedIn: 'root'})
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly API  = environment.API_URL;

  // ─── Enrollments ────────────────────────────────────────────────────────────
  // GET /careers/:careerId/enrollments?schoolPeriodId=&academicPeriodId=&enrollmentStateId=&page=&search=

  findEnrollmentsByCareer(
    careerId: string,
    schoolPeriodId: string,
    academicPeriodId?: string,
    enrollmentStateId?: string,
    page: number = 0,
    search: string = ''
  ): Observable<HttpResponseModel<EnrollmentModel[]>> {
    let params = new HttpParams()
      .set('schoolPeriodId', schoolPeriodId)
      .set('page', page)
      .set('search', search);

    if (academicPeriodId)  params = params.set('academicPeriodId', academicPeriodId);
    if (enrollmentStateId) params = params.set('enrollmentStateId', enrollmentStateId);

    return this.http.get<HttpResponseModel<EnrollmentModel[]>>(
      `${this.API}/careers/${careerId}/enrollments`, {params}
    );
  }

  // GET /enrollments/:id
  findOne(id: string): Observable<EnrollmentModel> {
    return this.http
      .get<HttpResponseModel<EnrollmentModel>>(`${this.API}/enrollments/${id}`)
      .pipe(map(r => r.data));
  }

  // PUT /enrollments/:id
  update(id: string, payload: any): Observable<EnrollmentModel> {
    return this.http
      .put<HttpResponseModel<EnrollmentModel>>(`${this.API}/enrollments/${id}`, payload)
      .pipe(map(r => r.data));
  }

  // PATCH /enrollments/:id/enroll
  enroll(id: string): Observable<EnrollmentModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentModel>>(`${this.API}/enrollments/${id}/enroll`, {})
      .pipe(map(r => r.data));
  }

  // PATCH /enrollments/:id/approve
  approve(id: string): Observable<EnrollmentModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentModel>>(`${this.API}/enrollments/${id}/approve`, {})
      .pipe(map(r => r.data));
  }

  // PATCH /enrollments/:id/reject
  reject(id: string): Observable<EnrollmentModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentModel>>(`${this.API}/enrollments/${id}/reject`, {})
      .pipe(map(r => r.data));
  }

  // PATCH /enrollments/:id/revoke
  revoke(id: string): Observable<EnrollmentModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentModel>>(`${this.API}/enrollments/${id}/revoke`, {})
      .pipe(map(r => r.data));
  }

  // ─── Reports ────────────────────────────────────────────────────────────────
  // GET /enrollment-reports/:id/certificate
  downloadEnrollmentCertificate(id: string, identification: string): void {
    this.http
      .get(`${this.API}/enrollment-reports/${id}/certificate`, {responseType: 'blob'})
      .subscribe(blob => this.triggerDownload(blob, `Certificado_Matricula_${identification}.pdf`));
  }

  // GET /enrollment-reports/careers/:careerId?schoolPeriodId=
  downloadEnrollmentsByCareer(career: CareerModel, schoolPeriodId: string): void {
    const params = new HttpParams().set('schoolPeriodId', schoolPeriodId);
    this.http
      .get(`${this.API}/enrollment-reports/careers/${career.id}`, {params, responseType: 'blob'})
      .subscribe(blob => this.triggerDownload(blob, `Matriculados_${career.name}.xlsx`));
  }

  // GET /enrollment-reports/school-periods/:schoolPeriodId
  downloadEnrollmentsBySchoolPeriod(schoolPeriod: SchoolPeriodModel): void {
    this.http
      .get(`${this.API}/enrollment-reports/school-periods/${schoolPeriod.id}`, {responseType: 'blob'})
      .subscribe(blob => this.triggerDownload(blob, `Matriculados_${schoolPeriod.name}.xlsx`));
  }

  // GET /enrollment-reports/enrollment-details/:schoolPeriodId
  downloadEnrollmentDetailsBySchoolPeriod(schoolPeriod: SchoolPeriodModel): void {
    this.http
      .get(`${this.API}/enrollment-reports/enrollment-details/${schoolPeriod.id}`, {responseType: 'blob'})
      .subscribe(blob => this.triggerDownload(blob, `Asignaturas_${schoolPeriod.name}.xlsx`));
  }

  // No existe endpoint para fichas socioeconómicas en reports — queda como stub
  downloadSocioeconomicFormsBySchoolPeriod(schoolPeriod: SchoolPeriodModel): void {
    console.warn('Endpoint de fichas socioeconómicas no disponible en el backend actual');
  }

  // ─── Enrollment Details ──────────────────────────────────────────────────────
  // GET /enrollments/:enrollmentId/enrollment-details
  findDetailsByEnrollment(enrollmentId: string): Observable<EnrollmentDetailModel[]> {
    return this.http
      .get<HttpResponseModel<EnrollmentDetailModel[]>>(
        `${this.API}/enrollments/${enrollmentId}/enrollment-details`
      )
      .pipe(map(r => r.data));
  }

  // GET /enrollment-details/:id
  findOneDetail(id: string): Observable<EnrollmentDetailModel> {
    return this.http
      .get<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details/${id}`)
      .pipe(map(r => r.data));
  }

  // POST /enrollment-details
  createDetail(payload: any): Observable<EnrollmentDetailModel> {
    return this.http
      .post<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details`, payload)
      .pipe(map(r => r.data));
  }

  // PUT /enrollment-details/:id
  updateDetail(id: string, payload: any): Observable<EnrollmentDetailModel> {
    return this.http
      .put<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details/${id}`, payload)
      .pipe(map(r => r.data));
  }

  // DELETE /enrollment-details/:id
  removeDetail(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/enrollment-details/${id}`);
  }

  // PATCH /enrollment-details/:id/enroll
  enrollDetail(id: string): Observable<EnrollmentDetailModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details/${id}/enroll`, {})
      .pipe(map(r => r.data));
  }

  // PATCH /enrollment-details/:id/approve
  approveDetail(id: string): Observable<EnrollmentDetailModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details/${id}/approve`, {})
      .pipe(map(r => r.data));
  }

  // PATCH /enrollment-details/:id/reject
  rejectDetail(id: string): Observable<EnrollmentDetailModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details/${id}/reject`, {})
      .pipe(map(r => r.data));
  }

  // PATCH /enrollment-details/:id/revoke
  revokeDetail(id: string): Observable<EnrollmentDetailModel> {
    return this.http
      .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.API}/enrollment-details/${id}/revoke`, {})
      .pipe(map(r => r.data));
  }

  // POST /enrollment-details/:id/send-request
  sendDetailRequest(id: string, payload: any): Observable<EnrollmentDetailModel> {
    return this.http
      .post<HttpResponseModel<EnrollmentDetailModel>>(
        `${this.API}/enrollment-details/${id}/send-request`, payload
      )
      .pipe(map(r => r.data));
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
