import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasePageComponent } from '../base-page/base-page';
import { MaintenanceService, MaintenanceItem, RapportIntervention } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-maintenance-page',
  standalone: true,
  imports: [BasePageComponent, FormsModule],
  template: `
    <app-base-page title="Maintenance" subtitle="Planification et suivi des interventions de maintenance." icon="fa-solid fa-wrench">
      <div class="maintenance-content">
        <!-- KPI Cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <span class="stat-label">En cours</span>
            <span class="stat-value">{{ getEnCours() }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Terminées</span>
            <span class="stat-value">{{ getTerminees() }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Alertes actives</span>
            <span class="stat-value">{{ getAlertesActives() }}</span>
          </div>
        </div>

        <!-- Tableau des maintenances -->
        <div class="table-card">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items; track item.id) {
                  <tr>
                    <td>
                      <div class="equipment-cell">
                        <span class="equipment-name">{{ item.equipment }}</span>
                      </div>
                    </td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.datePrevue }}</td>
                    <td>
                      @if (item.alertes > 0 && !item.prisPar) {
                        <button class="btn-prendre" (click)="prendreAlerte(item)">
                          <i class="fa-solid fa-hand"></i> Prendre l'alerte
                        </button>
                      } @else if (item.statut === 'En attente' && item.prisPar) {
                        <div class="waiting-actions">
                          <span class="waiting-label">
                            <i class="fa-solid fa-clock"></i> Demande en cours
                          </span>
                          @if (isAdmin()) {
                            <button class="btn-valider" (click)="validerAlerte(item)">
                              <i class="fa-solid fa-check"></i> Valider
                            </button>
                          }
                        </div>
                      } @else if (item.statut === 'En cours' && item.prisPar) {
                        <span class="taken-label">
                          <i class="fa-solid fa-check-circle"></i> En cours par {{ item.prisPar }}
                        </span>
                      } @else if (item.statut === 'Planifiée' && item.alertes === 0) {
                        <button class="btn-prendre" (click)="prendreAlerte(item)">
                          <i class="fa-solid fa-hand"></i> Prendre en charge
                        </button>
                      } @else if (item.statut === 'Terminée') {
                        <div class="done-actions">
                          <span class="done-label">
                            <i class="fa-solid fa-check"></i> Terminée
                          </span>
                          @if (item.rapport) {
                            <button class="btn-rapport" (click)="voirRapport(item)">
                              <i class="fa-solid fa-file-lines"></i> Voir le rapport
                            </button>
                          } @else {
                            <button class="btn-rapport" (click)="ouvrirRapport(item)">
                              <i class="fa-solid fa-pen"></i> Rédiger un rapport
                            </button>
                          }
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </app-base-page>

    <!-- Modal rédaction rapport -->
    @if (showRapportModal && selectedItem; as item) {
      <div class="rapport-overlay" (click)="fermerRapport()"></div>
      <div class="rapport-modal" role="dialog" aria-label="Rédiger un rapport d'intervention">
        <div class="rapport-modal-header">
          <div class="rapport-modal-icon">
            <i class="fa-solid fa-file-pen"></i>
          </div>
          <div class="rapport-modal-title-block">
            <h3 class="rapport-modal-title">Rapport d'intervention</h3>
            <span class="rapport-modal-subtitle">{{ item.equipment }} — {{ item.type }}</span>
          </div>
          <button class="rapport-modal-close" (click)="fermerRapport()" aria-label="Fermer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="rapport-modal-body">
          <div class="rapport-field">
            <label class="rapport-label" for="rapport-contenu">Description de l'intervention *</label>
            <textarea
              id="rapport-contenu"
              class="rapport-textarea"
              [(ngModel)]="rapportForm.contenu"
              rows="5"
              placeholder="Décrivez les travaux effectués, les constats, les solutions apportées..."
              required
            ></textarea>
          </div>
          <div class="rapport-field">
            <label class="rapport-label" for="rapport-pieces">Pièces remplacées</label>
            <input
              id="rapport-pieces"
              class="rapport-input"
              [(ngModel)]="rapportForm.piecesRemplacees"
              placeholder="Ex : Batterie 12V, câble de charge..."
            />
          </div>
          <div class="rapport-field">
            <label class="rapport-label" for="rapport-duree">Durée de l'intervention</label>
            <input
              id="rapport-duree"
              class="rapport-input"
              [(ngModel)]="rapportForm.dureeIntervention"
              placeholder="Ex : 2h30"
            />
          </div>
        </div>

        <div class="rapport-modal-footer">
          <button class="rapport-btn-cancel" (click)="fermerRapport()">Annuler</button>
          <button class="rapport-btn-submit" (click)="enregistrerRapport()" [disabled]="!rapportForm.contenu.trim()">
            <i class="fa-solid fa-check"></i> Enregistrer le rapport
          </button>
        </div>
      </div>
    }

    <!-- Modal consultation rapport -->
    @if (showRapportView && selectedItem?.rapport; as rapport) {
      <div class="rapport-overlay" (click)="fermerRapport()"></div>
      <div class="rapport-modal" role="dialog" aria-label="Rapport d'intervention">
        <div class="rapport-modal-header">
          <div class="rapport-modal-icon">
            <i class="fa-solid fa-file-lines"></i>
          </div>
          <div class="rapport-modal-title-block">
            <h3 class="rapport-modal-title">Rapport d'intervention</h3>
            <span class="rapport-modal-subtitle">{{ selectedItem?.equipment }} — {{ selectedItem?.type }}</span>
          </div>
          <button class="rapport-modal-close" (click)="fermerRapport()" aria-label="Fermer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="rapport-modal-body">
          <div class="rapport-view-meta">
            <span class="rapport-view-meta-item">
              <i class="fa-solid fa-user"></i> {{ rapport.redacteur }}
            </span>
            <span class="rapport-view-meta-item">
              <i class="fa-solid fa-calendar"></i> {{ rapport.dateRedaction }}
            </span>
            @if (rapport.dureeIntervention) {
              <span class="rapport-view-meta-item">
                <i class="fa-solid fa-clock"></i> {{ rapport.dureeIntervention }}
              </span>
            }
          </div>
          <div class="rapport-view-content">
            <p>{{ rapport.contenu }}</p>
            @if (rapport.piecesRemplacees) {
              <div class="rapport-view-pieces">
                <strong>Pièces remplacées :</strong>
                <span>{{ rapport.piecesRemplacees }}</span>
              </div>
            }
          </div>
        </div>

        <div class="rapport-modal-footer">
          <button class="rapport-btn-cancel" (click)="fermerRapport()">Fermer</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .maintenance-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card { background: #FFFFFF; border-radius: 16px; padding: 14px 20px; display: flex; flex-direction: column; gap: 4px; color: #0F172A; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12); min-width: 200px; min-height: 110px; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .stat-card:hover { box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18); transform: translateY(-2px); }
    .stat-label { font-size: 16px; font-weight: 400; color: #64748B; }
    .stat-value { font-size: 18px; font-weight: 600; color: #0F172A; }

    .table-card { background: #FFFFFF; border-radius: 16px; padding: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); transition: box-shadow 0.3s ease; margin-top: 0; }
    .table-wrapper { overflow-x: auto; border-radius: 12px; }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
    .data-table thead th { text-align: left; padding: 14px 16px; color: #6B7280; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; background: #F9FAFB; }
    .data-table thead th:first-child { border-top-left-radius: 8px; }
    .data-table thead th:last-child { border-top-right-radius: 8px; }
    .data-table tbody td { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; color: #374151; font-weight: 400; }
    .data-table tbody tr { transition: background 0.2s ease; border-radius: 8px; }
    .data-table tbody tr:hover { background: #F9FAFB; }
    .data-table tbody tr:last-child td { border-bottom: none; }

    .equipment-cell { display: flex; align-items: center; gap: 8px; }
    .equipment-name { font-weight: 600; color: #0F172A; }

    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .status-planifiee { background: #FFFBEB; color: #D97706; border: 1px solid #FCD39D; }
    .status-en-cours { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
    .status-terminee { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }

    .alert-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .alert-active { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
    .alert-none { background: #E5E7EB; color: #6B7280; border: 1px solid #D1D5DB; }

    .taken-by { margin-top: 6px; font-size: 11px; color: #059669; display: flex; align-items: center; gap: 4px; }
    .taken-by i { font-size: 11px; }

    .btn-prendre { background: #F59E0B; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn-prendre:hover { background: #D97706; transform: translateY(-1px); }

    .btn-valider { background: #10B981; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; margin-left: 8px; }
    .btn-valider:hover { background: #059669; transform: translateY(-1px); }

    .waiting-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .waiting-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #F59E0B; font-weight: 600; }
    .waiting-label i { font-size: 12px; }

    .taken-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563EB; font-weight: 600; }
    .taken-label i { font-size: 12px; }

    .done-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #059669; font-weight: 600; }
    .done-label i { font-size: 12px; }

    .done-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .btn-rapport { background: #1E3A8A; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn-rapport:hover { background: #0B1A2E; transform: translateY(-1px); }

    /* Modal rapport */
    .rapport-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.5); z-index: 1500; backdrop-filter: blur(2px); }
    .rapport-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 520px; max-width: 92vw; max-height: 90vh; background: #FFF; border-radius: 16px; z-index: 1501; box-shadow: 0 24px 64px rgba(15, 23, 42, 0.25); display: flex; flex-direction: column; overflow: hidden; animation: rapportSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes rapportSlideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
    .rapport-modal-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px; border-bottom: 1px solid #E2E8F0; background: linear-gradient(135deg, #0B1A2E, #1E3A8A); }
    .rapport-modal-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255, 255, 255, 0.15); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .rapport-modal-title-block { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .rapport-modal-title { font-size: 16px; font-weight: 700; color: #FFF; margin: 0; }
    .rapport-modal-subtitle { font-size: 11px; color: #94A3B8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rapport-modal-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(255, 255, 255, 0.1); color: #E2E8F0; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; }
    .rapport-modal-close:hover { background: rgba(255, 255, 255, 0.2); }
    .rapport-modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
    .rapport-field { display: flex; flex-direction: column; gap: 6px; }
    .rapport-label { font-size: 12px; font-weight: 600; color: #334155; }
    .rapport-textarea { border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F172A; resize: vertical; min-height: 100px; outline: none; transition: all 0.2s ease; }
    .rapport-textarea:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }
    .rapport-input { border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F172A; outline: none; transition: all 0.2s ease; }
    .rapport-input:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }
    .rapport-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #E2E8F0; }
    .rapport-btn-cancel { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .rapport-btn-cancel:hover { background: #E2E8F0; }
    .rapport-btn-submit { background: #1E3A8A; color: #FFF; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
    .rapport-btn-submit:hover { background: #0B1A2E; }
    .rapport-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .rapport-view-meta { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; background: #F8FAFC; border-radius: 10px; border: 1px solid #E2E8F0; }
    .rapport-view-meta-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; }
    .rapport-view-meta-item i { color: #1E3A8A; }
    .rapport-view-content { display: flex; flex-direction: column; gap: 12px; }
    .rapport-view-content p { font-size: 13px; color: #334155; line-height: 1.6; margin: 0; }
    .rapport-view-pieces { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: #EFF6FF; border-radius: 10px; border: 1px solid #BFDBFE; }
    .rapport-view-pieces strong { font-size: 12px; color: #1E3A8A; }
    .rapport-view-pieces span { font-size: 13px; color: #334155; }

    @media (max-width: 1024px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MaintenancePageComponent implements OnInit {
  items: MaintenanceItem[] = [];
  showRapportModal = false;
  showRapportView = false;
  selectedItem: MaintenanceItem | null = null;
  rapportForm: { contenu: string; piecesRemplacees?: string; dureeIntervention?: string } = {
    contenu: '',
    piecesRemplacees: '',
    dureeIntervention: ''
  };

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.items = this.maintenanceService.getItems();
  }

  getCurrentUserName(): string {
    return this.authService.getUser()?.name || 'Utilisateur';
  }

  isAdmin(): boolean {
    return this.authService.isStructureAdmin() || this.authService.isSuperAdmin();
  }

  getEnCours(): number {
    return this.items.filter(i => i.statut === 'En cours').length;
  }

  getTerminees(): number {
    return this.items.filter(i => i.statut === 'Terminée').length;
  }

  getAlertesActives(): number {
    return this.items.filter(i => i.alertes > 0).length;
  }

  prendreAlerte(item: MaintenanceItem): void {
    this.maintenanceService.prendreAlerte(item.id, this.getCurrentUserName());
    this.items = this.maintenanceService.getItems();
  }

  validerAlerte(item: MaintenanceItem): void {
    this.maintenanceService.validerAlerte(item.id);
    this.items = this.maintenanceService.getItems();
  }

  ouvrirRapport(item: MaintenanceItem): void {
    this.selectedItem = item;
    this.rapportForm = { contenu: '', piecesRemplacees: '', dureeIntervention: '' };
    this.showRapportModal = true;
    this.showRapportView = false;
  }

  voirRapport(item: MaintenanceItem): void {
    this.selectedItem = item;
    this.showRapportModal = false;
    this.showRapportView = true;
  }

  fermerRapport(): void {
    this.showRapportModal = false;
    this.showRapportView = false;
    this.selectedItem = null;
  }

  enregistrerRapport(): void {
    if (!this.selectedItem || !this.rapportForm.contenu.trim()) return;
    const rapport: RapportIntervention = {
      contenu: this.rapportForm.contenu.trim(),
      piecesRemplacees: this.rapportForm.piecesRemplacees?.trim() || undefined,
      dureeIntervention: this.rapportForm.dureeIntervention?.trim() || undefined,
      dateRedaction: '',
      redacteur: this.getCurrentUserName()
    };
    this.maintenanceService.redigerRapport(this.selectedItem.id, rapport);
    this.items = this.maintenanceService.getItems();
    this.fermerRapport();
  }
}
