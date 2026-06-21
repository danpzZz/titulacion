import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, map } from 'rxjs';
import {
    CatalogueModel,
    CareerModel,
    EnrollmentDetailModel,
    EnrollmentModel,
    SchoolPeriodModel,
    ServerResponse,
    SubjectModel
} from '../shared/secretary-enrollment-form.models';

@Injectable({ providedIn: 'root' })
export class SecretaryEnrollmentApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.API_URL;

    findSchoolPeriods(): Observable<SchoolPeriodModel[]> {
        return this.http.get<ServerResponse<SchoolPeriodModel[]>>(`${this.apiUrl}/school-periods`).pipe(map(response => response.data ?? []));
    }

    findCareers(): Observable<CareerModel[]> {
        return this.http.get<ServerResponse<CareerModel[]>>(`${this.apiUrl}/careers`).pipe(map(response => response.data ?? []));
    }

    findCataloguesByType(type: string): Observable<CatalogueModel[]> {
        return this.http.get<ServerResponse<CatalogueModel[]>>(`${this.apiUrl}/catalogues/type/${type}`).pipe(map(response => response.data ?? []));
    }

    findEnrollmentsByCareer(
        careerId: string,
        schoolPeriodId: string,
        academicPeriodId?: string,
        enrollmentStateId?: string,
        page = 0,
        search = ''
    ): Observable<ServerResponse<EnrollmentModel[]>> {
        const headers = new HttpHeaders().append('pagination', 'true');
        let params = new HttpParams().append('page', page).append('search', search);

        if (academicPeriodId) params = params.append('academicPeriodId', academicPeriodId);
        if (enrollmentStateId) params = params.append('enrollmentStateId', enrollmentStateId);

        return this.http.get<ServerResponse<EnrollmentModel[]>>(
            `${this.apiUrl}/careers/${careerId}/school-periods/${schoolPeriodId}/enrollments`,
            { headers, params }
        );
    }

    findEnrollment(id: string): Observable<EnrollmentModel> {
        return this.http.get<ServerResponse<EnrollmentModel>>(`${this.apiUrl}/enrollments/${id}`).pipe(map(response => response.data));
    }

    updateEnrollment(id: string, payload: Partial<EnrollmentModel>): Observable<EnrollmentModel> {
        return this.http.put<ServerResponse<EnrollmentModel>>(`${this.apiUrl}/enrollments/${id}`, payload).pipe(map(response => response.data));
    }

    approveEnrollment(id: string): Observable<EnrollmentModel> {
        return this.http.patch<ServerResponse<EnrollmentModel>>(`${this.apiUrl}/enrollments/${id}/approve`, null).pipe(map(response => response.data));
    }

    enrollEnrollment(id: string): Observable<EnrollmentModel> {
        return this.http.patch<ServerResponse<EnrollmentModel>>(`${this.apiUrl}/enrollments/${id}/enroll`, null).pipe(map(response => response.data));
    }

    rejectEnrollment(id: string): Observable<EnrollmentModel> {
        return this.http.patch<ServerResponse<EnrollmentModel>>(`${this.apiUrl}/enrollments/${id}/reject`, null).pipe(map(response => response.data));
    }

    revokeEnrollment(id: string): Observable<EnrollmentModel> {
        return this.http.patch<ServerResponse<EnrollmentModel>>(`${this.apiUrl}/enrollments/${id}/revoke`, null).pipe(map(response => response.data));
    }

    findEnrollmentDetails(enrollmentId: string): Observable<EnrollmentDetailModel[]> {
        return this.http.get<ServerResponse<EnrollmentDetailModel[]>>(`${this.apiUrl}/enrollments/${enrollmentId}/enrollment-details`).pipe(map(response => response.data ?? []));
    }

    findEnrollmentDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http.get<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}`).pipe(map(response => response.data));
    }

    createEnrollmentDetail(payload: Partial<EnrollmentDetailModel>): Observable<EnrollmentDetailModel> {
        return this.http.post<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details`, payload).pipe(map(response => response.data));
    }

    updateEnrollmentDetail(id: string, payload: Partial<EnrollmentDetailModel>): Observable<EnrollmentDetailModel> {
        return this.http.put<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}`, payload).pipe(map(response => response.data));
    }

    approveEnrollmentDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http.patch<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}/approve`, null).pipe(map(response => response.data));
    }

    enrollEnrollmentDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http.patch<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}/enroll`, null).pipe(map(response => response.data));
    }

    rejectEnrollmentDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http.patch<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}/reject`, null).pipe(map(response => response.data));
    }

    revokeEnrollmentDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http.patch<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}/revoke`, null).pipe(map(response => response.data));
    }

    removeEnrollmentDetail(id: string): Observable<EnrollmentDetailModel> {
        return this.http.delete<ServerResponse<EnrollmentDetailModel>>(`${this.apiUrl}/enrollment-details/${id}`).pipe(map(response => response.data));
    }

    findSubjectsByCurriculum(curriculumId: string): Observable<SubjectModel[]> {
        return this.http.get<ServerResponse<SubjectModel[]>>(`${this.apiUrl}/curriculums/${curriculumId}/subjects/all`).pipe(map(response => response.data ?? []));
    }
}
