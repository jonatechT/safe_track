import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { User } from './auth/auth.service';

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

  protected readonly menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'fa-solid fa-chart-pie', route: '/dashboard', active: true },
    { label: 'Localisation', icon: 'fa-solid fa-location-dot', route: '/location' },
    { label: 'Maintenance', icon: 'fa-solid fa-wrench', route: '/maintenance' },
    { label: 'Alertes', icon: 'fa-solid fa-bell', route: '/alerts' },
    { label: 'Rapports', icon: 'fa-solid fa-file-lines', route: '/reports' },
    { label: 'Utilisateurs', icon: 'fa-solid fa-users', route: '/users' },
    { label: 'Paramètres', icon: 'fa-solid fa-gear', route: '/settings' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  protected isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }

  protected get currentUser(): User | null {
    return this.authService.getUser();
  }
}
