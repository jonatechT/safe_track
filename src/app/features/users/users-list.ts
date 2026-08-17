import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../auth/auth.service';
import { UsersService } from '../../services/users.service';
import { StructureService } from '../../superadmin/services/structure.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './users-list.html',
  styles: [`
    .users-page { display: flex; flex-direction: column; gap: 24px; }
    .users-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .users-title { font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
    .users-subtitle { font-size: 14px; color: #64748B; margin-top: 4px; }
    .users-btn-primary { background: #1E3A8A; color: #FFF; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2); }
    .users-btn-primary:hover { background: #1E40AF; transform: translateY(-1px); }
    .users-btn-secondary { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .users-btn-secondary:hover { background: #E2E8F0; }
    .users-btn-danger { background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .users-btn-danger:hover { background: #FEE2E2; }
    .users-btn-icon { width: 32px; height: 32px; border-radius: 8px; background: #F1F5F9; color: #475569; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s ease; }
    .users-btn-icon:hover { background: #E2E8F0; color: #1E3A8A; }
    .users-icon-warning:hover { background: #FFFBEB; color: #F59E0B; }
    .users-alert { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 20px; }
    .users-alert-success { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
    .users-alert-error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
    .users-card { background: #FFF; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04); }
    .users-card-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 16px; }
    .users-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .users-form-group { display: flex; flex-direction: column; gap: 6px; }
    .users-form-label { font-size: 12px; font-weight: 600; color: #475569; }
    .users-form-input { padding: 10px 14px; border: 1px solid #E2E8F0; border-radius: 10px; font-size: 13px; color: #0F172A; background: #FFF; outline: none; transition: all 0.2s ease; font-family: 'Inter', sans-serif; }
    .users-form-input:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }
    .users-form-select { padding: 10px 14px; border: 1px solid #E2E8F0; border-radius: 10px; font-size: 13px; color: #0F172A; background: #FFF; outline: none; cursor: pointer; font-family: 'Inter', sans-serif; }
    .users-form-select:focus { border-color: #1E3A8A; }
    .users-form-info { font-size: 12px; color: #94A3B8; margin-top: 8px; }
    .users-form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #F1F5F9; }
    .users-table-wrapper { overflow-x: auto; }
    .users-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .users-table th { text-align: left; padding: 12px 14px; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #EDF2F7; background: #F8FAFC; white-space: nowrap; }
    .users-table td { padding: 14px; border-bottom: 1px solid #F1F5F9; color: #334155; vertical-align: middle; }
    .users-table tbody tr:hover { background: #F8FAFC; }
    .users-cell-main { display: flex; align-items: center; gap: 10px; }
    .users-cell-avatar { width: 36px; height: 36px; border-radius: 10px; background: #EFF6FF; color: #3B82F6; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .users-cell-name { font-weight: 600; color: #0F172A; }
    .users-cell-sub { font-size: 11px; color: #94A3B8; }
    .users-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .users-badge i { font-size: 6px; }
    .users-badge-active { background: #ECFDF5; color: #10B981; }
    .users-badge-inactive { background: #FEF2F2; color: #EF4444; }
    .users-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; color: #94A3B8; }
    .users-empty-icon { font-size: 36px; color: #CBD5E1; }
    .users-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .users-modal { background: #FFF; border-radius: 16px; padding: 24px; width: 90%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2); }
    .users-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .users-modal-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .users-modal-icon-warning { background: #FFFBEB; color: #F59E0B; }
    .users-modal-title { font-size: 16px; font-weight: 700; color: #0F172A; }
    .users-modal-body { font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 20px; }
    .users-modal-actions { display: flex; justify-content: flex-end; gap: 12px; }

    @media (max-width: 1024px) {
      .users-table-wrapper { overflow-x: auto; }
    }

    @media (max-width: 768px) {
      .users-header { flex-direction: column; align-items: flex-start; }
      .users-form-grid { grid-template-columns: 1fr; }
      .users-form-actions { flex-direction: column-reverse; }
      .users-form-actions button { width: 100%; justify-content: center; }
      .users-card { padding: 16px; }
      .users-table { font-size: 12px; }
      .users-table th, .users-table td { padding: 10px 12px; }
      .users-modal { padding: 16px; }
    }
  `]
})
export class UsersListComponent {
  protected showForm = signal(false);
  protected message = signal('');
  protected messageType = signal<'success' | 'error'>('success');
  protected showConfirmModal = signal(false);
  protected selectedUser = signal<User | null>(null);

  protected formData: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    motDePasse: string;
    statut: 'ACTIVE' | 'INACTIVE';
  } = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    statut: 'ACTIVE'
  };

  protected users = computed(() => {
    const structureId = this.authService.structureId;
    if (!structureId) return [];
    return this.usersService.getUsersByStructure(structureId);
  });

  protected structureName = computed(() => {
    const structureId = this.authService.structureId;
    if (!structureId) return '—';
    const structure = this.structureService.getStructure(structureId);
    return structure?.nom || structureId;
  });

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private structureService: StructureService
  ) {}

  protected toggleForm(): void {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  protected createUser(): void {
    this.message.set('');
    const fullName = `${this.formData.prenom} ${this.formData.nom}`.trim();
    if (!this.formData.nom.trim() || !this.formData.prenom.trim() || !this.formData.email.trim()) {
      this.message.set('Veuillez remplir tous les champs obligatoires (*).');
      this.messageType.set('error');
      return;
    }
    if (this.formData.motDePasse.length < 8) {
      this.message.set('Le mot de passe doit contenir au moins 8 caractères.');
      this.messageType.set('error');
      return;
    }
    const structureId = this.authService.structureId;
    if (!structureId) {
      this.message.set('Structure introuvable.');
      this.messageType.set('error');
      return;
    }
    const newUser: User = {
      id: Date.now(),
      name: fullName,
      email: this.formData.email.toLowerCase(),
      role: 'USER',
      structureId,
      statut: this.formData.statut,
      telephone: this.formData.telephone || undefined,
      dateCreation: new Date().toISOString()
    };
    this.usersService.createUser(newUser);
    this.message.set(`L'utilisateur « ${fullName} » a été créé avec succès.`);
    this.messageType.set('success');
    this.toggleForm();
    setTimeout(() => this.message.set(''), 4000);
  }

  protected confirmToggleStatus(user: User): void {
    this.selectedUser.set(user);
    this.showConfirmModal.set(true);
  }

  protected cancelModal(): void {
    this.showConfirmModal.set(false);
    this.selectedUser.set(null);
  }

  protected confirmToggle(): void {
    const u = this.selectedUser();
    if (!u) return;
    const updated = this.usersService.toggleStatus(u.id);
    if (updated) {
      const action = updated.statut === 'ACTIVE' ? 'activé' : 'désactivé';
      this.message.set(`L'utilisateur « ${updated.name} » a été ${action} avec succès.`);
      this.messageType.set('success');
      setTimeout(() => this.message.set(''), 4000);
    }
    this.cancelModal();
  }

  private resetForm(): void {
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      motDePasse: '',
      statut: 'ACTIVE'
    };
  }
}