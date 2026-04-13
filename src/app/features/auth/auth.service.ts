import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'admin' | 'user' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<UserRole>(this.getInitialRole());
  public role$ = this.roleSubject.asObservable();

  constructor() {}

  private getInitialRole(): UserRole {
    const stored = localStorage.getItem('user_role');
    return (stored as UserRole) || null;
  }

  getCurrentRole(): UserRole {
    return this.roleSubject.value;
  }

  login(role: UserRole): void {
    this.roleSubject.next(role);
    if (role) {
      localStorage.setItem('user_role', role);
    }
  }

  logout(): void {
    this.roleSubject.next(null);
    localStorage.removeItem('user_role');
  }

  isAuthenticated(): boolean {
    return this.roleSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.roleSubject.value === 'admin';
  }

  isUser(): boolean {
    return this.roleSubject.value === 'user';
  }
}
