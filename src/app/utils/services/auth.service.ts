import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AuthService {
    get roles(): string[] { return []; }
    hasRole(_role: string): boolean { return true; }
}
