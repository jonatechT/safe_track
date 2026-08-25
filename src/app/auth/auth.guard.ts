import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Non connecté : retour à la page de connexion
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Compte en attente de validation admin : accès au dashboard bloqué
  const user = authService.getUser();
  if (user?.statut === 'PENDING') {
    router.navigate(['/pending']);
    return false;
  }

  return true;
};