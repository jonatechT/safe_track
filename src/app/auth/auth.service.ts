import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'SUPERADMIN' | 'ADMIN_STRUCTURE' | 'USER';
export type UserStatut = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  structureId?: string;
  statut?: UserStatut;
  telephone?: string;
  dateCreation?: string;
  motDePasse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'safe_track_token';
  private readonly USER_KEY = 'safe_track_user';
  private readonly USERS_REGISTRY_KEY = 'safe_track_users';
  private readonly USERS_VERSION_KEY = 'safe_track_users_version';
  private readonly USERS_CURRENT_VERSION = '2';

  private readonly SUPER_ADMIN_EMAIL = 'superadmin@safetrack.com';
  private readonly SUPER_ADMIN_PASSWORD = 'admin123';

  isLoggedIn = signal<boolean>(this.hasToken());

  constructor() {
    this.seedDemoUsers();
  }

  /** Comptes de démonstration pour les structures */
  private seedDemoUsers(): void {
    if (typeof window === 'undefined') return;
    const version = localStorage.getItem(this.USERS_VERSION_KEY);
    if (version === this.USERS_CURRENT_VERSION) return;

    const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
    const registered: User[] = raw ? JSON.parse(raw) : [];

    const demoUsers: User[] = [
      {
        id: 1,
        name: 'Admin Alioth',
        email: 'admin@alioth-system.com',
        role: 'ADMIN_STRUCTURE',
        structureId: 'STR-001',
        statut: 'ACTIVE',
        telephone: '+226 70 98 76 54',
        dateCreation: '2024-03-20T10:00:00.000Z',
        motDePasse: 'alioth2024'
      },
      {
        id: 2,
        name: 'Admin Orange',
        email: 'admin@orange-energie.com',
        role: 'ADMIN_STRUCTURE',
        structureId: 'STR-002',
        statut: 'ACTIVE',
        telephone: '+226 70 12 34 56',
        dateCreation: '2024-01-15T10:00:00.000Z',
        motDePasse: 'orange2024'
      },
      {
        id: 3,
        name: 'M. Ouedraogo',
        email: 'mamadou@safe-track.com',
        role: 'USER',
        structureId: 'STR-001',
        statut: 'ACTIVE',
        telephone: '+226 70 11 22 33',
        dateCreation: '2024-04-10T10:00:00.000Z',
        motDePasse: 'technicien123'
      },
      {
        id: 4,
        name: 'M. Traore',
        email: 'traore@safe-track.com',
        role: 'USER',
        structureId: 'STR-001',
        statut: 'ACTIVE',
        telephone: '+226 76 44 55 66',
        dateCreation: '2024-05-12T10:00:00.000Z',
        motDePasse: 'technicien123'
      },
      {
        id: 5,
        name: 'M. Sanogo',
        email: 'sanogo@safe-track.com',
        role: 'USER',
        structureId: 'STR-002',
        statut: 'ACTIVE',
        telephone: '+226 71 77 88 99',
        dateCreation: '2024-06-18T10:00:00.000Z',
        motDePasse: 'technicien123'
      }
    ];

    demoUsers.forEach(demo => {
      const existing = registered.find(u => u.email.toLowerCase() === demo.email.toLowerCase());
      if (existing) {
        Object.assign(existing, demo);
      } else {
        registered.push(demo);
      }
    });

    localStorage.setItem(this.USERS_REGISTRY_KEY, JSON.stringify(registered));
    localStorage.setItem(this.USERS_VERSION_KEY, this.USERS_CURRENT_VERSION);
  }

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

  /**
   * Connexion.
   * @returns un objet indiquant si la connexion a réussi et si le compte
   *          est en attente de validation par un administrateur.
   */
  login(email: string, password: string): { success: boolean; pending: boolean } {
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
        return { success: true, pending: false };
      }

      // Vérifier la base des utilisateurs enregistrés
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
        const registered = raw ? JSON.parse(raw) : [];
        const existing = registered.find(
          (u: User) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existing) {
          // Compte en attente de validation admin : accès refusé
          if (existing.statut === 'PENDING') {
            return { success: false, pending: true };
          }
          // Vérifier que le compte est actif
          if (existing.statut === 'INACTIVE') {
            return { success: false, pending: false };
          }
          // Vérifier le mot de passe si le compte en a un défini
          if (existing.motDePasse && existing.motDePasse !== password) {
            return { success: false, pending: false };
          }
          localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
          localStorage.setItem(this.USER_KEY, JSON.stringify(existing));
          this.isLoggedIn.set(true);
          return { success: true, pending: false };
        }
      }

      // Fallback: utilisateur générique (compte actif)
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
      return { success: true, pending: false };
    }
    return { success: false, pending: false };
  }

  /** Récupérer tous les comptes en attente de validation (vue globale superadmin) */
  getPendingUsers(): User[] {
    return this.getAllUsers().filter(u => u.statut === 'PENDING');
  }

  /** Valider un compte en attente (admin uniquement) */
  validerCompte(userId: number): void {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
      const registered: User[] = raw ? JSON.parse(raw) : [];
      const target = registered.find(u => u.id === userId);
      if (target) {
        target.statut = 'ACTIVE';
        localStorage.setItem(this.USERS_REGISTRY_KEY, JSON.stringify(registered));
      }
    }
  }

  /** Rejeter un compte en attente (suppression définitive) */
  rejeterCompte(userId: number): void {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.USERS_REGISTRY_KEY);
      const registered: User[] = raw ? JSON.parse(raw) : [];
      const filtered = registered.filter(u => u.id !== userId);
      localStorage.setItem(this.USERS_REGISTRY_KEY, JSON.stringify(filtered));
    }
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