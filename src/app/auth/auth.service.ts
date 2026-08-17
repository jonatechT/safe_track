import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'SUPERADMIN' | 'ADMIN_STRUCTURE' | 'USER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  structureId?: string;
  statut?: 'ACTIVE' | 'INACTIVE';
  telephone?: string;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'safe_track_token';
  private readonly USER_KEY = 'safe_track_user';
  private readonly USERS_REGISTRY_KEY = 'safe_track_users';

  private readonly SUPER_ADMIN_EMAIL = 'superadmin@safetrack.com';
  private readonly SUPER_ADMIN_PASSWORD = 'admin123';

  isLoggedIn = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(this.TOKEN_KEY);
    }
    return false;
  }

  /** Utilisateur actuellement connecté */
  get currentUser(): User | null {
    return this.getUser();
  }

  /** Rôle de l'utilisateur connecté */
  get role(): UserRole | null {
    return this.getUser()?.role ?? null;
  }

  /** Structure de l'utilisateur connecté (ADMIN_STRUCTURE ou USER) */
  get structureId(): string | null {
    return this.getUser()?.structureId ?? null;
  }

  login(email: string, password: string): boolean {
    if (email && password) {
      // Compte SuperAdmin de démonstration
      if (email.trim().toLowerCase() === this.SUPER_ADMIN_EMAIL && password === this.SUPER_ADMIN_PASSWORD) {
        const user: User = {
          id: 0,
          name: 'SUPER ADMIN',
          email: email.trim().toLowerCase(),
          role: 'SUPERADMIN'
        };
        localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token-superadmin');
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.isLoggedIn.set(true);
        return true;
      }

      // Vérifier la base des utilisateurs enregistrés
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
        const registered = raw ? JSON.parse(raw) : [];
        const existing = registered.find(
          (u: User) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existing) {
          // Vérifier que le compte est actif
          if (existing.statut === 'INACTIVE') {
            return false;
          }
          localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
          localStorage.setItem(this.USER_KEY, JSON.stringify(existing));
          this.isLoggedIn.set(true);
          return true;
        }
      }

      // Fallback: utilisateur générique
      const user: User = {
        id: Date.now(),
        name: 'OUEDRAOGO Ali',
        email: email.trim().toLowerCase(),
        role: 'USER',
        statut: 'ACTIVE',
        dateCreation: new Date().toISOString()
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
        email: email.trim().toLowerCase(),
        role: 'USER',
        statut: 'ACTIVE',
        dateCreation: new Date().toISOString()
      };
      // Ajouter à la base des utilisateurs enregistrés
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
        const registered = raw ? JSON.parse(raw) : [];
        registered.push(user);
        localStorage.setItem(this.USERS_REGISTRY_KEY, JSON.stringify(registered));
      }
      localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  /** Enregistrer un utilisateur créé par le SuperAdmin ou l'Admin de structure */
  registerUser(user: User): void {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
      const registered = raw ? JSON.parse(raw) : [];
      const existing = registered.find(
        (u: User) => u.email.toLowerCase() === user.email.toLowerCase()
      );
      if (existing) {
        Object.assign(existing, user);
      } else {
        registered.push(user);
      }
      localStorage.setItem(this.USERS_REGISTRY_KEY, JSON.stringify(registered));
    }
  }

  /** Récupérer tous les utilisateurs enregistrés (hors superadmin) */
  getAllUsers(): User[] {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
      const users: User[] = raw ? JSON.parse(raw) : [];
      return users.filter((u: User) => u.role !== 'SUPERADMIN');
    }
    return [];
  }

  /** Récupérer les utilisateurs d'une structure donnée */
  getUsersByStructure(structureId: string): User[] {
    return this.getAllUsers().filter(u => u.structureId === structureId);
  }

  hasRole(role: UserRole): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPERADMIN');
  }

  isStructureAdmin(): boolean {
    return this.hasRole('ADMIN_STRUCTURE');
  }

  isUser(): boolean {
    return this.hasRole('USER');
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