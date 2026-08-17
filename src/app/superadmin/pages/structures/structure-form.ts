import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Structure, StructureStatus } from '../../models/structure.model';
import { StructureService } from '../../services/structure.service';
import { AuthService, User } from '../../../auth/auth.service';

@Component({
  selector: 'app-structure-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './structure-form.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class StructureFormComponent implements OnInit {
  protected isEditMode = false;
  protected structureId = '';
  protected isSaving = signal(false);
  protected message = signal('');
  protected messageType = signal<'success' | 'error'>('success');

  protected formData: {
    nom: string;
    code: string;
    description: string;
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    pays: string;
    statut: StructureStatus;
    adminNom: string;
    adminEmail: string;
    adminTelephone: string;
    adminMotDePasse: string;
  } = {
    nom: '',
    code: '',
    description: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: '',
    statut: 'ACTIVE',
    adminNom: '',
    adminEmail: '',
    adminTelephone: '',
    adminMotDePasse: ''
  };

  constructor(
    private structureService: StructureService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.structureId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.structureId;

    if (this.isEditMode) {
      const s = this.structureService.getStructure(this.structureId);
      if (s) {
        this.formData = {
          nom: s.nom,
          code: s.code,
          description: s.description,
          email: s.email,
          telephone: s.telephone,
          adresse: s.adresse,
          ville: s.ville,
          pays: s.pays,
          statut: s.statut,
          adminNom: s.adminNom || '',
          adminEmail: s.adminEmail || '',
          adminTelephone: s.adminTelephone || '',
          adminMotDePasse: ''
        };
      } else {
        this.message.set('Structure introuvable.');
        this.messageType.set('error');
      }
    }
  }

  protected onSubmit(): void {
    this.message.set('');
    this.isSaving.set(true);

    // Validation
    if (!this.formData.nom.trim() || !this.formData.code.trim() || !this.formData.email.trim()) {
      this.message.set('Veuillez remplir tous les champs obligatoires (*).');
      this.messageType.set('error');
      this.isSaving.set(false);
      return;
    }

    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      this.message.set('Veuillez saisir un email valide.');
      this.messageType.set('error');
      this.isSaving.set(false);
      return;
    }

    if (this.formData.adminEmail && !this.isValidEmail(this.formData.adminEmail)) {
      this.message.set('Veuillez saisir un email valide pour l\'administrateur.');
      this.messageType.set('error');
      this.isSaving.set(false);
      return;
    }

    if (this.formData.adminMotDePasse && this.formData.adminMotDePasse.length < 8) {
      this.message.set('Le mot de passe temporaire doit contenir au moins 8 caractères.');
      this.messageType.set('error');
      this.isSaving.set(false);
      return;
    }

    setTimeout(() => {
      if (this.isEditMode) {
        const updated = this.structureService.updateStructure(this.structureId, {
          nom: this.formData.nom,
          code: this.formData.code,
          description: this.formData.description,
          email: this.formData.email,
          telephone: this.formData.telephone,
          adresse: this.formData.adresse,
          ville: this.formData.ville,
          pays: this.formData.pays,
          statut: this.formData.statut
        });
        if (updated) {
          this.message.set(`La structure « ${updated.nom} » a été modifiée avec succès.`);
          this.messageType.set('success');
          setTimeout(() => {
            this.router.navigate(['/superadmin/structures', this.structureId]);
          }, 1500);
        } else {
          this.message.set('Une erreur est survenue lors de la modification.');
          this.messageType.set('error');
        }
      } else {
        const created = this.structureService.createStructure({
          nom: this.formData.nom,
          code: this.formData.code,
          description: this.formData.description,
          email: this.formData.email,
          telephone: this.formData.telephone,
          adresse: this.formData.adresse,
          ville: this.formData.ville,
          pays: this.formData.pays,
          statut: this.formData.statut,
          adminNom: this.formData.adminNom || undefined,
          adminEmail: this.formData.adminEmail || undefined,
          adminTelephone: this.formData.adminTelephone || undefined
        });

        // Créer l'administrateur de structure si renseigné
        if (this.formData.adminNom && this.formData.adminEmail && this.formData.adminMotDePasse) {
          const adminUser: User = {
            id: Date.now(),
            name: this.formData.adminNom,
            email: this.formData.adminEmail.toLowerCase(),
            role: 'ADMIN_STRUCTURE',
            structureId: created.id
          };
          this.authService.registerUser(adminUser);
        }

        this.message.set(`La structure « ${created.nom} » a été créée avec succès.`);
        this.messageType.set('success');
        setTimeout(() => {
          this.router.navigate(['/superadmin/structures']);
        }, 1500);
      }
      this.isSaving.set(false);
    }, 500);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}