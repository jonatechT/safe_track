import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { StructureService } from '../../services/structure.service';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../auth/auth.service';

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
  protected pendingUsers = computed(() =>
    this.usersService.getAllUsers().filter(u => u.statut === 'PENDING')
  );
  protected feedbackMessage = signal('');

  constructor(
    private structureService: StructureService,
    private usersService: UsersService
  ) {}

  protected validerCompte(user: User): void {
    this.usersService.updateUser(user.id, { statut: 'ACTIVE' });
    this.feedbackMessage.set(`Le compte de « ${user.name} » a été validé avec succès.`);
    setTimeout(() => this.feedbackMessage.set(''), 4000);
  }

  protected rejeterCompte(user: User): void {
    this.usersService.deleteUser(user.id);
    this.feedbackMessage.set(`Le compte de « ${user.name} » a été rejeté.`);
    setTimeout(() => this.feedbackMessage.set(''), 4000);
  }
}
