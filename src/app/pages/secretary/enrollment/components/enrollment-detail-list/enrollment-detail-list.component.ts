import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PrimeIcons} from 'primeng/api';

import {BreadcrumbService, MessageService, RoutesService} from '@services/core';
import {EnrollmentDetailModel} from '@models/core';
import {BreadcrumbEnum, LabelButtonActionEnum, RolesEnum, SeverityButtonActionEnum} from '@utils/enums';
import {EnrollmentService} from '../../enrollment.service';

import {ButtonModule} from 'primeng/button';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {InputTextModule} from 'primeng/inputtext';
import {Drawer} from 'primeng/drawer';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {DividerModule} from 'primeng/divider';
import {CommonModule} from '@angular/common';
import {EnrollmentStatePipe} from '@utils/pipes/core/enrollment-state.pipe';
import {AcademicStateSeverityPipe} from '@utils/pipes/core/academic-state-severity.pipe';

@Component({
  selector: 'app-enrollment-detail-list',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, InputGroupModule, InputGroupAddonModule,
    InputTextModule, Drawer, TableModule, Tag, DividerModule,
    EnrollmentStatePipe, AcademicStateSeverityPipe,
  ],
  templateUrl: './enrollment-detail-list.component.html',
})
export class EnrollmentDetailListComponent implements OnInit {
  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly routesService     = inject(RoutesService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly messageService    = inject(MessageService);

  protected readonly PrimeIcons               = PrimeIcons;
  protected readonly LabelButtonActionEnum    = LabelButtonActionEnum;
  protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;

  protected enrollmentId    = signal('');
  protected items           = signal<EnrollmentDetailModel[]>([]);
  protected isLoading       = signal(false);
  protected selectedItem    = signal<EnrollmentDetailModel | null>(null);
  protected isButtonActions = signal(false);

  protected readonly columns = [
    {field: 'academicPeriod',        header: 'Periodo Académico'},
    {field: 'subject',               header: 'Asignaturas'},
    {field: 'number',                header: 'Número de Matrícula'},
    {field: 'workday',               header: 'Horario'},
    {field: 'parallel',              header: 'Paralelo'},
    {field: 'type',                  header: 'Tipo de Matrícula'},
    {field: 'enrollmentDetailState', header: 'Estado'},
    {field: 'finalGrade',            header: 'Calificación'},
    {field: 'finalAttendance',       header: 'Asistencia'},
    {field: 'academicState',         header: 'Estado Académico'},
  ];

  ngOnInit(): void {
    this.enrollmentId.set(this.route.snapshot.params['enrollmentId']);
    this.breadcrumbService.setItems([
      {label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments(RolesEnum.SECRETARY)]},
      {label: 'Detalle de Matrícula'},
    ]);
    this.loadDetails();
  }

  loadDetails(): void {
    this.isLoading.set(true);
    this.enrollmentService.findDetailsByEnrollment(this.enrollmentId()).subscribe({
      next: items => { this.items.set(items); this.isLoading.set(false); },
      error: ()   => this.isLoading.set(false),
    });
  }

  enroll(id: string): void {
    this.enrollmentService.enrollDetail(id).subscribe(() => {
      this.messageService.showSuccess('Matriculado', 'La asignatura fue matriculada');
      this.loadDetails();
    });
  }
  revoke(id: string): void {
    this.enrollmentService.revokeDetail(id).subscribe(() => {
      this.messageService.showSuccess('Anulado', 'La asignatura fue anulada');
      this.loadDetails();
    });
  }
  approve(id: string): void {
    this.enrollmentService.approveDetail(id).subscribe(() => {
      this.messageService.showSuccess('Aprobado', 'La asignatura fue aprobada');
      this.loadDetails();
    });
  }
  reject(id: string): void {
    this.enrollmentService.rejectDetail(id).subscribe(() => {
      this.messageService.showSuccess('Rechazado', 'La asignatura fue rechazada');
      this.loadDetails();
    });
  }
  remove(id: string): void {
    this.messageService.questionDelete().then(result => {
      if (result.isConfirmed) {
        this.enrollmentService.removeDetail(id).subscribe(() => {
          this.items.update(items => items.filter(i => i.id !== id));
        });
      }
    });
  }

  selectItem(item: EnrollmentDetailModel): void {
    this.selectedItem.set(item);
    this.isButtonActions.set(true);
  }

  goToCreate(): void {
    this.router.navigate([this.routesService.enrollmentsDetailForm(this.enrollmentId()), 'new']);
  }
  goToEdit(id: string): void {
    this.router.navigate([this.routesService.enrollmentsDetailForm(this.enrollmentId()), id]);
  }
}
