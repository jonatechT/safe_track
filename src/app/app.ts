// Deployed to GitHub Pages at https://jonatecht.github.io/safe_track/
import { Component, signal } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { User } from './auth/auth.service';
import { StructureService } from './superadmin/services/structure.service';
import { MaintenanceService, NotificationItem } from './services/maintenance.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [NgIf, DatePipe, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SAFE Track');

  private readonly SIDEBAR_STATE_KEY = 'safe_track_sidebar_collapsed';

  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  showLogoutConfirm = false;
  showProfile = false;
  showNotifications = false;

  protected readonly menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'fa-solid fa-chart-pie', route: '/dashboard', active: true },
    { label: 'Localisation', icon: 'fa-solid fa-location-dot', route: '/location' },
    { label: 'Maintenance', icon: 'fa-solid fa-wrench', route: '/maintenance' },
    { label: 'Alertes', icon: 'fa-solid fa-bell', route: '/alerts' },
    { label: 'Techniciens', icon: 'fa-solid fa-users', route: '/users' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private structureService: StructureService,
    private maintenanceService: MaintenanceService
  ) {
    this.isSidebarCollapsed = this.loadSidebarState();
  }

  protected isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }

  protected isSuperAdminPage(): boolean {
    const url = this.router.url;
    return url.startsWith('/superadmin');
  }

  /** Tableau de bord + pages métier toujours visibles */
  protected get visibleMenuItems(): MenuItem[] {
    const role = this.authService.getUser()?.role;
    // ADMIN_STRUCTURE a accès aux techniciens de sa structure
    if (role === 'ADMIN_STRUCTURE') {
      return this.menuItems;
    }
    // TECHNICIEN/USER ne voit jamais "Techniciens"
    return this.menuItems.filter(item => item.route !== '/users');
  }

  protected get currentUser(): User | null {
    return this.authService.getUser();
  }

  protected get currentStructureName(): string {
    const structureId = this.authService.structureId;
    if (!structureId) return this.currentUser?.name || 'Utilisateur';
    const structure = this.structureService.getStructure(structureId);
    return structure?.nom || this.currentUser?.name || 'Utilisateur';
  }

  protected get currentUserName(): string {
    return this.currentUser?.name || 'Utilisateur';
  }

  protected get currentUserEmail(): string {
    return this.currentUser?.email || '';
  }

  protected get currentUserPhone(): string {
    return this.currentUser?.telephone || 'Non renseigné';
  }

  protected get currentUserRole(): string {
    return this.currentUser?.role || '';
  }

  protected get currentUserStructureId(): string {
    return this.currentUser?.structureId || '';
  }

  protected get currentUserStatut(): string {
    return this.currentUser?.statut || '';
  }

  protected get currentUserDateCreation(): string {
    return this.currentUser?.dateCreation || '';
  }

  protected get sidebarToggleLabel(): string {
    return this.isSidebarCollapsed ? 'Développer le menu' : 'Réduire le menu';
  }

  protected toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.saveSidebarState();
  }

  private loadSidebarState(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.SIDEBAR_STATE_KEY) === 'true';
    }
    return false;
  }

  private saveSidebarState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SIDEBAR_STATE_KEY, String(this.isSidebarCollapsed));
    }
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  protected openProfile(): void {
    this.showProfile = true;
  }

  protected closeProfile(): void {
    this.showProfile = false;
  }

  protected openLogoutConfirm(): void {
    this.showProfile = false;
    this.showLogoutConfirm = true;
  }

  protected cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  protected confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected get notifications(): NotificationItem[] {
    return this.maintenanceService.notifications();
  }

  protected get unreadNotificationsCount(): number {
    return this.maintenanceService.notifications().filter(n => !n.read).length;
  }

  protected isAdmin(): boolean {
    return this.authService.isStructureAdmin() || this.authService.isSuperAdmin();
  }

  protected toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.markAllNotificationsRead();
    }
  }

  protected closeNotifications(): void {
    this.showNotifications = false;
  }

  protected markAllNotificationsRead(): void {
    const notifs = this.maintenanceService.notifications().map(n => ({ ...n, read: true }));
    this.maintenanceService.notifications.set(notifs);
  }

  protected validerAlerte(item: any): void {
    this.maintenanceService.validerAlerte(item.id);
    this.router.navigate(['/maintenance']);
  }
}
