import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { EquipmentService, Equipment } from '../../services/equipment.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-equipment-form-page',
  standalone: true,
  imports: [BasePageComponent, FormsModule],
  template: `
    <app-base-page
      title="Ajouter un équipement"
      subtitle="Déclarez l'équipement : la position GPS et les mesures (tension, courant, température) seront transmises automatiquement par l'IoT après la création."
      icon="fa-solid fa-plus"
    >
      <div class="eqf-content">
        @if (message()) {
          <div
            class="eqf-alert"
            [class.eqf-alert--success]="messageType() === 'success'"
            [class.eqf-alert--error]="messageType() === 'error'"
            role="status"
          >
            <i
              class="fa-solid"
              [class.fa-circle-check]="messageType() === 'success'"
              [class.fa-circle-xmark]="messageType() === 'error'"
            ></i>
            <span>{{ message() }}</span>
          </div>
        }

        <div class="eqf-card">
          <form (ngSubmit)="onSubmit()" #eqForm="ngForm" novalidate>
            <div class="eqf-grid">
              <!-- Nom -->
              <div class="eqf-field">
                <label class="eqf-label" for="eq-nom">
                  Nom de l'équipement <span class="eqf-required">*</span>
                </label>
                <input
                  id="eq-nom"
                  name="nom"
                  type="text"
                  class="eqf-input"
                  placeholder="Ex : Kit solaire"
                  [(ngModel)]="nom"
                  required
                />
                @if (submitted() && !nom.trim()) {
                  <span class="eqf-error">Le nom est obligatoire.</span>
                }
              </div>

              <!-- Type / catégorie -->
              <div class="eqf-field">
                <label class="eqf-label" for="eq-type">
                  Type / catégorie <span class="eqf-required">*</span>
                </label>
                <select
                  id="eq-type"
                  name="type"
                  class="eqf-input eqf-select"
                  [(ngModel)]="type"
                  required
                >
                  <option value="" disabled>Sélectionnez un type…</option>
                  <option value="Kit solaire">Kit solaire</option>
                  <option value="Véhicule">Véhicule</option>
                  <option value="Engin minier">Engin minier</option>
                  <option value="Autre">Autre</option>
                </select>
                @if (submitted() && !type) {
                  <span class="eqf-error">Le type est obligatoire.</span>
                }
              </div>

              <!-- IMEI / identifiant IoT -->
              <div class="eqf-field">
                <label class="eqf-label" for="eq-imei">
                  IMEI / identifiant IoT <span class="eqf-required">*</span>
                </label>
                <input
                  id="eq-imei"
                  name="imei"
                  type="text"
                  class="eqf-input"
                  placeholder="Ex : ESP32-001"
                  [(ngModel)]="imei"
                  required
                />
                @if (submitted() && !imei.trim()) {
                  <span class="eqf-error">L'identifiant IoT est obligatoire.</span>
                }
              </div>
              <!-- Mise en ligne -->
              <div class="eqf-field">
                <label class="eqf-label" for="eq-mise">
                  Date de mise en ligne
                </label>
                <input
                  id="eq-mise"
                  name="miseEnLigne"
                  type="date"
                  class="eqf-input"
                  [(ngModel)]="miseEnLigne"
                />
              </div>

              <!-- Description -->
              <div class="eqf-field eqf-field--full">
                <label class="eqf-label" for="eq-description">Description</label>
                <textarea
                  id="eq-description"
                  name="description"
                  class="eqf-input eqf-textarea"
                  placeholder="Ex : Kit solaire principal"
                  [(ngModel)]="description"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="eqf-actions">
              <button
                type="button"
                class="eqf-btn eqf-btn--ghost"
                (click)="annuler()"
              >
                <i class="fa-solid fa-xmark"></i>
                Annuler
              </button>
              <button
                type="submit"
                class="eqf-btn eqf-btn--primary"
                [disabled]="isSubmitting()"
              >
                @if (isSubmitting()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                } @else {
                  <i class="fa-solid fa-plus"></i>
                }
                <span>{{ isSubmitting() ? 'Ajout…' : 'Ajouter' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </app-base-page>
  `,
  styles: [
    `
    .eqf-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }

    /* ===== Bandeau de message ===== */
    .eqf-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
    }
    .eqf-alert i { font-size: 14px; }
    .eqf-alert--success { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .eqf-alert--error { background: #FEF2F2; color: #B91C1C; border: 1px solid #FCA5A5; }

    /* ===== Carte formulaire (fond blanc, propre) ===== */
    .eqf-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04);
      padding: 24px;
      max-width: 960px;
      width: 100%;
      box-sizing: border-box;
    }

    .eqf-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }

    .eqf-field { display: flex; flex-direction: column; gap: 6px; }

    .eqf-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
    }

    .eqf-required { color: #EF4444; }

    .eqf-input {
      padding: 11px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      font-size: 13.5px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .eqf-input:hover { border-color: #BFDBFE; }
    .eqf-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    .eqf-select { cursor: pointer; }

    .eqf-error { color: #DC2626; font-size: 12px; font-weight: 500; }

    .eqf-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #F1F5F9;
    }

    /* ===== Boutons ===== */
    .eqf-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 18px;
      border-radius: 10px;
      border: 1px solid transparent;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .eqf-btn--primary {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .eqf-btn--primary:hover:not(:disabled) {
      background: #1D4ED8;
      transform: translateY(-1px);
    }
    .eqf-btn--ghost {
      background: #FFFFFF;
      color: #475569;
      border-color: #E2E8F0;
    }
    .eqf-btn--ghost:hover { background: #F8FAFC; color: #1E293B; }
    .eqf-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    /* ===== Description pleine largeur ===== */
    .eqf-field--full { grid-column: 1 / -1; }
    .eqf-textarea {
      height: auto;
      min-height: 96px;
      padding: 12px 14px;
      line-height: 1.5;
      resize: vertical;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .eqf-grid { grid-template-columns: 1fr; }
      .eqf-card { padding: 18px; }
      .eqf-actions { flex-direction: column-reverse; }
      .eqf-btn { width: 100%; }
    }
  `
  ]
})
export class EquipmentFormPageComponent {
  nom = '';
  type = '';
  imei = '';
  miseEnLigne = '';
  description = '';

  protected submitted = signal(false);
  protected isSubmitting = signal(false);
  protected message = signal('');
  protected messageType: WritableSignal<'success' | 'error'> = signal<'success' | 'error'>('success');

  constructor(
    private equipmentService: EquipmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set(text);
    this.messageType.set(type);
  }

  /** Seuls SUPERADMIN et ADMIN_STRUCTURE peuvent ajouter un équipement. */
  canAddEquipment(): boolean {
    return this.authService.isSuperAdmin() || this.authService.isStructureAdmin();
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.message.set('');

    // Vérifications locales (chaque champ obligatoire est validé individuellement).
    const imei = this.imei.trim();
    const nom = this.nom.trim();
    if (!imei || !nom || !this.type) {
      this.showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    // L'IMEI doit être unique dans le parc.
    if (this.equipmentService.getByImei(imei)) {
      this.showMessage('Un équipement avec cet IMEI existe déjà dans le parc.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    const miseEnLigne = this.miseEnLigne
      ? new Date(this.miseEnLigne + 'T00:00:00').toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

    // Le technicien déclare uniquement l'équipement. L'état réel — statut,
    // position GPS, tension, courant, température — est transmis
    // automatiquement par l'ESP32/IoT et traité par le backend.
    // L'organisation est déterminée par le backend à partir de l'utilisateur
    // authentifié (aucun champ organisation côté frontend).
    const equipment: Equipment = {
      imei,
      nom,
      statut: 'En ligne', // état initial déclaré — mis à jour ensuite par l'IoT/backend
      localisation: 'En attente du GPS (IoT)',
      lienLocalisation: 'En attente du GPS (IoT)',
      miseEnLigne,
      type: this.type,
      description: this.description.trim(),
      temperature: null,
      tension: null,
      bloque: false
    };

    this.equipmentService.createEquipment(equipment).subscribe((created) => {
      this.isSubmitting.set(false);
      if (created) {
        this.showMessage(`L'équipement « ${created.nom} » a été ajouté avec succès.`, 'success');
        setTimeout(() => this.router.navigate(['/location']), 1200);
      } else {
        this.showMessage(
          this.equipmentService.equipmentCreateError() ?? "Impossible d'ajouter l'équipement.",
          'error'
        );
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/location']);
  }
}