import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { superAdminGuard } from './superadmin/guards/superadmin.guard';
import { structureAdminGuard } from './guards/structure-admin.guard';
import { interventionAccessGuard } from './guards/intervention-access.guard';

export const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent) },
  { path: 'pending', loadComponent: () => import('./auth/pending/pending').then(m => m.PendingComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'equipements', loadComponent: () => import('./pages/equipment-list-page/equipment-list-page').then(m => m.EquipmentListPageComponent), canActivate: [authGuard] },
  // Ancien nom de la route (parc d'équipement) : redirigé pour compatibilité des anciens liens/bookmarks
  { path: 'location', redirectTo: '/equipements', pathMatch: 'full' },
  {
    path: 'equipements/en-ligne',
    loadComponent: () => import('./pages/equipment-list-page/equipment-list-page').then(m => m.EquipmentListPageComponent),
    data: { enLigne: true },
    canActivate: [authGuard]
  },
  { path: 'location/en-ligne', redirectTo: '/equipements/en-ligne', pathMatch: 'full' },
  { path: 'equipements/nouveau', loadComponent: () => import('./pages/equipment-form-page/equipment-form-page').then(m => m.EquipmentFormPageComponent), canActivate: [authGuard] },
  {
    path: 'equipements/:id',
    loadComponent: () => import('./pages/equipment-detail-page/equipment-detail-page').then(m => m.EquipmentDetailPageComponent),
    canActivate: [authGuard, interventionAccessGuard]
  },
  { path: 'maintenance', loadComponent: () => import('./pages/maintenance-page/maintenance-page').then(m => m.MaintenancePageComponent), canActivate: [authGuard] },
  { path: 'rapports', loadComponent: () => import('./pages/rapports-page/rapports-page').then(m => m.RapportsPageComponent), canActivate: [authGuard] },
  { path: 'parametres', loadComponent: () => import('./pages/settings-page/settings-page').then(m => m.SettingsPageComponent), canActivate: [authGuard, structureAdminGuard] },
  { path: 'alerts', loadComponent: () => import('./pages/alerts-page/alerts-page').then(m => m.AlertsPageComponent), canActivate: [authGuard] },
  { path: 'users', loadComponent: () => import('./features/users/users-list').then(m => m.UsersListComponent), canActivate: [structureAdminGuard] },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile-page/profile-page').then(m => m.ProfilePageComponent),
    canActivate: [authGuard]
  },

  // ===== SUPERADMIN (espace isolé) =====
  {
    path: 'superadmin',
    loadComponent: () => import('./superadmin/components/superadmin-layout/superadmin-layout').then(m => m.SuperAdminLayoutComponent),
    canActivate: [superAdminGuard],
    children: [
      { path: '', loadComponent: () => import('./superadmin/pages/superadmin-dashboard/superadmin-dashboard').then(m => m.SuperAdminDashboardComponent) },
      { path: 'structures', loadComponent: () => import('./superadmin/pages/structures/structures-list').then(m => m.StructuresListComponent) },
      { path: 'structures/new', loadComponent: () => import('./superadmin/pages/structures/structure-form').then(m => m.StructureFormComponent) },
      { path: 'structures/:id', loadComponent: () => import('./superadmin/pages/structures/structure-detail').then(m => m.StructureDetailComponent) },
      { path: 'structures/:id/edit', loadComponent: () => import('./superadmin/pages/structures/structure-form').then(m => m.StructureFormComponent) }
    ]
  },

  { path: '**', redirectTo: '/login' }
];