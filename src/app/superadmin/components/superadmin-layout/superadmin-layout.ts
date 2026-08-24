import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-superadmin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  template: `
    <div class="sa-layout">
      <aside class="sa-sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="sa-sidebar-header">
          <div class="sa-logo-row">
            <div class="sa-logo-icon">
              <img src="logo.jpg" alt="SAFE Track" class="sa-logo-img" />
            </div>
            <button class="sa-sidebar-toggle" (click)="toggleSidebar()" [attr.aria-label]="sidebarToggleLabel" [attr.title]="sidebarToggleLabel">
              <i class="fa-solid" [class.fa-angles-left]="!isSidebarCollapsed" [class.fa-angles-right]="isSidebarCollapsed"></i>
            </button>
          </div>
          <div class="sa-logo-text-block">
            <span class="sa-logo-text">SHANGO</span>
            <span class="sa-logo-badge">SUPERADMIN</span>
          </div>
        </div>

        <nav class="sa-nav">
          @for (item of menuItems; track item.label) {
            <a
              class="sa-nav-item"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              (click)="closeMobileMenu()"
              [attr.title]="isSidebarCollapsed ? item.label : null"
            >
              <i class="sa-nav-icon" [class]="item.icon"></i>
              <span class="sa-nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sa-sidebar-footer">
          <button class="sa-profile-btn" (click)="openProfile()" title="Profil" aria-label="Profil">
            <i class="fa-solid fa-user"></i>
            <span class="sa-profile-btn-label">Profil</span>
          </button>
        </div>
      </aside>

      <div class="sa-main">
        <header class="sa-topbar">
          <div class="sa-topbar-title">
            <span>Espace SuperAdmin</span>
          </div>
          <div class="sa-topbar-right">
            <div class="sa-profile" (click)="openProfile()" role="button" tabindex="0" (keydown.enter)="openProfile()" aria-label="Ouvrir le profil">
              <div class="sa-avatar">{{ currentUser?.name?.charAt(0)?.toUpperCase() || 'SA' }}</div>
              <div class="sa-profile-info">
                <span class="sa-profile-name">{{ currentUser?.name || 'Super Admin' }}</span>
                <span class="sa-profile-role">{{ currentUser?.role || 'SUPERADMIN' }}</span>
              </div>
            </div>
          </div>
        </header>

        <main class="sa-content">
          <router-outlet />
        </main>
      </div>
    </div>

    @if (showProfile) {
      <div class="sa-profile-overlay" (click)="closeProfile()"></div>
      <div class="sa-profile-panel" role="dialog" aria-label="Profil utilisateur">
        <div class="sa-profile-panel-header">
          <div class="sa-profile-panel-avatar">{{ currentUser?.name?.charAt(0)?.toUpperCase() || 'SA' }}</div>
          <div class="sa-profile-panel-title-block">
            <h3 class="sa-profile-panel-title">Profil</h3>
            <span class="sa-profile-panel-role">{{ currentUser?.role || 'SUPERADMIN' }}</span>
          </div>
          <button class="sa-profile-panel-close" (click)="closeProfile()" aria-label="Fermer le profil">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="sa-profile-panel-body">
          <div class="sa-profile-section">
            <span class="sa-profile-section-title">Informations personnelles</span>
            <div class="sa-profile-field">
              <span class="sa-profile-field-icon"><i class="fa-solid fa-user"></i></span>
              <div class="sa-profile-field-content">
                <span class="sa-profile-field-label">Nom complet</span>
                <span class="sa-profile-field-value">{{ currentUser?.name || 'Non renseigné' }}</span>
              </div>
            </div>
            <div class="sa-profile-field">
              <span class="sa-profile-field-icon"><i class="fa-solid fa-envelope"></i></span>
              <div class="sa-profile-field-content">
                <span class="sa-profile-field-label">Adresse e-mail</span>
                <span class="sa-profile-field-value">{{ currentUser?.email || 'Non renseigné' }}</span>
              </div>
            </div>
            <div class="sa-profile-field">
              <span class="sa-profile-field-icon"><i class="fa-solid fa-phone"></i></span>
              <div class="sa-profile-field-content">
                <span class="sa-profile-field-label">Téléphone</span>
                <span class="sa-profile-field-value">{{ currentUser?.telephone || 'Non renseigné' }}</span>
              </div>
            </div>
          </div>

          <div class="sa-profile-section">
            <span class="sa-profile-section-title">Compte</span>
            @if (currentUser?.statut) {
              <div class="sa-profile-field">
                <span class="sa-profile-field-icon"><i class="fa-solid fa-shield-halved"></i></span>
                <div class="sa-profile-field-content">
                  <span class="sa-profile-field-label">Statut</span>
                  <span class="sa-profile-field-value">
                    <span class="sa-profile-badge" [class.sa-profile-badge-active]="currentUser?.statut === 'ACTIVE'">
                      {{ currentUser?.statut }}
                    </span>
                  </span>
                </div>
              </div>
            }
            @if (currentUser?.dateCreation) {
              <div class="sa-profile-field">
                <span class="sa-profile-field-icon"><i class="fa-solid fa-calendar-days"></i></span>
                <div class="sa-profile-field-content">
                  <span class="sa-profile-field-label">Membre depuis le</span>
                  <span class="sa-profile-field-value">{{ currentUser?.dateCreation | date: 'dd/MM/yyyy' }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="sa-profile-panel-footer">
          <button class="sa-profile-logout-btn" (click)="openLogoutConfirm()" aria-label="Se déconnecter">
            <i class="fa-solid fa-right-from-bracket"></i>
            Se déconnecter
          </button>
        </div>
      </div>
    }

    @if (showLogoutConfirm) {
      <div class="sa-modal-overlay" (click)="cancelLogout()">
        <div class="sa-modal" (click)="$event.stopPropagation()">
          <div class="sa-modal-header">
            <div class="sa-modal-icon sa-modal-icon-danger">
              <i class="fa-solid fa-right-from-bracket"></i>
            </div>
            <h3 class="sa-modal-title">Se déconnecter</h3>
          </div>
          <div class="sa-modal-body">
            Voulez-vous vraiment vous déconnecter ?
          </div>
          <div class="sa-modal-actions">
            <button class="sa-btn-secondary" (click)="cancelLogout()">Annuler</button>
            <button class="sa-btn-danger" (click)="confirmLogout()">
              <i class="fa-solid fa-right-from-bracket"></i> Déconnexion
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .sa-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

    /* Sidebar - identique au sidebar admin */
    .sa-sidebar {
      width: 230px; min-width: 230px;
      background: #1E3A8A;
      display: flex; flex-direction: column; padding: 20px 10px;
      box-shadow: 4px 0 24px rgba(11, 26, 46, 0.15);
      transition: min-width 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .sa-sidebar.collapsed { min-width: 56px; width: 56px; }
    .sa-sidebar-header { display: flex; flex-direction: column; gap: 8px; padding: 0 4px 20px; }
    .sa-logo-row { display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; }
    .sa-sidebar.collapsed .sa-logo-row { justify-content: center; }
    .sa-logo-icon { width: 56px; height: 56px; border-radius: 16px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); }
    .sa-logo-img { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
    .sa-logo-text-block { display: flex; flex-direction: column; }
    .sa-logo-text { font-size: 20px; font-weight: 800; color: #FFF; line-height: 1.2; text-align: center; width: 100%; }
    .sa-logo-badge { font-size: 10px; font-weight: 700; color: #93C5FD; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 8px; display: inline-block; margin-top: 4px; letter-spacing: 0.5px; }
    .sa-sidebar.collapsed .sa-logo-text-block { display: none; }

    .sa-sidebar-toggle {
      position: absolute; right: 0;
      width: 28px; height: 28px; border-radius: 8px; border: none;
      background: rgba(255, 255, 255, 0.08); color: #94A3B8; font-size: 12px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.2s ease;
    }
    .sa-sidebar-toggle:hover { background: rgba(56, 189, 248, 0.2); color: #38BDF8; }
    .sa-sidebar-toggle:focus-visible { outline: 2px solid #38BDF8; outline-offset: 2px; }
    .sa-sidebar.collapsed .sa-logo-icon { display: none; }

    .sa-nav { flex: 1; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
    .sa-nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; color: #E2E8F0; font-size: 15px; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); outline: none; border: 1px solid transparent; position: relative; overflow: hidden; }
    .sa-nav-item::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(56, 189, 248, 0.08), transparent); opacity: 0; transition: opacity 0.25s ease; pointer-events: none; }
    .sa-nav-item:hover::before { opacity: 1; }
    .sa-nav-item:hover { color: #E2E8F0; transform: translateX(3px); }
    .sa-nav-item.active { background: rgba(255, 255, 255, 0.18); color: #FFFFFF; font-weight: 600; border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.2); }
    .sa-nav-item.active::before { opacity: 0; }
    .sa-nav-icon { width: 24px; text-align: center; font-size: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .sa-nav-label { white-space: nowrap; opacity: 1; transition: opacity 0.3s ease; }
    .sa-sidebar.collapsed .sa-nav-label { display: none; }
    .sa-sidebar.collapsed .sa-nav-item { padding: 12px 0; justify-content: center; gap: 0; }

    .sa-sidebar-footer { display: flex; flex-direction: column; align-items: stretch; gap: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
    .sa-profile-btn { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 12px; border: 1px solid transparent; background: rgba(255, 255, 255, 0.12); color: #E2E8F0; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
    .sa-profile-btn i { font-size: 20px; }
    .sa-profile-btn:hover { background: rgba(56, 189, 248, 0.22); color: #7DD3FC; }
    .sa-profile-btn:focus-visible { outline: 2px solid #38BDF8; outline-offset: 2px; }
    .sa-profile-btn-label { white-space: nowrap; opacity: 1; transition: opacity 0.3s ease; }
    .sa-sidebar.collapsed .sa-profile-btn { justify-content: center; padding: 10px 0; gap: 0; }
    .sa-sidebar.collapsed .sa-profile-btn-label { display: none; }

    /* Main area */
    .sa-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #F1F5F9; }

    /* Topbar */
    .sa-topbar {
      height: 64px; background: #FFFFFF; border-bottom: 1px solid #E2E8F0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; box-shadow: 0 1px 4px rgba(15,23,42,0.04);
    }
    .sa-topbar-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #0F172A; }
    .sa-topbar-right { display: flex; align-items: center; gap: 16px; }
    .sa-profile { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 10px; border-radius: 10px; transition: all 0.15s ease; }
    .sa-profile:hover { background: #F1F5F9; }
    .sa-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #1E3A8A, #3B5BDB); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .sa-profile-info { display: flex; flex-direction: column; }
    .sa-profile-name { font-size: 13px; font-weight: 600; color: #0F172A; }
    .sa-profile-role { font-size: 10px; font-weight: 600; color: #93C5FD; letter-spacing: 0.5px; }

    /* Content */
    .sa-content { flex: 1; overflow-y: auto; padding: 24px; }

    /* Profile panel */
    .sa-profile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.5); z-index: 1500; backdrop-filter: blur(2px); }
    .sa-profile-panel { position: fixed; top: 0; right: 0; width: 360px; max-width: 90vw; height: 100vh; background: #FFF; z-index: 1501; box-shadow: -8px 0 32px rgba(15, 23, 42, 0.15); display: flex; flex-direction: column; animation: saProfileSlideIn 0.3s cubic-bezier(0.4,0,0.2,1); }
    @keyframes saProfileSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .sa-profile-panel-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px; border-bottom: 1px solid #E2E8F0; background: linear-gradient(135deg, #1E3A8A, #3B5BDB); }
    .sa-profile-panel-avatar { width: 48px; height: 48px; border-radius: 50%; background: #FFF; color: #1E3A8A; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; flex-shrink: 0; }
    .sa-profile-panel-title-block { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .sa-profile-panel-title { font-size: 16px; font-weight: 700; color: #FFF; margin: 0; }
    .sa-profile-panel-role { font-size: 11px; font-weight: 600; color: #93C5FD; letter-spacing: 0.5px; text-transform: uppercase; }
    .sa-profile-panel-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(255,255,255,0.1); color: #E2E8F0; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; }
    .sa-profile-panel-close:hover { background: rgba(255,255,255,0.2); }
    .sa-profile-panel-close:focus-visible { outline: 2px solid #38BDF8; outline-offset: 2px; }
    .sa-profile-panel-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }
    .sa-profile-section { display: flex; flex-direction: column; gap: 10px; }
    .sa-profile-section-title { font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.8px; padding-bottom: 6px; border-bottom: 1px solid #E2E8F0; }
    .sa-profile-field { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; transition: all 0.2s ease; }
    .sa-profile-field:hover { border-color: #BFDBFE; background: #EFF6FF; }
    .sa-profile-field-icon { width: 34px; height: 34px; border-radius: 10px; background: #EFF6FF; color: #1E3A8A; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .sa-profile-field-content { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .sa-profile-field-label { font-size: 10px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; }
    .sa-profile-field-value { font-size: 14px; font-weight: 500; color: #0F172A; word-break: break-word; }
    .sa-profile-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #FEF2F2; color: #EF4444; }
    .sa-profile-badge-active { background: #ECFDF5; color: #10B981; }
    .sa-profile-panel-footer { padding: 16px 24px; border-top: 1px solid #E2E8F0; }
    .sa-profile-logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px 18px; border-radius: 12px; border: none; background: #EF4444; color: #FFF; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .sa-profile-logout-btn:hover { background: #DC2626; }
    .sa-profile-logout-btn:focus-visible { outline: 2px solid #EF4444; outline-offset: 2px; }

    /* Modal */
    .sa-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
    .sa-modal { background: #FFF; border-radius: 16px; padding: 24px; width: 90%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2); }
    .sa-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .sa-modal-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .sa-modal-icon-danger { background: #FEF2F2; color: #EF4444; }
    .sa-modal-title { font-size: 16px; font-weight: 700; color: #0F172A; }
    .sa-modal-body { font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 20px; }
    .sa-modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .sa-btn-secondary { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .sa-btn-secondary:hover { background: #E2E8F0; }
    .sa-btn-danger { background: #EF4444; color: #FFF; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
    .sa-btn-danger:hover { background: #DC2626; }

    /* Responsive */
    @media (max-width: 768px) {
      .sa-sidebar { display: none; }
      .sa-topbar { padding: 0 16px; }
      .sa-profile-info { display: none; }
      .sa-content { padding: 16px; }
    }
  `]
})
export class SuperAdminLayoutComponent {
  private readonly SIDEBAR_STATE_KEY = 'safe_track_superadmin_sidebar_collapsed';

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/superadmin', exact: true },
    { label: 'Structures', icon: 'fa-solid fa-building', route: '/superadmin/structures', exact: false }
  ];

  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  showLogoutConfirm = false;
  showProfile = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isSidebarCollapsed = this.loadSidebarState();
  }

  protected get currentUser() {
    return this.authService.getUser();
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
}