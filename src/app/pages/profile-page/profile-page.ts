import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { AuthService } from '../../auth/auth.service';
import { StructureService } from '../../superadmin/services/structure.service';

/**
 * Page « Profil » — affiche dynamiquement l'utilisateur connecté.
 *
 * Aucune donnée n'est codée en dur : toutes les valeurs proviennent de
 * `AuthService.currentUser` (nom, email, téléphone, rôle, structure, statut,
 * date de création) et de `StructureService` pour le nom de la structure.
 * Accessible par tout utilisateur authentifié (authGuard).
 */
@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [BasePageComponent, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePageComponent {
  constructor(
    private authService: AuthService,
    private structureService: StructureService,
    private router: Router
  ) {}

  /** Utilisateur actuellement connecté. */
  protected get user() {
    return this.authService.currentUser;
  }

  /** Nom de la structure (plutôt que le seul structureId). */
  protected get structureName(): string {
    const id = this.user?.structureId;
    if (!id) return '—';
    const structure = this.structureService.getStructure(id);
    return structure?.nom || id;
  }

  /** Libellé lisible du rôle. */
  protected roleLabel(): string {
    switch (this.user?.role) {
      case 'SUPERADMIN':
        return 'Super administrateur';
      case 'ADMIN_STRUCTURE':
        return 'Administrateur de structure';
      case 'USER':
        return 'Technicien';
      default:
        return this.user?.role || '—';
    }
  }

  /** Classe CSS du badge de rôle. */
  protected roleClass(): string {
    switch (this.user?.role) {
      case 'SUPERADMIN':
        return 'profile-badge-super';
      case 'ADMIN_STRUCTURE':
        return 'profile-badge-admin';
      default:
        return 'profile-badge-user';
    }
  }

  /** Libellé lisible du statut du compte. */
  protected statutLabel(): string {
    switch (this.user?.statut) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      case 'PENDING':
        return 'En attente de validation';
      default:
        return this.user?.statut || '—';
    }
  }

  /** Classe CSS du badge de statut. */
  protected statutClass(): string {
    switch (this.user?.statut) {
      case 'ACTIVE':
        return 'profile-badge-active';
      case 'PENDING':
        return 'profile-badge-pending';
      default:
        return 'profile-badge-inactive';
    }
  }

  /** Initiale de l'utilisateur pour l'avatar. */
  protected initials(): string {
    const name = this.user?.name?.trim();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  /** Déconnexion (fonctionnalité existante conservée). */
  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}