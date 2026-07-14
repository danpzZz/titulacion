import {HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {of} from 'rxjs';

// ─── IDs fijos para consistencia ──────────────────────────────────────────────
const IDS = {
  career:       'cc000001-0000-0000-0000-000000000001',
  schoolPeriod: 'sp000001-0000-0000-0000-000000000001',
  curriculum:   'cu000001-0000-0000-0000-000000000001',
  secretaria:   'us000001-0000-0000-0000-000000000001',
  // Catálogos
  cat: {
    typeEspecial:   'ct000001-0000-0000-0000-000000000001',
    typeOrdinaria:  'ct000001-0000-0000-0000-000000000002',
    parallelA:      'ct000002-0000-0000-0000-000000000001',
    parallelB:      'ct000002-0000-0000-0000-000000000002',
    workday0913:    'ct000003-0000-0000-0000-000000000001',
    workday0709:    'ct000003-0000-0000-0000-000000000002',
    apCuarto:       'ct000004-0000-0000-0000-000000000001',
    apPrimero:      'ct000004-0000-0000-0000-000000000002',
    apStarter:      'ct000004-0000-0000-0000-000000000003',
    stEnrolled:     'ct000005-0000-0000-0000-000000000001',
    stApproved:     'ct000005-0000-0000-0000-000000000002',
    stRequested:    'ct000005-0000-0000-0000-000000000003',
    stRegistered:   'ct000005-0000-0000-0000-000000000004',
    stRejected:     'ct000005-0000-0000-0000-000000000005',
    stRevoked:      'ct000005-0000-0000-0000-000000000006',
    acAprobado:     'ct000006-0000-0000-0000-000000000001',
    acReprobado:    'ct000006-0000-0000-0000-000000000002',
  },
  // Subjects
  subj: {
    a22:     'sb000001-0000-0000-0000-000000000001',
    a21:     'sb000001-0000-0000-0000-000000000002',
    a11:     'sb000001-0000-0000-0000-000000000003',
    starter: 'sb000001-0000-0000-0000-000000000004',
  },
  // Students
  st: ['st000001-0000-0000-0000-000000000001','st000001-0000-0000-0000-000000000002',
       'st000001-0000-0000-0000-000000000003','st000001-0000-0000-0000-000000000004',
       'st000001-0000-0000-0000-000000000005'],
  // Enrollments
  en: ['en000001-0000-0000-0000-000000000001','en000001-0000-0000-0000-000000000002',
       'en000001-0000-0000-0000-000000000003','en000001-0000-0000-0000-000000000004',
       'en000001-0000-0000-0000-000000000005'],
  // Details
  det: ['de000001-0000-0000-0000-000000000001','de000001-0000-0000-0000-000000000002',
        'de000001-0000-0000-0000-000000000003','de000001-0000-0000-0000-000000000004',
        'de000001-0000-0000-0000-000000000005'],
};

// ─── Catálogos reutilizables ───────────────────────────────────────────────────
const CAT = {
  typeEspecial:  {id: IDS.cat.typeEspecial,  code: 'especial',      name: 'Especial'},
  typeOrdinaria: {id: IDS.cat.typeOrdinaria, code: 'ordinary',      name: 'Ordinaria'},
  parallelA:     {id: IDS.cat.parallelA,     code: 'a',             name: 'A'},
  parallelB:     {id: IDS.cat.parallelB,     code: 'b',             name: 'B'},
  workday0913:   {id: IDS.cat.workday0913,   code: '3',             name: '09:00-13:00'},
  workday0709:   {id: IDS.cat.workday0709,   code: '1',             name: '07:00-09:00'},
  apCuarto:      {id: IDS.cat.apCuarto,      code: '4',             name: 'Cuarto'},
  apPrimero:     {id: IDS.cat.apPrimero,     code: '1',             name: 'Primero'},
  apStarter:     {id: IDS.cat.apStarter,     code: 'starter',       name: 'Starter'},
  stEnrolled:    {id: IDS.cat.stEnrolled,    code: 'enrolled',      name: 'Matriculado'},
  stApproved:    {id: IDS.cat.stApproved,    code: 'approved',      name: 'Aprobado'},
  stRequested:   {id: IDS.cat.stRequested,   code: 'request_sent',  name: 'Solicitud Enviada'},
  stRegistered:  {id: IDS.cat.stRegistered,  code: 'registered',    name: 'Inscrito'},
  stRejected:    {id: IDS.cat.stRejected,    code: 'rejected',      name: 'Rechazado'},
  stRevoked:     {id: IDS.cat.stRevoked,     code: 'revoked',       name: 'Anulado'},
  acAprobado:    {id: IDS.cat.acAprobado,    code: 'a',             name: 'Aprobado'},
  acReprobado:   {id: IDS.cat.acReprobado,   code: 'r',             name: 'Reprobado'},
};

// ─── Asignaturas ──────────────────────────────────────────────────────────────
const SUBJECTS = [
  {id: IDS.subj.a22,     code: 'YEC-A2.2', name: 'A2.2',    academicPeriod: CAT.apCuarto},
  {id: IDS.subj.a21,     code: 'YEC-A2.1', name: 'A2.1',    academicPeriod: CAT.apCuarto},
  {id: IDS.subj.a11,     code: 'YEC-A1.1', name: 'A1.1',    academicPeriod: CAT.apPrimero},
  {id: IDS.subj.starter, code: 'YEC-ST',   name: 'STARTER', academicPeriod: CAT.apStarter},
];

// ─── Matrículas ───────────────────────────────────────────────────────────────
const ENROLLMENTS = [
  {
    id: IDS.en[0], code: '2025_2p_3c-YEC-0105710099', date: '2026-04-23',
    career: {id: IDS.career, name: 'YEC'},
    student: {user: {identification: '0105710099', lastname: 'ARPI YUQUILIMA',     name: 'EDITH BIBIANA',     email: 'eby.arpi@yavirac.edu.ec',       personalEmail: 'edith@gmail.com',    cellPhone: '0987654321', phone: ''}},
    type: CAT.typeEspecial, academicPeriod: CAT.apCuarto,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentState: {state: CAT.stEnrolled},
    observation: '', socioeconomicCategory: 'B', socioeconomicPercentage: '30', socioeconomicScore: '50.81',
  },
  {
    id: IDS.en[1], code: '2025_2p_3c-YEC-1726952417', date: '2026-04-23',
    career: {id: IDS.career, name: 'YEC'},
    student: {user: {identification: '1726952417', lastname: 'CAIZA REDIN',        name: 'CRISTIAN FERNANDO', email: 'cfc.caiza@yavirac.edu.ec',      personalEmail: 'cristian@gmail.com', cellPhone: '0991234567', phone: ''}},
    type: CAT.typeEspecial, academicPeriod: CAT.apCuarto,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentState: {state: CAT.stEnrolled},
    observation: '', socioeconomicCategory: 'B', socioeconomicPercentage: '30', socioeconomicScore: '50.81',
  },
  {
    id: IDS.en[2], code: '2025_2p_3c-YEC-1754215109', date: '2026-04-23',
    career: {id: IDS.career, name: 'YEC'},
    student: {user: {identification: '1754215109', lastname: 'CHIPANTAXI CLAVIJO', name: 'ESTEFANIA FERNANDA', email: 'efe.chip@yavirac.edu.ec',        personalEmail: 'este@gmail.com',     cellPhone: '0998765432', phone: '02345678'}},
    type: CAT.typeEspecial, academicPeriod: CAT.apCuarto,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentState: {state: CAT.stApproved},
    observation: '', socioeconomicCategory: 'A', socioeconomicPercentage: '50', socioeconomicScore: '75.20',
  },
  {
    id: IDS.en[3], code: '2025_2p_3c-YEC-1712345678', date: null,
    career: {id: IDS.career, name: 'YEC'},
    student: {user: {identification: '1712345678', lastname: 'GARCIA LOPEZ',       name: 'MARIA JOSE',        email: 'mjg.garcia@yavirac.edu.ec',     personalEmail: 'maria@gmail.com',    cellPhone: '0995551234', phone: ''}},
    type: CAT.typeOrdinaria, academicPeriod: CAT.apPrimero,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentState: {state: CAT.stRequested},
    observation: '', socioeconomicCategory: 'C', socioeconomicPercentage: '70', socioeconomicScore: '90.00',
  },
  {
    id: IDS.en[4], code: '2025_2p_3c-YEC-1798765432', date: null,
    career: {id: IDS.career, name: 'YEC'},
    student: {user: {identification: '1798765432', lastname: 'TORRES MORA',        name: 'PEDRO ANDRES',      email: 'pat.torres@yavirac.edu.ec',     personalEmail: 'pedro@gmail.com',    cellPhone: '0992223344', phone: ''}},
    type: CAT.typeOrdinaria, academicPeriod: CAT.apStarter,
    workday: CAT.workday0709, parallel: CAT.parallelB,
    enrollmentState: {state: CAT.stRegistered},
    observation: '', socioeconomicCategory: 'B', socioeconomicPercentage: '40', socioeconomicScore: '60.50',
  },
];

// Estado mutable de las matrículas (permite aprobar/rechazar/etc en el mock)
let enrollmentStates: Record<string, any> = {
  [IDS.en[0]]: CAT.stEnrolled,
  [IDS.en[1]]: CAT.stEnrolled,
  [IDS.en[2]]: CAT.stApproved,
  [IDS.en[3]]: CAT.stRequested,
  [IDS.en[4]]: CAT.stRegistered,
};

// ─── Detalles de matrícula ────────────────────────────────────────────────────
const DETAILS: Record<string, any[]> = {
  [IDS.en[0]]: [{
    id: IDS.det[0], number: 1, date: '2026-04-23',
    subject: SUBJECTS[0], type: CAT.typeEspecial,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentDetailState: {state: CAT.stEnrolled},
    finalGrade: null, finalAttendance: null, academicState: null, observation: '',
  }],
  [IDS.en[1]]: [{
    id: IDS.det[1], number: 1, date: '2026-04-23',
    subject: SUBJECTS[0], type: CAT.typeEspecial,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentDetailState: {state: CAT.stEnrolled},
    finalGrade: null, finalAttendance: null, academicState: null, observation: '',
  }],
  [IDS.en[2]]: [{
    id: IDS.det[2], number: 1, date: '2026-04-23',
    subject: SUBJECTS[0], type: CAT.typeEspecial,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentDetailState: {state: CAT.stApproved},
    finalGrade: null, finalAttendance: null, academicState: null, observation: '',
  }],
  [IDS.en[3]]: [{
    id: IDS.det[3], number: 1, date: null,
    subject: SUBJECTS[2], type: CAT.typeOrdinaria,
    workday: CAT.workday0913, parallel: CAT.parallelA,
    enrollmentDetailState: {state: CAT.stRequested},
    finalGrade: null, finalAttendance: null, academicState: null, observation: '',
  }],
  [IDS.en[4]]: [{
    id: IDS.det[4], number: 1, date: null,
    subject: SUBJECTS[3], type: CAT.typeOrdinaria,
    workday: CAT.workday0709, parallel: CAT.parallelB,
    enrollmentDetailState: {state: CAT.stRegistered},
    finalGrade: null, finalAttendance: null, academicState: null, observation: '',
  }],
};

// Estado mutable detalles
let detailStates: Record<string, any> = {
  [IDS.det[0]]: CAT.stEnrolled,
  [IDS.det[1]]: CAT.stEnrolled,
  [IDS.det[2]]: CAT.stApproved,
  [IDS.det[3]]: CAT.stRequested,
  [IDS.det[4]]: CAT.stRegistered,
};

// ─── Catálogos por tipo ───────────────────────────────────────────────────────
const CATALOGUES: Record<string, any[]> = {
  // Types
  enrollment_type:            [CAT.typeOrdinaria, CAT.typeEspecial, {id: 'ct000001-0000-0000-0000-000000000003', code: 'extraordinary', name: 'Extraordinaria'}],
  enrollments_type:           [CAT.typeOrdinaria, CAT.typeEspecial, {id: 'ct000001-0000-0000-0000-000000000003', code: 'extraordinary', name: 'Extraordinaria'}],
  // Parallels
  parallel:                   [CAT.parallelA, CAT.parallelB, {id: 'ct000002-0000-0000-0000-000000000003', code: 'c', name: 'C'}],
  // Workdays
  enrollments_workday:        [CAT.workday0709, CAT.workday0913, {id: 'ct000003-0000-0000-0000-000000000003', code: '3', name: '09:00-11:00'}],
  // Academic periods
  academic_period:            [
    CAT.apStarter,
    CAT.apPrimero,
    {id: 'ct000004-0000-0000-0000-000000000004', code: '2', name: 'Segundo'},
    {id: 'ct000004-0000-0000-0000-000000000005', code: '3', name: 'Tercero'},
    CAT.apCuarto,
    {id: 'ct000004-0000-0000-0000-000000000006', code: '5', name: 'Quinto'},
    {id: 'ct000004-0000-0000-0000-000000000007', code: '6', name: 'Sexto'},
  ],
  // Enrollment states
  enrollment_state:           [CAT.stRegistered, CAT.stRequested, CAT.stApproved, CAT.stEnrolled, CAT.stRejected, CAT.stRevoked],
  enrollments_state:          [CAT.stRegistered, CAT.stRequested, CAT.stApproved, CAT.stEnrolled, CAT.stRejected, CAT.stRevoked],
  // Academic states
  enrollments_academic_state: [CAT.acAprobado, CAT.acReprobado],
};

// ─── Helper: respuesta OK ─────────────────────────────────────────────────────
const ok = (data: any, pagination?: any) =>
  of(new HttpResponse({status: 200, body: {data, pagination: pagination ?? null, message: 'ok', title: 'ok'}}));

// ─── Helper: encontrar enrollment por id ──────────────────────────────────────
const getEnrollment = (id: string) => {
  const e = ENROLLMENTS.find(e => e.id === id);
  if (!e) return null;
  return {...e, enrollmentState: {state: enrollmentStates[id] ?? e.enrollmentState.state}};
};

// ─── Helper: encontrar detail por id ──────────────────────────────────────────
const getDetail = (id: string) => {
  for (const dets of Object.values(DETAILS)) {
    const d = dets.find((d: any) => d.id === id);
    if (d) return {...d, enrollmentDetailState: {state: detailStates[id] ?? d.enrollmentDetailState.state}};
  }
  return null;
};

// ─── INTERCEPTOR ─────────────────────────────────────────────────────────────
export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  const method = req.method;

  // ── School periods ──────────────────────────────────────────────────────────
  if (url.includes('/school-periods/states/open')) {
    return ok({id: IDS.schoolPeriod, name: 'FEBRERO 2026 - MARZO 2026', shortName: '2025_2p_3c'});
  }
  if (url.includes('/school-periods') && method === 'GET') {
    return ok([{id: IDS.schoolPeriod, name: 'FEBRERO 2026 - MARZO 2026', shortName: '2025_2p_3c'}],
              {totalItems: 1, limit: 10, page: 0, offset: 0});
  }

  // ── Careers: subjects by career ──────────────────────────────────────────────
  if (url.match(/\/careers\/[^/]+\/subjects/) && method === 'GET') {
    return ok(SUBJECTS);
  }

  // ── Careers ─────────────────────────────────────────────────────────────────
  if (url.includes('/careers/') && url.includes('/enrollments')) {
    const search           = (req.params.get('search') ?? '').toLowerCase().trim();
    const academicPeriodId  = req.params.get('academicPeriodId') ?? '';
    const enrollmentStateId = req.params.get('enrollmentStateId') ?? '';

    let list = ENROLLMENTS.map(e => ({
      ...e,
      enrollmentState: {state: enrollmentStates[e.id] ?? e.enrollmentState.state}
    }));

    if (search) {
      list = list.filter(e =>
        e.student.user.identification.toLowerCase().includes(search) ||
        e.student.user.lastname.toLowerCase().includes(search) ||
        e.student.user.name.toLowerCase().includes(search)
      );
    }

    if (academicPeriodId) {
      list = list.filter(e => e.academicPeriod?.id === academicPeriodId);
    }

    if (enrollmentStateId) {
      list = list.filter(e => {
        const currentState = enrollmentStates[e.id] ?? e.enrollmentState.state;
        return currentState.id === enrollmentStateId;
      });
    }

    return ok(list, {totalItems: list.length, limit: 10, page: 0, offset: 0});
  }
  if (url.includes('/careers') && method === 'GET') {
    return ok([{id: IDS.career, name: 'YEC', code: 'YEC', curriculums: [{id: IDS.curriculum}]}],
              {totalItems: 1, limit: 10, page: 0, offset: 0});
  }

  // ── Catalogues ──────────────────────────────────────────────────────────────
  if (url.includes('/catalogues/catalogue') || url.includes('/catalogues')) {
    // Try req.params first (HttpParams), then URL string as fallback
    const type = req.params.get('type') ?? url.match(/[?&]type=([^&]+)/)?.[1] ?? '';
    const result = CATALOGUES[type] ?? [];
    console.log('[MOCK] catalogue type:', type, '→ results:', result.length);
    return ok(result);
  }

  // ── Curriculums / Subjects ──────────────────────────────────────────────────
  if (url.includes('/curriculums/') && url.includes('/subjects')) {
    return ok(SUBJECTS);
  }

  // ── Enrollments ─────────────────────────────────────────────────────────────
  if (url.match(/\/enrollments\/[^/]+\/enrollment-details/) && method === 'GET') {
    const enrollmentId = url.split('/enrollments/')[1].split('/')[0];
    const details = (DETAILS[enrollmentId] ?? []).map(d => ({
      ...d,
      enrollmentDetailState: {state: detailStates[d.id] ?? d.enrollmentDetailState.state}
    }));
    return ok(details);
  }
  if (url.match(/\/enrollments\/[^/]+\/approve/) && method === 'PATCH') {
    const id = url.split('/enrollments/')[1].split('/')[0];
    enrollmentStates[id] = CAT.stApproved;
    return ok(getEnrollment(id));
  }
  if (url.match(/\/enrollments\/[^/]+\/enroll/) && method === 'PATCH') {
    const id = url.split('/enrollments/')[1].split('/')[0];
    enrollmentStates[id] = CAT.stEnrolled;
    return ok(getEnrollment(id));
  }
  if (url.match(/\/enrollments\/[^/]+\/reject/) && method === 'PATCH') {
    const id = url.split('/enrollments/')[1].split('/')[0];
    enrollmentStates[id] = CAT.stRejected;
    return ok(getEnrollment(id));
  }
  if (url.match(/\/enrollments\/[^/]+\/revoke/) && method === 'PATCH') {
    const id = url.split('/enrollments/')[1].split('/')[0];
    enrollmentStates[id] = CAT.stRevoked;
    return ok(getEnrollment(id));
  }
  if (url.match(/\/enrollments\/[^/]+$/) && method === 'GET') {
    const id = url.split('/enrollments/')[1];
    return ok(getEnrollment(id));
  }
  if (url.match(/\/enrollments\/[^/]+$/) && (method === 'PUT' || method === 'PATCH')) {
    const id = url.split('/enrollments/')[1].split('/')[0];
    return ok(getEnrollment(id));
  }

  // ── Enrollment details ──────────────────────────────────────────────────────
  if (url.match(/\/enrollment-details\/[^/]+\/approve/) && method === 'PATCH') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    detailStates[id] = CAT.stApproved;
    return ok(getDetail(id));
  }
  if (url.match(/\/enrollment-details\/[^/]+\/enroll/) && method === 'PATCH') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    detailStates[id] = CAT.stEnrolled;
    return ok(getDetail(id));
  }
  if (url.match(/\/enrollment-details\/[^/]+\/reject/) && method === 'PATCH') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    detailStates[id] = CAT.stRejected;
    return ok(getDetail(id));
  }
  if (url.match(/\/enrollment-details\/[^/]+\/revoke/) && method === 'PATCH') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    detailStates[id] = CAT.stRevoked;
    return ok(getDetail(id));
  }
  if (url.match(/\/enrollment-details\/[^/]+\/send-request/) && method === 'POST') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    return ok(getDetail(id));
  }
  if (url.match(/\/enrollment-details\/[^/]+$/) && method === 'GET') {
    const id = url.split('/enrollment-details/')[1];
    return ok(getDetail(id));
  }
  if (url.includes('/enrollment-details') && method === 'POST') {
    const newId = 'de000099-0000-0000-0000-' + Date.now().toString().slice(-12);
    const body = req.body as any;
    // Auto-calculate number: count how many times this EXACT SUBJECT has been enrolled historically
    const subjectId = body?.subject?.id ?? '';
    let subjectCount = 0;
    if (subjectId) {
      for (const dets of Object.values(DETAILS)) {
        subjectCount += (dets as any[]).filter((d: any) => d.subject?.id === subjectId).length;
      }
    }
    const autoNumber = subjectId ? Math.min(subjectCount + 1, 3) : 1;
    const autoDate   = new Date().toISOString().split('T')[0];

    const newDetail = {
      id: newId,
      number: body?.number ?? autoNumber,
      date: body?.date ?? autoDate,
      subject: SUBJECTS.find(s => s.id === (body?.subject?.id ?? body?.subjectId)) ?? body?.subject ?? SUBJECTS[0],
      type: body?.type ?? CATALOGUES['enrollment_type']?.find((c:any) => c.id === body?.typeId) ?? CAT.typeOrdinaria,
      workday: body?.workday ?? CATALOGUES['enrollments_workday']?.find((c:any) => c.id === body?.workdayId) ?? CAT.workday0913,
      parallel: body?.parallel ?? CATALOGUES['parallel']?.find((c:any) => c.id === body?.parallelId) ?? CAT.parallelA,
      enrollmentDetailState: {state: CAT.stRegistered},
      finalGrade: null, finalAttendance: null, academicState: null, observation: body?.observation ?? '',
    };
    const enrollmentId = body?.enrollmentId;
    if (enrollmentId) {
      if (!DETAILS[enrollmentId]) DETAILS[enrollmentId] = [];
      DETAILS[enrollmentId].push(newDetail);
    }
    detailStates[newId] = CAT.stRegistered;
    return ok(newDetail);
  }
  if (url.match(/\/enrollment-details\/[^/]+$/) && method === 'PUT') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    const body = req.body as any;
    // Apply the update to the stored detail
    for (const enrollmentId of Object.keys(DETAILS)) {
      const idx = DETAILS[enrollmentId].findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        const existing = DETAILS[enrollmentId][idx];
        // Update editable fields — form sends complete objects
        DETAILS[enrollmentId][idx] = {
          ...existing,
          workday:         body?.workday         ?? existing.workday,
          parallel:        body?.parallel        ?? existing.parallel,
          finalGrade:      body?.finalGrade      !== undefined ? body.finalGrade      : existing.finalGrade,
          finalAttendance: body?.finalAttendance !== undefined ? body.finalAttendance : existing.finalAttendance,
          academicState:   body?.academicState   ?? existing.academicState,
          observation:     body?.observation     !== undefined ? body.observation     : existing.observation,
        };
        break;
      }
    }
    return ok(getDetail(id));
  }
  if (url.match(/\/enrollment-details\/[^/]+$/) && method === 'DELETE') {
    const id = url.split('/enrollment-details/')[1].split('/')[0];
    for (const key of Object.keys(DETAILS)) {
      DETAILS[key] = DETAILS[key].filter((d: any) => d.id !== id);
    }
    return ok({});
  }

  // ── Reports (descargas) — devuelve blob vacío ───────────────────────────────
  if (url.includes('/enrollment-reports')) {
    return of(new HttpResponse({status: 200, body: new Blob(['mock pdf'], {type: 'application/pdf'})}));
  }

  // Cualquier otra petición: pasa al backend real
  return next(req);
};
