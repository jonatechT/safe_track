import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasePageComponent } from '../base-page/base-page';
import { MaintenanceService, MaintenanceItem, RapportIntervention } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-rapports-page',
  standalone: true,
  imports: [BasePageComponent, FormsModule],
  template: `
    <app-base-page title="Rapports" subtitle="Visualisation de tous les rapports d'intervention." icon="fa-solid fa-file-lines">
      <div page-actions>
        <button class="btn-rediger-top" (click)="ouvrirRapport()">
          <i class="fa-solid fa-pen"></i> Rédiger un rapport
        </button>
      </div>
      <div class="rapports-content">
        <!-- KPI Cards -->
        <div class="stat-grid">
          <div class="stat-card stat-card--green">
            <div class="stat-main">
              <span class="stat-label">Rapports rédigés</span>
              <span class="stat-value"><strong>{{ getRapportsCount() }}</strong></span>
            </div>
            <i class="fa-solid fa-file-lines stat-icon stat-icon--green"></i>
          </div>
          <div class="stat-card stat-card--blue">
            <div class="stat-main">
              <span class="stat-label">Interventions terminées</span>
              <span class="stat-value"><strong>{{ getTermineesCount() }}</strong></span>
            </div>
            <i class="fa-solid fa-circle-check stat-icon stat-icon--blue"></i>
          </div>
          <div class="stat-card stat-card--orange">
            <div class="stat-main">
              <span class="stat-label">Sans rapport</span>
              <span class="stat-value"><strong>{{ getSansRapportCount() }}</strong></span>
            </div>
            <i class="fa-solid fa-file-circle-exclamation stat-icon stat-icon--orange"></i>
          </div>
        </div>

        <!-- Liste des rapports -->
        <div class="table-card">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Type</th>
                  <th>Rédacteur</th>
                  <th>Date</th>
                  <th>Durée</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of rapports; track item.id) {
                  <tr>
                    <td>
                      <div class="equipment-cell">
                        <span class="equipment-name">{{ item.equipment }}</span>
                      </div>
                    </td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.rapport?.redacteur || '—' }}</td>
                    <td>{{ item.rapport?.dateRedaction || '—' }}</td>
                    <td>{{ item.rapport?.dureeIntervention || '—' }}</td>
                    <td>
                      <div class="actions-cell">
                        @if (item.rapport) {
                          <button class="btn-voir" (click)="voirRapport(item)">
                            <i class="fa-solid fa-file-lines"></i> Voir
                          </button>
                          <button class="btn-export" (click)="exporterRapport(item)" title="Exporter le rapport">
                            <i class="fa-solid fa-download"></i> Exporter
                          </button>
                        } @else {
                          <span class="no-rapport">Aucun rapport</span>
                        }
                      </div>
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
    @if (showRapportModal) {
      <div class="rapport-overlay" (click)="fermerRapport()"></div>
      <div class="rapport-modal" role="dialog" aria-label="Rédiger un rapport d'intervention">
        <div class="rapport-modal-header">
          <div class="rapport-modal-icon">
            <i class="fa-solid fa-file-pen"></i>
          </div>
          <div class="rapport-modal-title-block">
            <h3 class="rapport-modal-title">Rapport d'intervention</h3>
            <span class="rapport-modal-subtitle">Rédiger un nouveau rapport</span>
          </div>
          <button class="rapport-modal-close" (click)="fermerRapport()" aria-label="Fermer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="rapport-modal-body">
          <div class="rapport-field">
            <label class="rapport-label" for="rapport-item">
              <i class="fa-solid fa-wrench"></i> Intervention concernée <span class="rapport-required">*</span>
            </label>
            <select id="rapport-item" class="rapport-select" [(ngModel)]="selectedItemId" (ngModelChange)="surSelectionIntervention()">
              <option [ngValue]="null" disabled>Sélectionnez une intervention terminée...</option>
              @for (item of rapports; track item.id) {
                <option [ngValue]="item.id">{{ item.equipment }} — {{ item.type }}{{ item.rapport ? ' (rapport existant)' : '' }}</option>
              }
            </select>
          </div>
          <div class="rapport-field">
            <label class="rapport-label" for="rapport-contenu">
              <i class="fa-solid fa-align-left"></i> Description de l'intervention <span class="rapport-required">*</span>
            </label>
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
            <label class="rapport-label" for="rapport-pieces">
              <i class="fa-solid fa-boxes-stacked"></i> Pièces remplacées
            </label>
            <input
              id="rapport-pieces"
              class="rapport-input"
              [(ngModel)]="rapportForm.piecesRemplacees"
              placeholder="Ex : Batterie 12V, câble de charge..."
            />
          </div>
          <div class="rapport-field">
            <label class="rapport-label" for="rapport-duree">
              <i class="fa-solid fa-clock"></i> Durée de l'intervention
            </label>
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
          <button class="rapport-btn-submit" (click)="enregistrerRapport()" [disabled]="!selectedItemId || !rapportForm.contenu.trim()">
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
          <button class="rapport-btn-export" (click)="exporterRapport(selectedItem!)">
            <i class="fa-solid fa-download"></i> Exporter
          </button>
          <button class="rapport-btn-cancel" (click)="fermerRapport()">Fermer</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .rapports-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card {
      background: #FFFFFF;
      border-radius: 12px;
      padding: 20px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      color: #0F172A;
      border: 1px solid rgba(15, 23, 42, 0.06);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      min-width: 0;
      min-height: 124px;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .stat-card:hover { box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); transform: translateY(-2px); }
    .stat-main { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
    .stat-label { font-size: 13px; font-weight: 600; color: #475569; letter-spacing: 0.2px; }
    .stat-value { font-size: 30px; font-weight: 700; line-height: 1.05; color: #0F172A; }
    .stat-value strong { font-size: 1em; }
    .stat-icon {
      font-size: 20px;
      flex-shrink: 0;
    }
    .stat-card--blue { background: #DBEAFE; border-color: rgba(59, 130, 246, 0.24); }
    .stat-icon--blue { color: #2563EB; }
    .stat-card--green { background: #D1FAE5; border-color: rgba(16, 185, 129, 0.24); }
    .stat-icon--green { color: #059669; }
    .stat-card--orange { background: #FFEDD5; border-color: rgba(234, 88, 12, 0.24); }
    .stat-icon--orange { color: #EA580C; }

    /* ===== Tableau moderne (wrapper sans carte) ===== */
    .table-card {
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0;
      overflow: visible;
      box-shadow: none;
      margin-top: 0;
    }
    .table-wrapper {
      overflow-x: auto;
      border: none;
      border-radius: 0;
    }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px; }

    .data-table thead th {
      text-align: left;
      padding: 12px 14px;
      height: 40px;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background-color: #2563EB;
      border-bottom: 1px solid #2563EB;
      vertical-align: middle;
    }
    .data-table thead th:first-child { border-radius: 8px 0 0 8px; }
    .data-table thead th:last-child { text-align: right; border-radius: 0 8px 8px 0; }

    .data-table tbody tr {
      transition: background-color 0.15s ease, border-color 0.15s ease;
      background-color: #FFFFFF;
    }
    .data-table tbody tr.active {
      background-color: #2563EB;
      color: #FFFFFF;
    }
    .data-table tbody tr.active td {
      color: #FFFFFF;
      border-color: #2563EB;
    }
    .data-table tbody td {
      background-color: #FFFFFF;
      padding: 13px 14px;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
      font-weight: 400;
      vertical-align: middle;
    }
    .data-table tbody td:first-child { border-left: 1px solid #E2E8F0; border-radius: 8px 0 0 8px; color: #1E293B; font-weight: 600; font-size: 13px; }
    .data-table tbody td:last-child { border-right: 1px solid #E2E8F0; border-radius: 0 8px 8px 0; }
    .data-table tbody tr:hover td { background-color: #F8FAFC; border-color: #BFDBFE; }
    .data-table tbody tr.active:hover td { background-color: #2563EB; border-color: #2563EB; }
    .data-table tbody td:nth-child(3),
    .data-table tbody td:nth-child(4),
    .data-table tbody td:nth-child(5) {
      color: #64748B;
      font-size: 12px;
    }
    .data-table tbody td:last-child { text-align: right; }

    .equipment-cell { display: flex; align-items: center; gap: 10px; }
    .equipment-name { font-weight: 600; color: #0F172A; font-size: 13px; }

    .btn-voir { background: transparent; color: #2563EB; border: none; border-radius: 6px; padding: 6px 10px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; }
    .btn-voir:hover { background: #EFF6FF; color: #2563EB; }

    .no-rapport { font-size: 12px; color: #94A3B8; font-style: italic; }

    .rapports-actions { display: flex; align-items: center; gap: 12px; }
    .btn-rediger-top { background: #2563EB; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35); position: relative; top: 8px; }
    .btn-rediger-top:hover { background: #1D4ED8; transform: translateY(-1px); }
    .btn-rediger-top:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .rapports-actions-hint { font-size: 12px; color: #94A3B8; font-style: italic; }

    .actions-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .btn-export { background: transparent; color: #10B981; border: none; border-radius: 6px; padding: 6px 10px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; }
    .btn-export:hover { background: #ECFDF5; color: #059669; }

    .rapport-select { border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F172A; outline: none; background: #FFF; cursor: pointer; transition: all 0.2s ease; }
    .rapport-select:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }

    /* Modal rédaction */
    .rapport-field { display: flex; flex-direction: column; gap: 6px; }
    .rapport-label { font-size: 12px; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 6px; }
    .rapport-label i { color: #1E3A8A; font-size: 12px; }
    .rapport-required { color: #EF4444; font-weight: 700; }
    .rapport-select { border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F172A; outline: none; background: #FFF; cursor: pointer; transition: all 0.2s ease; }
    .rapport-select:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }
    .rapport-textarea { border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F172A; resize: vertical; min-height: 100px; outline: none; transition: all 0.2s ease; background: #F8FAFC; }
    .rapport-textarea:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); background: #FFF; }
    .rapport-input { border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F172A; outline: none; transition: all 0.2s ease; background: #F8FAFC; }
    .rapport-input:focus { border-color: #1E3A8A; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); background: #FFF; }
    .rapport-btn-submit { background: #1E3A8A; color: #FFF; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25); }
    .rapport-btn-submit:hover { background: #0B1A2E; transform: translateY(-1px); }
    .rapport-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .rapport-btn-export { background: #10B981; color: #FFF; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; margin-right: auto; }
    .rapport-btn-export:hover { background: #059669; }

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
    .rapport-view-meta { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; background: #F8FAFC; border-radius: 10px; border: 1px solid #E2E8F0; }
    .rapport-view-meta-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; }
    .rapport-view-meta-item i { color: #1E3A8A; }
    .rapport-view-content { display: flex; flex-direction: column; gap: 12px; }
    .rapport-view-content p { font-size: 13px; color: #334155; line-height: 1.6; margin: 0; }
    .rapport-view-pieces { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: #EFF6FF; border-radius: 10px; border: 1px solid #BFDBFE; }
    .rapport-view-pieces strong { font-size: 12px; color: #1E3A8A; }
    .rapport-view-pieces span { font-size: 13px; color: #334155; }
    .rapport-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #E2E8F0; }
    .rapport-btn-cancel { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .rapport-btn-cancel:hover { background: #E2E8F0; }

    @media (max-width: 1024px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RapportsPageComponent implements OnInit {
  rapports: MaintenanceItem[] = [];
  selectedItem: MaintenanceItem | null = null;
  selectedItemId: string | null = null;
  showRapportModal = false;
  showRapportView = false;
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
    this.rapports = this.maintenanceService.getItems().filter(i => i.statut === 'Terminée');
  }

  getRapportsCount(): number {
    return this.rapports.filter(i => i.rapport).length;
  }

  getTermineesCount(): number {
    return this.rapports.length;
  }

  getSansRapportCount(): number {
    return this.rapports.filter(i => !i.rapport).length;
  }

  getRapportsPourcent(): number {
    const total = this.getTermineesCount();
    return total === 0 ? 0 : Math.round((this.getRapportsCount() / total) * 100);
  }

  getTermineesPourcent(): number {
    return 100;
  }

  getSansRapportPourcent(): number {
    const total = this.getTermineesCount();
    return total === 0 ? 0 : Math.round((this.getSansRapportCount() / total) * 100);
  }

  /** Génère le style conic-gradient pour un cercle de progression */
  getProgressStyle(percent: number, color: string): string {
    const p = Math.min(100, Math.max(0, percent));
    return `conic-gradient(${color} 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }

  ouvrirRapport(item?: MaintenanceItem): void {
    this.selectedItem = item || null;
    this.selectedItemId = item?.id || null;
    this.rapportForm = { contenu: '', piecesRemplacees: '', dureeIntervention: '' };
    this.showRapportModal = true;
    this.showRapportView = false;
  }

  /** Pré-remplit le formulaire avec le rapport existant lors de la sélection */
  surSelectionIntervention(): void {
    const item = this.rapports.find(i => i.id === this.selectedItemId);
    if (item?.rapport) {
      this.rapportForm = {
        contenu: item.rapport.contenu,
        piecesRemplacees: item.rapport.piecesRemplacees || '',
        dureeIntervention: item.rapport.dureeIntervention || ''
      };
    } else {
      this.rapportForm = { contenu: '', piecesRemplacees: '', dureeIntervention: '' };
    }
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
    if (!this.selectedItemId || !this.rapportForm.contenu.trim()) return;
    const rapport: RapportIntervention = {
      contenu: this.rapportForm.contenu.trim(),
      piecesRemplacees: this.rapportForm.piecesRemplacees?.trim() || undefined,
      dureeIntervention: this.rapportForm.dureeIntervention?.trim() || undefined,
      dateRedaction: new Date().toLocaleDateString('fr-FR'),
      redacteur: this.authService.getUser()?.name || 'Technicien'
    };
    this.maintenanceService.redigerRapport(this.selectedItemId, rapport);
    this.rapports = this.maintenanceService.getItems().filter(i => i.statut === 'Terminée');
    this.fermerRapport();
  }

  exporterRapport(item: MaintenanceItem): void {
    if (!item?.rapport) return;
    const r = item.rapport;
    const contenu = [
      '========================================',
      "RAPPORT D'INTERVENTION — SAFE TRACK",
      '========================================',
      '',
      `Équipement : ${item.equipment}`,
      `Type d'intervention : ${item.type}`,
      `Date prévue : ${item.datePrevue}`,
      `Technicien assigné : ${item.technicien}`,
      '',
      '----------------------------------------',
      'DÉTAILS DU RAPPORT',
      '----------------------------------------',
      `Rédigé par : ${r.redacteur}`,
      `Date de rédaction : ${r.dateRedaction}`,
      r.dureeIntervention ? `Durée de l'intervention : ${r.dureeIntervention}` : '',
      '',
      "DESCRIPTION DE L'INTERVENTION :",
      r.contenu,
      '',
      r.piecesRemplacees ? `PIÈCES REMPLACÉES : ${r.piecesRemplacees}` : '',
      '',
      '========================================',
      'Document généré automatiquement par SAFE Track'
    ].filter(line => line !== '').join(String.fromCharCode(10));

    try {
      const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-${item.equipment.replace(/[^a-zA-Z0-9]/g, '-')}-${r.dateRedaction.replace(/\//g, '-')}.txt`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      // Nettoyage différé pour laisser le navigateur démarrer le téléchargement
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 200);
    } catch (e) {
      console.error('Erreur lors de l\'export du rapport', e);
    }
  }
}
