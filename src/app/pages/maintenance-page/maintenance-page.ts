import { Component, OnInit } from '@angular/core';
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
                        <span class="done-label">
                          <i class="fa-solid fa-check"></i> Terminée
                        </span>
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
}
