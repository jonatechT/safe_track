import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MaintenanceService } from '../services/maintenance.service';
import { EquipmentService } from '../services/equipment.service';

/**
 * Restreint l'accès au détail d'un équipement pour un technicien :
 * il ne peut ouvrir /equipements/:id que si l'intervention associée
 * (le cas échéant) n'est pas encore prise, ou lui est assignée.
 * L'admin de structure et le SuperAdmin voient toujours tout.
 *
 * Défense en profondeur : la protection principale pour l'usage normal
 * est déjà côté UI (ligne non cliquable sur /maintenance) — ce guard
 * couvre l'accès direct par URL.
 */
export const interventionAccessGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const maintenanceService = inject(MaintenanceService);
  const equipmentService = inject(EquipmentService);
  const router = inject(Router);

  if (authService.isStructureAdmin() || authService.isSuperAdmin()) {
    return true;
  }

  const id = route.paramMap.get('id');
  const equipment = id ? equipmentService.getById(id) : undefined;
  if (!equipment) {
    // Laisser le composant afficher son état « équipement introuvable ».
    return true;
  }

  const item = maintenanceService.getItems().find(i => i.equipment === equipment.nom);
  const currentName = authService.getUser()?.name;
  if (item?.prisPar && item.prisPar !== currentName) {
    router.navigate(['/maintenance'], { queryParams: { denied: '1' } });
    return false;
  }

  return true;
};
