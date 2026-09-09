import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StructureService } from '../../services/structure.service';
import { AuthService, User } from '../../../auth/auth.service';

interface StructureForm {
  nom: string;
  code: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  statut: 'ACTIVE' | 'INACTIVE';
  description: string;
  adminNom: string;
  adminEmail: string;
  adminTelephone: string;
  adminMotDePasse: string;
}

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './superadmin-dashboard.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class SuperAdminDashboardComponent {
  protected stats = computed(() => this.structureService.getStats());
  protected recentStructures = computed(() =>
    this.structureService.getAllStructures().slice(0, 5)
  );
  protected feedbackMessage = signal('');

  // Modale « Ajouter une structure »
  protected showCreateModal = signal(false);
  protected step = signal<1 | 2 | 3>(1);
  protected stepError = signal('');
  protected message = signal('');
  protected messageType = signal<'success' | 'error'>('success');
  protected isSaving = signal(false);

  protected form: StructureForm = this.emptyForm();

  constructor(
    private structureService: StructureService,
    private authService: AuthService
  ) {}

  private emptyForm(): StructureForm {
    return {
      nom: '',
      code: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      pays: '',
      statut: 'ACTIVE',
      description: '',
      adminNom: '',
      adminEmail: '',
      adminTelephone: '',
      adminMotDePasse: ''
    };
  }

  protected openCreateModal(): void {
    this.form = this.emptyForm();
    this.step.set(1);
    this.stepError.set('');
    this.message.set('');
    this.isSaving.set(false);
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.stepError.set('');
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  protected nextStep(): void {
    this.stepError.set('');
    this.message.set('');

    const s = this.step();
    if (s === 1) {
      const f = this.form;
      if (!f.nom.trim()) { this.stepError.set('Le nom de la structure est obligatoire.'); return; }
      if (!f.code.trim()) { this.stepError.set('Le code / identifiant unique est obligatoire.'); return; }
      if (!f.email.trim() || !this.isValidEmail(f.email)) { this.stepError.set('Veuillez saisir un email valide pour la structure.'); return; }
      if (!f.ville.trim()) { this.stepError.set('La ville est obligatoire.'); return; }
      if (!f.pays.trim()) { this.stepError.set('Le pays est obligatoire.'); return; }
      this.step.set(2);
    } else if (s === 2) {
      const f = this.form;
      // Administrateur optionnel : on ne valide que si l'utilisateur a commencé à le remplir
      const adminStarted = f.adminNom.trim() || f.adminEmail.trim() || f.adminTelephone.trim() || f.adminMotDePasse.trim();
      if (adminStarted) {
        if (f.adminEmail && !this.isValidEmail(f.adminEmail)) {
          this.stepError.set("Veuillez saisir un email valide pour l'administrateur.");
          return;
        }
        if (f.adminMotDePasse && f.adminMotDePasse.length < 8) {
          this.stepError.set('Le mot de passe temporaire doit contenir au moins 8 caractères.');
          return;
        }
      }
      this.step.set(3);
    }
  }

  protected prevStep(): void {
    this.stepError.set('');
    this.message.set('');
    if (this.step() > 1) {
      this.step.update(v => (v - 1) as 1 | 2 | 3);
    }
  }

  protected submitCreate(): void {
    this.stepError.set('');
    this.message.set('');
    this.isSaving.set(true);

    const f = this.form;
    setTimeout(() => {
      const created = this.structureService.createStructure({
        nom: f.nom.trim(),
        code: f.code.trim(),
        description: f.description.trim(),
        email: f.email.trim().toLowerCase(),
        telephone: f.telephone.trim(),
        adresse: f.adresse.trim(),
        ville: f.ville.trim(),
        pays: f.pays.trim(),
        statut: f.statut,
        adminNom: f.adminNom.trim() || undefined,
        adminEmail: f.adminEmail.trim().toLowerCase() || undefined,
        adminTelephone: f.adminTelephone.trim() || undefined
      });

      // Créer l'administrateur de structure si renseigné
      if (f.adminNom.trim() && f.adminEmail.trim() && f.adminMotDePasse) {
        const adminUser: User = {
          id: Date.now(),
          name: f.adminNom.trim(),
          email: f.adminEmail.trim().toLowerCase(),
          role: 'ADMIN_STRUCTURE',
          structureId: created.id,
          statut: 'ACTIVE',
          telephone: f.adminTelephone.trim() || undefined,
          dateCreation: new Date().toISOString(),
          motDePasse: f.adminMotDePasse
        };
        this.authService.registerUser(adminUser);
      }

      this.isSaving.set(false);
      this.message.set(`La structure « ${created.nom} » a été créée avec succès.`);
      this.messageType.set('success');

      setTimeout(() => {
        this.closeCreateModal();
        this.feedbackMessage.set(`La structure « ${created.nom} » a été créée avec succès.`);
        setTimeout(() => this.feedbackMessage.set(''), 5000);
      }, 1200);
    }, 500);
  }
}
