import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-superadmin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="sa-layout">
      <aside class="sa-sidebar">
        <div class="sa-logo">
          <div class="sa-logo-icon">
            <img src="logo.jpg" alt="SAFE Track" class="sa-logo-img" />
          </div>
          <div class="sa-logo-text-block">
            <span class="sa-logo-text">SAFE Track</span>
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
            >
              <i class="sa-nav-icon" [class]="item.icon"></i>
              <span class="sa-nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sa-sidebar-footer">
          <button class="sa-logout-btn" (click)="openLogoutConfirm()" title="Se déconnecter" aria-label="Se déconnecter">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span class="sa-logout-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div class="sa-main">
        <header class="sa-topbar">
          <div class="sa-topbar-title">
            <span>Espace SuperAdmin</span>
          </div>
          <div class="sa-topbar-right">
            <div class="sa-profile">
              <div class="sa-avatar">{{ currentUser?.name?.charAt(0)?.toUpperCase() || 'SA' }}</div>
              <div class="sa-profile-info">
                <span class="sa-profile-name">{{ currentUser?.name || 'Super Admin' }}</span>
                <span class="sa-profile-role">{{ currentUser?.role || 'SUPERADMIN' }}</span>
              </div>
            </div>
            <button class="sa-logout-btn-icon" (click)="openLogoutConfirm()" title="Se déconnecter" aria-label="Se déconnecter">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </header>

        <main class="sa-content">
          <router-outlet />
        </main>
      </div>
    </div>

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
      background: #0B1A2E;
      display: flex; flex-direction: column; padding: 20px 14px;
      box-shadow: 4px 0 24px rgba(11, 26, 46, 0.15);
    }
    .sa-logo { display: flex; align-items: center; gap: 12px; padding: 4px 8px 24px; }
    .sa-logo-icon { width: 48px; height: 48px; border-radius: 14px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); }
    .sa-logo-img { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
    .sa-logo-text-block { display: flex; flex-direction: column; }
    .sa-logo-text { font-size: 20px; font-weight: 800; color: #FFF; line-height: 1.2; }
    .sa-logo-badge { font-size: 10px; font-weight: 700; color: #38BDF8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 8px; display: inline-block; margin-top: 4px; letter-spacing: 0.5px; }

    .sa-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
    .sa-nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; color: #94A3B8; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); outline: none; border: 1px solid transparent; position: relative; overflow: hidden; }
    .sa-nav-item::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(56, 189, 248, 0.08), transparent); opacity: 0; transition: opacity 0.25s ease; pointer-events: none; }
    .sa-nav-item:hover::before { opacity: 1; }
    .sa-nav-item:hover { color: #E2E8F0; transform: translateX(3px); }
    .sa-nav-item.active { background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-weight: 600; border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.2); }
    .sa-nav-item.active::before { opacity: 0; }
    .sa-nav-icon { width: 24px; text-align: center; font-size: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .sa-nav-label { white-space: nowrap; }

    .sa-sidebar-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
    .sa-logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 12px; border: 1px solid transparent; background: rgba(239, 68, 68, 0.15); color: #F87171; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
    .sa-logout-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(239, 68, 68, 0.12), transparent); opacity: 0; transition: opacity 0.25s ease; pointer-events: none; }
    .sa-logout-btn:hover::before { opacity: 1; }
    .sa-logout-btn:hover { background: rgba(239, 68, 68, 0.25); color: #EF4444; border-color: rgba(239, 68, 68, 0.3); transform: translateX(3px); }
    .sa-logout-label { white-space: nowrap; }

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
    .sa-logout-btn-icon { width: 36px; height: 36px; border-radius: 10px; border: none; background: #FEF2F2; color: #EF4444; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .sa-logout-btn-icon:hover { background: #FEE2E2; }
    .sa-profile { display: flex; align-items: center; gap: 10px; }
    .sa-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #1E3A8A, #0B1A2E); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .sa-profile-info { display: flex; flex-direction: column; }
    .sa-profile-name { font-size: 13px; font-weight: 600; color: #0F172A; }
    .sa-profile-role { font-size: 10px; font-weight: 600; color: #38BDF8; letter-spacing: 0.5px; }

    /* Content */
    .sa-content { flex: 1; overflow-y: auto; padding: 24px; }

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
  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/superadmin', exact: true },
    { label: 'Structures', icon: 'fa-solid fa-building', route: '/superadmin/structures', exact: false }
  ];

  isMobileMenuOpen = false;
  showLogoutConfirm = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  protected get currentUser() {
    return this.authService.getUser();
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