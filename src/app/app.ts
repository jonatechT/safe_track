// Deployed to GitHub Pages at https://jonatecht.github.io/safe_track/
import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { User } from './auth/auth.service';
import { StructureService } from './superadmin/services/structure.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SAFE Track');

  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  showLogoutConfirm = false;

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
    private structureService: StructureService
  ) {}

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

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  protected openLogoutConfirm(): void {
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
}