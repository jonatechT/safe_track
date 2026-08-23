import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { MaintenanceService, MaintenanceItem } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-maintenance-page',
  standalone: true,
  imports: [BasePageComponent],
  template: `
    <app-base-page title="Maintenance" subtitle="Planification et suivi des interventions de maintenance." icon="fa-solid fa-wrench">
      <div class="maintenance-content">
        <!-- KPI Cards -->
        <div class="kpi-container">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-main">
                <span class="stat-label">En cours</span>
                <span class="stat-value"><strong>{{ getEnCours() }}</strong></span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-main">
                <span class="stat-label">Terminées</span>
                <span class="stat-value"><strong>{{ getTerminees() }}</strong></span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-main">
                <span class="stat-label">Alertes actives</span>
                <span class="stat-value"><strong>{{ getAlertesActives() }}</strong></span>
              </div>
            </div>
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
                    <td class="actions-cell">
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
                        <div class="done-actions">
                          <span class="taken-label">
                            <i class="fa-solid fa-check-circle"></i> En cours par {{ item.prisPar }}
                          </span>
                          <button class="btn-terminer" (click)="terminerMaintenance(item)">
                            <i class="fa-solid fa-flag-checkered"></i> Terminer
                          </button>
                        </div>
                      } @else if (item.statut === 'Planifiée' && item.alertes === 0) {
                        <button class="btn-prendre" (click)="prendreAlerte(item)">
                          <i class="fa-solid fa-hand"></i> Prendre en charge
                        </button>
                      } @else if (item.statut === 'Terminée') {
                        <div class="done-actions">
                          <span class="done-label">
                            <i class="fa-solid fa-check"></i> Terminée
                          </span>
                          <button class="btn-rapport" (click)="allerAuxRapports()" title="Voir les rapports">
                            <i class="fa-solid fa-file-lines"></i> Rapport
                          </button>
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
  `,
  styles: [`
    .maintenance-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    .kpi-container { background: #EFF6FF; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); }
    .kpi-container-header { margin-bottom: 20px; }
    .kpi-container-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card { background: #FFFFFF; border-radius: 16px; padding: 14px 20px; display: flex; flex-direction: column; gap: 4px; color: #0F172A; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12); min-width: 200px; min-height: 110px; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .stat-card:hover { box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18); transform: translateY(-2px); }
    .stat-main { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .stat-label { font-size: 16px; font-weight: 400; color: #64748B; }
    .stat-value { font-size: 18px; font-weight: 600; color: #0F172A; }

    /* ===== Tableau moderne ===== */
    .table-card {
      background: #EFF6FF;
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 16px;
      padding: 8px 20px 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04);
      transition: box-shadow 0.3s ease;
      margin-top: 0;
    }
    .table-wrapper { overflow-x: auto; border-radius: 12px; margin: 0 -8px; }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; font-size: 13px; }

    .data-table thead th {
      text-align: left;
      padding: 14px 18px;
      color: #64748B;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.9px;
      background: rgba(56, 189, 248, 0.10);
      border-bottom: 1px solid #E2E8F0;
    }
    .data-table thead tr { border-radius: 10px; }
    .data-table thead th:first-child { border-radius: 10px 0 0 10px; }
    .data-table thead th:last-child { text-align: right; border-radius: 0 10px 10px 0; }

    .data-table tbody tr {
      transition: all 0.2s ease;
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
      background: #F7FAFE;
    }
    .data-table tbody td {
      background: transparent;
      padding: 15px 18px;
      border-bottom: 1px solid #EAF1FA;
      border-top: 1px solid #EAF1FA;
      color: #334155;
      font-weight: 400;
      vertical-align: middle;
    }
    .data-table tbody td:first-child {
      border-left: 1px solid #F1F5F9;
      border-radius: 12px 0 0 12px;
    }
    .data-table tbody td:last-child {
      border-right: 1px solid #F1F5F9;
      border-radius: 0 12px 12px 0;
      text-align: right;
    }
    .actions-cell { text-align: right; }
    .data-table tbody tr:hover td {
      background: rgba(56, 189, 248, 0.10);
      border-color: rgba(56, 189, 248, 0.35);
    }

    .equipment-cell { display: flex; align-items: center; gap: 10px; }
    .equipment-name { font-weight: 600; color: #0F172A; font-size: 13px; }

    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .status-planifiee { background: #FFFBEB; color: #D97706; border: 1px solid #FCD39D; }
    .status-en-cours { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
    .status-terminee { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }

    .alert-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .alert-active { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
    .alert-none { background: #E5E7EB; color: #6B7280; border: 1px solid #D1D5DB; }

    .taken-by { margin-top: 6px; font-size: 11px; color: #059669; display: flex; align-items: center; gap: 4px; }
    .taken-by i { font-size: 11px; }

    .btn-prendre { background: #1E3A8A; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn-prendre:hover { background: #0B1A2E; transform: translateY(-1px); }

    .btn-valider { background: #1E3A8A; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn-valider:hover { background: #0B1A2E; transform: translateY(-1px); }

    .waiting-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
    .waiting-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563EB; font-weight: 600; }
    .waiting-label i { font-size: 12px; }

    .taken-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563EB; font-weight: 600; }
    .taken-label i { font-size: 12px; }

    .done-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563EB; font-weight: 600; }
    .done-label i { font-size: 12px; }

    .done-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
    .btn-rapport { background: #1E3A8A; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn-rapport:hover { background: #0B1A2E; transform: translateY(-1px); }

    .btn-terminer { background: #1E3A8A; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn-terminer:hover { background: #0B1A2E; transform: translateY(-1px); }

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

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private router: Router
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

  getEnCoursPourcent(): number {
    const total = this.items.length;
    return total === 0 ? 0 : Math.round((this.getEnCours() / total) * 100);
  }

  getTermineesPourcent(): number {
    const total = this.items.length;
    return total === 0 ? 0 : Math.round((this.getTerminees() / total) * 100);
  }

  getAlertesActivesPourcent(): number {
    const total = this.items.length;
    return total === 0 ? 0 : Math.round((this.getAlertesActives() / total) * 100);
  }

  /** Génère le style conic-gradient pour un cercle de progression */
  getProgressStyle(percent: number, color: string): string {
    const p = Math.min(100, Math.max(0, percent));
    return `conic-gradient(${color} 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }

  prendreAlerte(item: MaintenanceItem): void {
    this.maintenanceService.prendreAlerte(item.id, this.getCurrentUserName());
    this.items = this.maintenanceService.getItems();
  }

  validerAlerte(item: MaintenanceItem): void {
    this.maintenanceService.validerAlerte(item.id);
    this.items = this.maintenanceService.getItems();
  }

  terminerMaintenance(item: MaintenanceItem): void {
    this.maintenanceService.terminerMaintenance(item.id);
    this.items = this.maintenanceService.getItems();
  }

  allerAuxRapports(): void {
    this.router.navigate(['/rapports']);
  }
}