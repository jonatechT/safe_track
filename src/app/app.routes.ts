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
  progress?: number;
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
    title: "Parc d'équipement",
    subtitle: 'Suivi en temps réel de vos équipements sur la carte.',
    icon: 'fa-solid fa-location-dot',
    statCards: [
      { label: 'Équipements localisés', value: '100', icon: 'fa-solid fa-cube', color: '#3B82F6', bgColor: '#DBEAFE', progress: 100 },
      { label: 'Hors ligne', value: '18', icon: 'fa-solid fa-wifi', color: '#EF4444', bgColor: '#FEE2E2', progress: 18 },
      { label: 'En ligne', value: '82', icon: 'fa-solid fa-wifi', color: '#10B981', bgColor: '#D1FAE5', progress: 82 }
    ],
    showMap: false,
    tableHeaders: ['Équipement', 'IMEI', 'Localisation', 'Mise en ligne'],
    tableRows: [
      { 'Statut': 'En alerte', 'Équipement': 'Kit solaire #SK-045', 'IMEI': '354123456789012', 'Localisation': '12.3685°N, -1.5250°E', 'LienLocalisation': '12.3685,-1.5250', 'Mise en ligne': '14 mars 2024' },
      { 'Statut': 'En alerte', 'Équipement': 'Véhicule #V-007', 'IMEI': '354123456789014', 'Localisation': '11.1784°N, -4.2979°E', 'LienLocalisation': '11.1784,-4.2979', 'Mise en ligne': '22 janvier 2024' },
      { 'Statut': 'Inspection', 'Équipement': 'Kit solaire #SK-089', 'IMEI': '354123456789015', 'Localisation': '12.2513°N, -2.3510°E', 'LienLocalisation': '12.2513,-2.3510', 'Mise en ligne': '5 juin 2024' },
      { 'Statut': 'Inspection', 'Équipement': 'Engin minier #EM-034', 'IMEI': '354123456789016', 'Localisation': '12.3714°N, -1.5197°E', 'LienLocalisation': '12.3714,-1.5197', 'Mise en ligne': '18 septembre 2023' }
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
      { label: 'Critiques', value: '1', icon: 'fa-solid fa-circle-exclamation', color: '#EF4444', bgColor: '#FEE2E2', progress: 50 },
      { label: 'Avertissements', value: '1', icon: 'fa-solid fa-triangle-exclamation', color: '#F59E0B', bgColor: '#FEF3C7', progress: 50 },
      { label: 'Résolues', value: '0', icon: 'fa-solid fa-check-circle', color: '#10B981', bgColor: '#D1FAE5', progress: 0 }
    ],
    tableHeaders: ['Type', 'Équipement', 'Sévérité', 'Date', 'Statut', 'Technicien', 'Action'],
    tableRows: [
      { 'Type': 'Violation de box', 'Équipement': 'Kit solaire #SK-045', 'Localisation': '12.3685°N, -1.5250°E', 'LienLocalisation': '12.3685,-1.5250', 'Sévérité': 'Critique', 'Date': 'Il y a 5 min', 'Statut': 'Ouverte', 'Technicien': '', 'Action': 'Prendre' },
      { 'Type': 'Déplacement non autorisé', 'Équipement': 'Véhicule #V-007', 'Localisation': '11.1784°N, -4.2979°E', 'LienLocalisation': '11.1784,-4.2979', 'Sévérité': 'Avertissement', 'Date': 'Il y a 12 min', 'Statut': 'Ouverte', 'Technicien': '', 'Action': 'Prendre' }
    ]
  },
  users: {
    title: 'Techniciens',
    subtitle: 'Gestion des comptes techniciens et de leurs permissions.',
    icon: 'fa-solid fa-users',
    statCards: [
      { label: 'Total techniciens', value: '48', icon: 'fa-solid fa-user', color: '#3B82F6', bgColor: '#EFF6FF' },
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
  { path: 'pending', loadComponent: () => import('./auth/pending/pending').then(m => m.PendingComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'location', loadComponent: () => import('./pages/equipment-list-page/equipment-list-page').then(m => m.EquipmentListPageComponent), canActivate: [authGuard] },
  {
    path: 'location/en-ligne',
    loadComponent: () => import('./pages/equipment-list-page/equipment-list-page').then(m => m.EquipmentListPageComponent),
    data: { enLigne: true },
    canActivate: [authGuard]
  },
  { path: 'equipements/nouveau', loadComponent: () => import('./pages/equipment-form-page/equipment-form-page').then(m => m.EquipmentFormPageComponent), canActivate: [authGuard] },
  { path: 'equipements/:imei', loadComponent: () => import('./pages/equipment-detail-page/equipment-detail-page').then(m => m.EquipmentDetailPageComponent), canActivate: [authGuard] },
  { path: 'maintenance', loadComponent: () => import('./pages/maintenance-page/maintenance-page').then(m => m.MaintenancePageComponent), canActivate: [authGuard] },
  { path: 'rapports', loadComponent: () => import('./pages/rapports-page/rapports-page').then(m => m.RapportsPageComponent), canActivate: [authGuard] },
  { path: 'alerts', loadComponent: () => import('./pages/generic-page/generic-page').then(m => m.GenericPageComponent), data: pageData['alerts'], canActivate: [authGuard] },
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