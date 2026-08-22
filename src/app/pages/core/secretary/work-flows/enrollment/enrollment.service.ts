import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
    EnrollmentModel,
    EnrollmentDetailModel,
    HttpResponseModel,
    CareerModel,
    SchoolPeriodModel,
    SubjectModel,
} from '@utils/interfaces';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private readonly http = inject(HttpClient);

    // ─── URL bases por grupo de endpoints ────────────────────────────────────
    private readonly apiUrlEnrollments = `${environment.API_URL}/core/secretary/enrollments`;
    private readonly apiUrlEnrollmentDetails = `${environment.API_URL}/core/secretary/enrollment-details`;
    private readonly apiUrlEnrollmentReports = `${environment.API_URL}/core/secretary/enrollment-reports`;
    private readonly apiUrlSchoolPeriods = `${environment.API_URL}/core/shared/school-periods`;
    private readonly apiUrlCareers = `${environment.API_URL}/core/career-coordinator/careers`;

    // ─── School Periods ───────────────────────────────────────────────────────
    findAllSchoolPeriods(): Observable<SchoolPeriodModel[]> {
        return this.http
            .get<HttpResponseModel<SchoolPeriodModel[]>>(this.apiUrlSchoolPeriods)
            .pipe(map(r => r.data ?? []));
    }

    findOpenSchoolPeriod(): Observable<SchoolPeriodModel> {
        return this.http
            .get<HttpResponseModel<SchoolPeriodModel>>(`${this.apiUrlSchoolPeriods}/states/open`)
            .pipe(map(r => r.data));
    }

    // ─── Careers ──────────────────────────────────────────────────────────────
    findAllCareers(): Observable<CareerModel[]> {
        return this.http
            .get<HttpResponseModel<CareerModel[]>>(this.apiUrlCareers)
            .pipe(map(r => r.data ?? []));
    }

    findSubjectsByCareer(careerId: string): Observable<SubjectModel[]> {
        return this.http
            .get<HttpResponseModel<SubjectModel[]>>(`${this.apiUrlCareers}/${careerId}/subjects`)
            .pipe(map(r => r.data ?? []));
    }

    // ─── Enrollments ──────────────────────────────────────────────────────────
    // Consultas
    findEnrollmentsByCareer(
        careerId: string,
        schoolPeriodId: string,
        subjectId?: string,
        enrollmentStateId?: string,
        page: number = 0,
        search: string = ''
    ): Observable<HttpResponseModel<EnrollmentModel[]>> {
        let params = new HttpParams()
            .set('schoolPeriodId', schoolPeriodId)
            .set('page', page)
            .set('search', search);

        if (subjectId) params = params.set('subjectId', subjectId);
        if (enrollmentStateId) params = params.set('enrollmentStateId', enrollmentStateId);

        return this.http.get<HttpResponseModel<EnrollmentModel[]>>(
            `${this.apiUrlEnrollments}/careers/${careerId}`, { params }
        );
    }

    findEnrollment(id: string): Observable<EnrollmentModel> {
        return this.http
            .get<HttpResponseModel<EnrollmentModel>>(`${this.apiUrlEnrollments}/${id}`)
            .pipe(map(r => r.data));
    }

    // Crear / Editar
    createEnrollment(payload: any): Observable<EnrollmentModel> {
        return this.http
            .post<HttpResponseModel<EnrollmentModel>>(this.apiUrlEnrollments, payload)
            .pipe(map(r => r.data));
    }

    updateEnrollment(id: string, payload: any): Observable<EnrollmentModel> {
        return this.http
            .put<HttpResponseModel<EnrollmentModel>>(`${this.apiUrlEnrollments}/${id}`, payload)
            .pipe(map(r => r.data));
    }

    // Acciones de estado (registrada → aprobada → matriculada / rechazada / anulada)
    enroll(id: string): Observable<EnrollmentModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentModel>>(`${this.apiUrlEnrollments}/${id}/enroll`, {})
            .pipe(map(r => r.data));
    }

    approve(id: string): Observable<EnrollmentModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentModel>>(`${this.apiUrlEnrollments}/${id}/approve`, {})
            .pipe(map(r => r.data));
    }

    reject(id: string): Observable<EnrollmentModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentModel>>(`${this.apiUrlEnrollments}/${id}/reject`, {})
            .pipe(map(r => r.data));
    }

    revoke(id: string): Observable<EnrollmentModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentModel>>(`${this.apiUrlEnrollments}/${id}/revoke`, {})
            .pipe(map(r => r.data));
    }

    // ─── Enrollment Details ───────────────────────────────────────────────────
    // Consultas
    findDetailsByEnrollment(enrollmentId: string): Observable<EnrollmentDetailModel[]> {
        return this.http
            .get<HttpResponseModel<EnrollmentDetailModel[]>>(
                `${this.apiUrlEnrollments}/${enrollmentId}/enrollment-details`
            )
            .pipe(map(r => r.data));
    }

    findOneDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http
            .get<HttpResponseModel<EnrollmentDetailModel>>(`${this.apiUrlEnrollmentDetails}/${id}`)
            .pipe(map(r => r.data));
    }

    // Crear / Editar / Eliminar
    createDetail(payload: any): Observable<EnrollmentDetailModel> {
        return this.http
            .post<HttpResponseModel<EnrollmentDetailModel>>(this.apiUrlEnrollmentDetails, payload)
            .pipe(map(r => r.data));
    }

    updateDetail(id: string, payload: any): Observable<EnrollmentDetailModel> {
        return this.http
            .put<HttpResponseModel<EnrollmentDetailModel>>(`${this.apiUrlEnrollmentDetails}/${id}`, payload)
            .pipe(map(r => r.data));
    }

    removeDetail(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrlEnrollmentDetails}/${id}`);
    }

    // Acciones de estado (misma lógica que Enrollments, pero a nivel de asignatura)
    enrollDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.apiUrlEnrollmentDetails}/${id}/enroll`, {})
            .pipe(map(r => r.data));
    }

    approveDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.apiUrlEnrollmentDetails}/${id}/approve`, {})
            .pipe(map(r => r.data));
    }

    rejectDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.apiUrlEnrollmentDetails}/${id}/reject`, {})
            .pipe(map(r => r.data));
    }

    revokeDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http
            .patch<HttpResponseModel<EnrollmentDetailModel>>(`${this.apiUrlEnrollmentDetails}/${id}/revoke`, {})
            .pipe(map(r => r.data));
    }

    sendDetailRequest(id: string, payload: any): Observable<EnrollmentDetailModel> {
        return this.http
            .post<HttpResponseModel<EnrollmentDetailModel>>(
                `${this.apiUrlEnrollmentDetails}/${id}/send-request`, payload
            )
            .pipe(map(r => r.data));
    }

    // ─── Reports ──────────────────────────────────────────────────────────────
    downloadEnrollmentCertificate(id: string, identification: string): void {
        this.http
            .get(`${this.apiUrlEnrollmentReports}/${id}/certificate`, { responseType: 'blob' })
            .subscribe(blob => this.triggerDownload(blob, `Certificado_Matricula_${identification}.pdf`));
    }

    downloadEnrollmentsByCareer(career: CareerModel, schoolPeriodId: string): void {
        const params = new HttpParams().set('schoolPeriodId', schoolPeriodId);
        this.http
            .get(`${this.apiUrlEnrollmentReports}/careers/${career.id}`, { params, responseType: 'blob' })
            .subscribe(blob => this.triggerDownload(blob, `Matriculados_${career.name}.xlsx`));
    }

    downloadEnrollmentsBySchoolPeriod(schoolPeriod: SchoolPeriodModel): void {
        this.http
            .get(`${this.apiUrlEnrollmentReports}/school-periods/${schoolPeriod.id}`, { responseType: 'blob' })
            .subscribe(blob => this.triggerDownload(blob, `Matriculados_${schoolPeriod.name}.xlsx`));
    }

    downloadEnrollmentDetailsBySchoolPeriod(schoolPeriod: SchoolPeriodModel): void {
        this.http
            .get(`${this.apiUrlEnrollmentReports}/enrollment-details/${schoolPeriod.id}`, { responseType: 'blob' })
            .subscribe(blob => this.triggerDownload(blob, `Asignaturas_${schoolPeriod.name}.xlsx`));
    }

    calculateEnrollmentNumber(studentId: string, subjectId: string): Observable<number> {
        return this.http
            .get<HttpResponseModel<number>>(`${this.apiUrlEnrollmentDetails}/calculate-number/${studentId}/${subjectId}`)
            .pipe(map(r => r.data));
    }

    // nivel que le corresponde tomar al estudiante según su historial en la carrera 
    findRequiredAcademicPeriod(studentId: string, careerId: string): Observable<string | null> {
        return this.http
            .get<HttpResponseModel<string | null>>(`${this.apiUrlEnrollments}/required-academic-period/${studentId}/${careerId}`)
            .pipe(map(r => r.data));
    }


    // ─── Helper ───────────────────────────────────────────────────────────────
    private triggerDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}