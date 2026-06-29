export {CoreService} from './core.service';
export {CustomMessageService} from './custom-message.service';
export {FileHttpService} from './file-http.service';
export {CatalogueHttpService} from './catalogue-http.service';
export {DpaHttpService} from './dpa-http.service';
export {FormRegistryService} from './form-registry.service';

// ── Stubs requeridos por el módulo secretary/enrollment ──────────────────────
export {BreadcrumbService} from './breadcrumb.service';
export {MessageService as AppMessageService} from './message.service';
export {RoutesService} from './routes.service';
export {CareersService} from './careers.service';
export {CareersHttpService} from './careers-http.service';
export {CataloguesHttpService} from './catalogues-http.service';
export {SchoolPeriodsHttpService} from './school-periods-http.service';
export {SchoolPeriodsService} from './school-periods.service';
export {StudentsHttpService} from './students-http.service';
export {CurriculumsHttpService} from './curriculums-http.service';

// Re-export MessageService con el nombre que usan los componentes
export {MessageService} from './message.service';
