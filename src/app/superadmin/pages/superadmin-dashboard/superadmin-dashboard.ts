import { Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StructureService } from '../../services/structure.service';
import { AuthService, User } from '../../../auth/auth.service';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './superadmin-dashboard.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class SuperAdminDashboardComponent {
  protected stats = computed(() => this.structureService.getStats());
  protected recentStructures = computed(() =>
    this.structureService.getAllStructures().slice(0, 5)
  );

  /** Comptes en attente de validation admin */
  protected pendingUsers = signal<User[]>([]);
  protected feedbackMessage = signal('');

  constructor(
    private structureService: StructureService,
    private authService: AuthService
  ) {
    this.reloadPendingUsers();
  }

  private reloadPendingUsers(): void {
    this.pendingUsers.set(this.authService.getPendingUsers());
  }

  /** Valider un compte : l'utilisateur pourra se connecter */
  validerCompte(user: User): void {
    this.authService.validerCompte(user.id);
    this.feedbackMessage.set(`Le compte « ${user.name} » a été validé avec succès.`);
    this.reloadPendingUsers();
    setTimeout(() => this.feedbackMessage.set(''), 4000);
  }

  /** Rejeter un compte : suppression définitive */
  rejeterCompte(user: User): void {
    this.authService.rejeterCompte(user.id);
    this.feedbackMessage.set(`Le compte « ${user.name} » a été rejeté.`);
    this.reloadPendingUsers();
    setTimeout(() => this.feedbackMessage.set(''), 4000);
  }
}