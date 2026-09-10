import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { MaintenanceService, MaintenanceItem } from '../../services/maintenance.service';
import { EquipmentService } from '../../services/equipment.service';
import { UsersService } from '../../services/users.service';
import { AuthService, User } from '../../auth/auth.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [BasePageComponent],
  template: `
    <app-base-page title="Alertes" subtitle="Alertes non prises en charge sur votre parc." icon="fa-solid fa-triangle-exclamation">
      <div class="alerts-content">
        <!-- KPI Cards -->
        <div class="stat-grid">
          <div class="stat-card stat-card--red">
            <div class="stat-main">
              <span class="stat-label">Alertes ouvertes</span>
              <span class="stat-value"><strong>{{ items.length }}</strong></span>
            </div>
            <i class="fa-solid fa-triangle-exclamation stat-icon stat-icon--red"></i>
          </div>
          <div class="stat-card stat-card--pink">
            <div class="stat-main">
              <span class="stat-label">Critiques</span>
              <span class="stat-value"><strong>{{ getCritiques() }}</strong></span>
            </div>
            <i class="fa-solid fa-circle-exclamation stat-icon stat-icon--pink"></i>
          </div>
          <div class="stat-card stat-card--amber">
            <div class="stat-main">
              <span class="stat-label">Avertissements</span>
              <span class="stat-value"><strong>{{ getAvertissements() }}</strong></span>
            </div>
            <i class="fa-solid fa-circle-exclamation stat-icon stat-icon--amber"></i>
          </div>
        </div>

        @if (items.length === 0) {
          <div class="empty-state">
            <i class="fa-solid fa-circle-check empty-icon"></i>
            <p>Aucune alerte en cours. Tout est sous contrôle.</p>
          </div>
        } @else {
          <div class="table-card">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Équipement</th>
                    <th>Type</th>
                    <th>Sévérité</th>
                    <th>Numéro</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of items; track item.id) {
                    <tr (click)="ouvrirDetail(item)">
                      <td>
                        <div class="equipment-cell">
                          <span class="equipment-name">{{ item.equipment }}</span>
                        </div>
                      </td>
                      <td>{{ item.type }}</td>
                      <td>
                        @if (item.severite === 'Critique') {
                          <span class="severite-badge severite-critique"><i class="fa-solid fa-circle-exclamation"></i> Critique</span>
                        } @else {
                          <span class="severite-badge severite-avertissement"><i class="fa-solid fa-triangle-exclamation"></i> Avertissement</span>
                        }
                      </td>
                      <td><span class="numero-code">N°{{ padNumero(item.numero) }}</span></td>
                      <td class="actions-cell">
                        @if (isAdminUser()) {
                          <button class="btn-take" (click)="ouvrirAffectation(item); $event.stopPropagation()">
                            <i class="fa-solid fa-user-clock"></i>
                            {{ planifMode ? 'Planifier' : 'Affecter' }}
                          </button>
                        } @else if (canTakeAlerts) {
                          <button class="btn-take" (click)="prendreAlerte(item); $event.stopPropagation()">
                            <i class="fa-solid" [class.fa-hand]="!inspectionMode" [class.fa-magnifying-glass]="inspectionMode"></i>
                            {{ inspectionMode ? 'Inspecter' : 'Prendre' }}
                          </button>
                        } @else {
                          <span class="locked-label"><i class="fa-solid fa-lock"></i> En attente</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Modale d'affectation d'une alerte à un ou plusieurs techniciens -->
      @if (showAffectModal && selectedItem) {
        <div class="affect-overlay" (click)="closeAffectModal()">
          <div class="affect-modal" role="dialog" aria-modal="true" aria-label="Affecter une intervention" (click)="$event.stopPropagation()">
            <div class="affect-modal-header">
              <div class="affect-modal-icon"><i class="fa-solid fa-user-clock"></i></div>
              <div class="affect-modal-title-block">
                <h3 class="affect-modal-title">{{ planifMode ? 'Planifier une intervention' : 'Affecter une intervention' }}</h3>
                <span class="affect-modal-subtitle">{{ selectedItem.equipment }} — {{ selectedItem.type }}</span>
              </div>
              <button type="button" class="affect-modal-close" aria-label="Fermer" (click)="closeAffectModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            @if (affectModeMulti) {
              <div class="affect-multi-note">
                <i class="fa-solid fa-users"></i>
                Sélectionnez un ou plusieurs techniciens (max {{ maxTechniciens }}).
              </div>
            }
            <div class="affect-modal-body">
              @if (techniciensDisponibles.length) {
                <div class="affect-list">
                  @for (tech of techniciensDisponibles; track tech.id) {
                    <button type="button" class="affect-item" [class.selected]="isTechnicienSelected(tech.id)" (click)="toggleTechnicien(tech.id)">
                      <span class="affect-avatar">{{ tech.name.charAt(0) }}</span>
                      <span class="affect-item-info">
                        <span class="affect-item-name">{{ tech.name }}</span>
                        <span class="affect-item-email">{{ tech.telephone || tech.email }}</span>
                      </span>
                      <i class="fa-solid fa-circle-check affect-check"></i>
                    </button>
                  }
                </div>
              } @else {
                <p class="affect-empty">Aucun technicien actif disponible dans votre structure pour le moment.</p>
              }
              <button type="button" class="affect-item affect-self" [class.selected]="isTechnicienSelected(-1)" (click)="toggleTechnicien(-1)">
                <span class="affect-avatar">Moi</span>
                <span class="affect-item-info">
                  <span class="affect-item-name">M'affecter cette intervention</span>
                  <span class="affect-item-email">{{ currentUserName }}</span>
                </span>
                <i class="fa-solid fa-circle-check affect-check"></i>
              </button>
            </div>
            <div class="affect-modal-footer">
              <button type="button" class="affect-btn-cancel" (click)="closeAffectModal()">Annuler</button>
              <button type="button" class="affect-btn-confirm" [disabled]="!selectedTechnicienIds.length" (click)="confirmerAffectation()">
                <i class="fa-solid fa-user-check"></i>
                {{ planifMode ? 'Planifier' : 'Affecter' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-base-page>
  `,
  styles: [`
    .alerts-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card {
      background: #FFFFFF; border-radius: 12px; padding: 20px 22px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      color: #0F172A; border: 1px solid rgba(15, 23, 42, 0.06); box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      min-width: 0; min-height: 124px; transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .stat-card:hover { box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); transform: translateY(-2px); }
    .stat-main { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
    .stat-label { font-size: 13px; font-weight: 600; color: #475569; }
    .stat-value { font-size: 30px; font-weight: 700; line-height: 1.05; color: #0F172A; }
    .stat-value strong { font-size: 1em; }
    .stat-icon { font-size: 20px; flex-shrink: 0; }
    .stat-card--red { background: #FEE2E2; border-color: rgba(239, 68, 68, 0.24); }
    .stat-icon--red { color: #DC2626; }
    .stat-card--pink { background: #FFE4E6; border-color: rgba(225, 29, 72, 0.22); }
    .stat-icon--pink { color: #E11D48; }
    .stat-card--amber { background: #FEF3C7; border-color: rgba(217, 119, 6, 0.24); }
    .stat-icon--amber { color: #D97706; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 48px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 12px; color: #94A3B8; text-align: center; }
    .empty-icon { font-size: 32px; color: #22C55E; }

    .table-card { background: transparent; border: none; padding: 0; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px; }
    .data-table thead th {
      text-align: left; padding: 12px 14px; height: 40px; color: #FFFFFF; font-weight: 600; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.5px; background-color: #2563EB; vertical-align: middle;
    }
    .data-table thead th:first-child { border-radius: 8px 0 0 8px; }
    .data-table thead th:last-child { text-align: right; border-radius: 0 8px 8px 0; }
    .data-table tbody tr { background-color: #FFFFFF; cursor: pointer; transition: background-color 0.15s ease, border-color 0.15s ease; }
    .data-table tbody td { background-color: #FFFFFF; padding: 13px 14px; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; color: #334155; vertical-align: middle; }
    .data-table tbody td:first-child { border-left: 1px solid #E2E8F0; border-radius: 8px 0 0 8px; font-weight: 600; color: #1E293B; }
    .data-table tbody td:last-child { border-right: 1px solid #E2E8F0; border-radius: 0 8px 8px 0; text-align: right; }
    .data-table tbody tr:hover td { background-color: #F8FAFC; border-color: #BFDBFE; }

    .equipment-cell { display: flex; align-items: center; gap: 10px; }
    .equipment-name { font-weight: 600; color: #0F172A; font-size: 13px; }
    .numero-code { font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace; font-size: 12px; color: #64748B; }

    .severite-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .severite-critique { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
    .severite-avertissement { background: #FEF3C7; color: #D97706; border: 1px solid #FCD39D; }

    .btn-take { background: transparent; color: #2563EB; border: 1px solid #2563EB; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; }
    .btn-take:hover { background: #2563EB; color: #FFFFFF; }
    .locked-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #94A3B8; font-weight: 600; }

    @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .stat-grid { grid-template-columns: 1fr; } }

    /* ===== Modale d'affectation (portée depuis l'ancienne page Alertes) ===== */
    .affect-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
    .affect-modal { background: #FFFFFF; border-radius: 16px; width: 100%; max-width: 420px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28); }
    .affect-modal-header { display: flex; align-items: center; gap: 12px; padding: 18px 20px; border-bottom: 1px solid #E2E8F0; }
    .affect-modal-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #EFF6FF; color: #2563EB; font-size: 18px; flex-shrink: 0; }
    .affect-modal-title-block { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .affect-modal-title { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; }
    .affect-modal-subtitle { font-size: 11.5px; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .affect-modal-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #64748B; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; }
    .affect-modal-close:hover { background: #F1F5F9; color: #0F172A; }
    .affect-modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
    .affect-list { display: flex; flex-direction: column; gap: 8px; }
    .affect-item, .affect-self { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 10px 12px; border-radius: 10px; border: 1px solid #E2E8F0; background: #FFFFFF; cursor: pointer; transition: all 0.15s ease; }
    .affect-item:hover, .affect-self:hover { border-color: #BFDBFE; background: #F8FAFC; }
    .affect-item.selected, .affect-self.selected { border-color: #2563EB; background: #EFF6FF; box-shadow: 0 0 0 1px #2563EB; }
    .affect-avatar { width: 34px; height: 34px; border-radius: 50%; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .affect-item-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
    .affect-item-name { font-size: 13px; font-weight: 600; color: #0F172A; }
    .affect-item-email { font-size: 11.5px; color: #64748B; }
    .affect-check { color: #2563EB; opacity: 0; transition: opacity 0.15s ease; }
    .affect-item.selected .affect-check, .affect-self.selected .affect-check { opacity: 1; }
    .affect-empty { font-size: 13px; color: #64748B; text-align: center; padding: 12px 0; }
    .affect-multi-note { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748B; padding: 10px 20px 4px; }
    .affect-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid #E2E8F0; }
    .affect-btn-cancel { padding: 8px 16px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #475569; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
    .affect-btn-cancel:hover { background: #F1F5F9; }
    .affect-btn-confirm { padding: 8px 18px; border-radius: 8px; border: none; background: #2563EB; color: #FFFFFF; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; }
    .affect-btn-confirm:hover { background: #1D4ED8; }
    .affect-btn-confirm:disabled { background: #CBD5E1; cursor: not-allowed; }
  `]
})
export class AlertsPageComponent {
  showAffectModal = false;
  selectedItem: MaintenanceItem | null = null;
  selectedTechnicienIds: number[] = [];

  constructor(
    private maintenanceService: MaintenanceService,
    private equipmentService: EquipmentService,
    private usersService: UsersService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  get items(): MaintenanceItem[] {
    return this.maintenanceService.getItems().filter(i => !i.prisPar && i.alertes > 0);
  }

  getCritiques(): number {
    return this.items.filter(i => i.severite === 'Critique').length;
  }

  getAvertissements(): number {
    return this.items.filter(i => i.severite === 'Avertissement').length;
  }

  padNumero(numero: number): string {
    return numero.toString().padStart(3, '0');
  }

  isAdminUser(): boolean {
    return this.authService.isStructureAdmin() || this.authService.isSuperAdmin();
  }

  get affectModeMulti(): boolean {
    return this.settingsService.settings().multiTechniciens;
  }

  get maxTechniciens(): number {
    return this.settingsService.settings().maxTechniciens;
  }

  get canTakeAlerts(): boolean {
    return this.settingsService.settings().priseEnChargeGlobale;
  }

  get planifMode(): boolean {
    return this.settingsService.settings().planifierMaintenance;
  }

  get inspectionMode(): boolean {
    return this.settingsService.settings().inspectionTechniciens;
  }

  get currentUserName(): string {
    return this.authService.getUser()?.name || 'Utilisateur';
  }

  get techniciensDisponibles(): User[] {
    const structureId = this.authService.getUser()?.structureId;
    if (!structureId) return [];
    return this.usersService
      .getUsersByStructure(structureId)
      .filter(u => u.role === 'USER' && (u.statut ?? 'ACTIVE') === 'ACTIVE')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  prendreAlerte(item: MaintenanceItem): void {
    const success = this.maintenanceService.prendreAlerte(item.id, this.currentUserName);
    if (success) {
      this.router.navigate(['/maintenance'], { queryParams: { taken: '1' } });
    }
  }

  ouvrirAffectation(item: MaintenanceItem): void {
    this.selectedItem = item;
    this.selectedTechnicienIds = [];
    this.showAffectModal = true;
  }

  closeAffectModal(): void {
    this.showAffectModal = false;
    this.selectedItem = null;
    this.selectedTechnicienIds = [];
  }

  isTechnicienSelected(id: number): boolean {
    return this.selectedTechnicienIds.includes(id);
  }

  toggleTechnicien(id: number): void {
    if (id === -1) {
      this.selectedTechnicienIds = this.selectedTechnicienIds.includes(-1) ? [] : [-1];
      return;
    }
    if (!this.affectModeMulti) {
      this.selectedTechnicienIds = [id];
      return;
    }
    if (this.selectedTechnicienIds.includes(id)) {
      this.selectedTechnicienIds = this.selectedTechnicienIds.filter(x => x !== id);
    } else if (this.selectedTechnicienIds.length < this.maxTechniciens) {
      this.selectedTechnicienIds = [...this.selectedTechnicienIds, id];
    }
  }

  confirmerAffectation(): void {
    if (!this.selectedItem || this.selectedTechnicienIds.length === 0) return;
    const item = this.selectedItem;
    const names = this.selectedTechnicienIds
      .filter(id => id !== -1)
      .map(id => this.techniciensDisponibles.find(t => t.id === id)?.name)
      .filter((n): n is string => !!n);
    if (this.selectedTechnicienIds.includes(-1)) names.unshift(this.currentUserName);
    const technicienName = names.length ? names.join(' & ') : this.currentUserName;
    this.maintenanceService.prendreAlerte(item.id, technicienName);
    this.closeAffectModal();
    this.router.navigate(['/maintenance'], { queryParams: { taken: '1' } });
  }

  ouvrirDetail(item: MaintenanceItem): void {
    const equipment = this.equipmentService.getAll().find(e => e.nom === item.equipment);
    if (equipment) {
      this.router.navigate(['/equipements', equipment.id], { queryParams: { source: 'alerts' } });
    }
  }
}
