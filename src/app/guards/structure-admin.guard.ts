import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard pour la page de gestion des techniciens.
 * Seul le rôle ADMIN_STRUCTURE peut accéder à /users.
 *
 * - ADMIN_STRUCTURE  → accès autorisé (gestion des techniciens de sa structure)
 * - SUPERADMIN       → accès redirigé vers son espace /superadmin
 * - USER (TECHNICIEN) → accès refusé, redirection vers /dashboard
 */
export const structureAdminGuard: CanActivateFn = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // SUPERADMIN → son espace dédié /superadmin
  if (authService.isSuperAdmin()) {
    router.navigate(['/superadmin']);
    return false;
  }

  // Seul l'ADMIN_STRUCTURE peut gérer les techniciens de sa structure
  if (authService.isStructureAdmin()) {
    return true;
  }

  // TECHNICIEN / USER → redirection vers le dashboard
  router.navigate(['/dashboard']);
  return false;
};