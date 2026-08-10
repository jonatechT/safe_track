import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'safe_track_token';
  private readonly USER_KEY = 'safe_track_user';

  isLoggedIn = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(this.TOKEN_KEY);
    }
    return false;
  }

  login(email: string, password: string): boolean {
    // Simple mock authentication - in production, call a real API
    if (email && password) {
      const user: User = {
        id: 1,
        name: 'OUEDRAOGO Ali',
        email: email,
        role: 'admin'
      };
      localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  register(name: string, email: string, password: string): boolean {
    if (name && email && password) {
      const user: User = {
        id: Date.now(),
        name: name,
        email: email,
        role: 'user'
      };
      localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedIn.set(false);
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }
}
