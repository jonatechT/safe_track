import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { superAdminGuard } from './superadmin/guards/superadmin.guard';
import { structureAdminGuard } from './guards/structure-admin.guard';

export interface StatCardData {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface TableRowData {
  [key: string]: string;
}

export interface PageData {
  title: string;
  subtitle: string;
  icon: string;
  statCards?: StatCardData[];
  showMap?: boolean;
  tableHeaders?: string[];
  tableRows?: TableRowData[];
}

export const pageData: Record<string, PageData> = {
  location: {
    title: 'Localisation',
    subtitle: 'Suivi en temps réel de vos équipements sur la carte.',
    icon: 'fa-solid fa-location-dot',
    statCards: [
      { label: 'Équipements localisés', value: '1248', icon: 'fa-solid fa-cube', color: '#3B82F6', bgColor: '#EFF6FF' },
      { label: 'Hors ligne', value: '225', icon: 'fa-solid fa-wifi', color: '#EF4444', bgColor: '#FEF2F2' },
      { label: 'En ligne', value: '1023', icon: 'fa-solid fa-wifi', color: '#10B981', bgColor: '#ECFDF5' }
    ],
    showMap: false,
    tableHeaders: ['Statut', 'Équipement', 'IMEI', 'Localisation', 'Dernière synchro'],
    tableRows: [
      { 'Statut': '⚠️ En alerte', 'Équipement': 'Kit solaire #SK-045', 'IMEI': '354123456789012', 'Localisation': '12.3685° N, -1.5250° E', 'LienLocalisation': '12.3685,-1.5250', 'Dernière synchro': 'Il y a 5 min' },
      { 'Statut': '⚠️ En alerte', 'Équipement': 'Véhicule #V-007', 'IMEI': '354123456789014', 'Localisation': '11.1784° N, -4.2979° E', 'LienLocalisation': '11.1784,-4.2979', 'Dernière synchro': 'Il y a 3 h' },
      { 'Statut': '🔍 Inspection', 'Équipement': 'Kit solaire #SK-089', 'IMEI': '354123456789015', 'Localisation': '12.2513° N, -2.3510° E', 'LienLocalisation': '12.2513,-2.3510', 'Dernière synchro': 'Il y a 1 h' },
      { 'Statut': '🔍 Inspection', 'Équipement': 'Engin minier #EM-034', 'IMEI': '354123456789016', 'Localisation': '12.3714° N, -1.5197° E', 'LienLocalisation': '12.3714,-1.5197', 'Dernière synchro': 'Il y a 8 min' },
      { 'Statut': '✅ Normal', 'Équipement': 'Kit solaire #SK-012', 'IMEI': '354123456789017', 'Localisation': '12.3658° N, -1.5312° E', 'LienLocalisation': '12.3658,-1.5312', 'Dernière synchro': 'Il y a 2 min' },
      { 'Statut': '✅ Normal', 'Équipement': 'Véhicule #V-015', 'IMEI': '354123456789018', 'Localisation': '12.4500° N, -3.4700° E', 'LienLocalisation': '12.4500,-3.4700', 'Dernière synchro': 'Il y a 15 min' },
      { 'Statut': '✅ Normal', 'Équipement': 'Engin minier #EM-056', 'IMEI': '354123456789019', 'Localisation': '12.5200° N, -4.1200° E', 'LienLocalisation': '12.5200,-4.1200', 'Dernière synchro': 'Il y a 22 min' }
    ]
  },
  maintenance: {
    title: 'Maintenance',
    subtitle: 'Planification et suivi des interventions de maintenance.',
    icon: 'fa-solid fa-wrench',
    statCards: [
      { label: 'À planifier', value: '24', icon: 'fa-solid fa-calendar-plus', color: '#F59E0B', bgColor: '#FFFBEB' },
      { label: 'En cours', value: '8', icon: 'fa-solid fa-spinner', color: '#3B82F6', bgColor: '#EFF6FF' },
      { label: 'Terminées', value: '156', icon: 'fa-solid fa-check-circle', color: '#10B981', bgColor: '#ECFDF5' },
      { label: 'Alertes actives', value: '3', icon: 'fa-solid fa-bell', color: '#EF4444', bgColor: '#FEF2F2' }
    ],
    tableHeaders: ['Équipement', 'Type', 'Date prévue', 'Technicien', 'Statut', 'Alertes'],
    tableRows: [
      { 'Équipement': 'Kit solaire #SK-045', 'Type': 'Nettoyage panneaux', 'Date prévue': '12 mai 2024', 'Technicien': 'M. Ouedraogo', 'Statut': 'Planifiée', 'Alertes': '1 active', 'alertes': '1' },
      { 'Équipement': 'Engin minier #EM-012', 'Type': 'Remplacement batterie', 'Date prévue': '15 mai 2024', 'Technicien': 'M. Traore', 'Statut': 'En cours', 'Alertes': 'Pris par M. Traore', 'alertes': '2' },
      { 'Équipement': 'Véhicule #V-007', 'Type': 'Vidange moteur', 'Date prévue': '18 mai 2024', 'Technicien': 'M. Sanogo', 'Statut': 'Planifiée', 'Alertes': 'Aucune', 'alertes': '0' }
    ]
  },
  alerts: {
    title: 'Alertes',
    subtitle: 'Toutes les alertes et notifications de votre parc.',
    icon: 'fa-solid fa-bell',
    statCards: [
      { label: 'Critiques', value: '12', icon: 'fa-solid fa-circle-exclamation', color: '#EF4444', bgColor: '#FEF2F2' },
      { label: 'Avertissements', value: '20', icon: 'fa-solid fa-triangle-exclamation', color: '#F59E0B', bgColor: '#FFFBEB' },
      { label: 'Résolues', value: '87', icon: 'fa-solid fa-check-circle', color: '#10B981', bgColor: '#ECFDF5' }
    ],
    tableHeaders: ['Type', 'Équipement', 'Sévérité', 'Date', 'Statut'],
    tableRows: [
      { 'Type': 'Violation de box', 'Équipement': 'Kit solaire #SK-045', 'Sévérité': 'Critique', 'Date': 'Il y a 5 min', 'Statut': 'Ouverte' },
      { 'Type': 'Déplacement non autorisé', 'Équipement': 'Véhicule #V-007', 'Sévérité': 'Avertissement', 'Date': 'Il y a 12 min', 'Statut': 'Ouverte' },
      { 'Type': 'Anomalie de batterie', 'Équipement': 'Engin minier #EM-012', 'Sévérité': 'Avertissement', 'Date': 'Il y a 28 min', 'Statut': 'En cours' },
      { 'Type': 'Maintenance préventive due', 'Équipement': 'Kit solaire #SK-089', 'Sévérité': 'Info', 'Date': 'Il y a 1 h', 'Statut': 'Résolue' }
    ]
  },
  users: {
    title: 'Utilisateurs',
    subtitle: 'Gestion des comptes utilisateurs et de leurs permissions.',
    icon: 'fa-solid fa-users',
    statCards: [
      { label: 'Total utilisateurs', value: '48', icon: 'fa-solid fa-user', color: '#3B82F6', bgColor: '#EFF6FF' },
      { label: 'Administrateurs', value: '5', icon: 'fa-solid fa-crown', color: '#F59E0B', bgColor: '#FFFBEB' },
      { label: 'Opérateurs', value: '43', icon: 'fa-solid fa-user', color: '#10B981', bgColor: '#ECFDF5' }
    ],
    tableHeaders: ['Nom', 'Email', 'Rôle', 'Statut', 'Dernière connexion'],
    tableRows: [
      { 'Nom': 'Super Admin', 'Email': 'admin@safe-track.com', 'Rôle': 'Administrateur', 'Statut': 'Actif', 'Dernière connexion': 'Il y a 5 min' },
      { 'Nom': 'M. Ouedraogo', 'Email': 'mamadou@safe-track.com', 'Rôle': 'Opérateur', 'Statut': 'Actif', 'Dernière connexion': 'Il y a 1 h' },
      { 'Nom': 'Mme. Traore', 'Email': 'fatoumata@safe-track.com', 'Rôle': 'Opérateur', 'Statut': 'Actif', 'Dernière connexion': 'Il y a 3 h' }
    ]
  },
};

export const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'location', loadComponent: () => import('./pages/generic-page/generic-page').then(m => m.GenericPageComponent), data: pageData['location'], canActivate: [authGuard] },
  { path: 'maintenance', loadComponent: () => import('./pages/maintenance-page/maintenance-page').then(m => m.MaintenancePageComponent), canActivate: [authGuard] },
  { path: 'alerts', loadComponent: () => import('./pages/generic-page/generic-page').then(m => m.GenericPageComponent), data: pageData['alerts'], canActivate: [authGuard] },
  { path: 'users', loadComponent: () => import('./features/users/users-list').then(m => m.UsersListComponent), canActivate: [structureAdminGuard] },
  { path: 'profile', redirectTo: '/dashboard', pathMatch: 'full' },

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