import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard pour les pages de gestion de structure.
 * Seuls les ADMIN_STRUCTURE et SUPERADMIN peuvent accéder.
 */
export const structureAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isSuperAdmin() || authService.isStructureAdmin()) {
    return true;
  }

  // USER normal : redirection vers le dashboard
  router.navigate(['/dashboard']);
  return false;
};