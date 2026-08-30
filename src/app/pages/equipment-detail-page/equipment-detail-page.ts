import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { EquipmentService, Equipment, EquipmentDiagnostic } from '../../services/equipment.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-equipment-detail-page',
  standalone: true,
  imports: [BasePageComponent, CommonModule],
  template: `
    <app-base-page title="Détail de l'équipement" subtitle="Informations techniques et diagnostic." icon="fa-solid fa-microchip">
      <div page-actions class="page-actions">
        @if (source === 'alerts' && !isAlertTaken) {
          <button class="btn-action" (click)="prendreAlerte()">
            Prendre l'alerte
          </button>
        } @else if (source === 'maintenance') {
          <button class="btn-action" (click)="inspecter()">
            Inspecter
          </button>
        }
        <button class="btn-back" (click)="retour()">
          <i class="fa-solid fa-arrow-left"></i> {{ backButtonText }}
        </button>
      </div>

      <div class="detail-content">
        @if (!equipment) {
          <div class="empty-state">
            <i class="fa-solid fa-triangle-exclamation empty-icon"></i>
            <p>Équipement introuvable.</p>
            <button class="btn-back" (click)="retour()">Retour</button>
          </div>
        } @else {
          <!-- En-tête -->
          <div class="equip-header">
            <div class="equip-title-row">
              <h2 class="equip-name">{{ equipment.nom }}</h2>
              <span class="status-badge" [class.badge-alert]="equipment.statut === 'En alerte'" [class.badge-inspection]="equipment.statut === 'Inspection'">
                {{ equipment.statut }}
              </span>
            </div>
            <div class="equip-subtitle">IMEI : {{ equipment.imei }}</div>
          </div>

          <!-- Grille des informations -->
          <div class="info-grid">
            <!-- État -->
            <div class="info-card card-etat" [class.card-etat-alert]="equipment.statut === 'En alerte'" [class.card-etat-inspection]="equipment.statut === 'Inspection'">
              <div class="card-icon"><i class="fa-solid fa-signal"></i></div>
              <div class="card-content">
                <div class="card-label">ÉTAT</div>
                <div class="card-value">{{ equipment.statut }}</div>
                <div class="card-meta">Dernière synchro : {{ equipment.miseEnLigne }}</div>
              </div>
            </div>

            <!-- Localisation -->
            <div class="info-card card-localisation">
              <div class="card-icon"><i class="fa-solid fa-location-dot"></i></div>
              <div class="card-content">
                <div class="card-label">LOCALISATION</div>
                <div class="coords-value">{{ equipment.localisation }}</div>
                <a class="card-link" [href]="'https://www.google.com/maps?q=' + equipment.lienLocalisation" target="_blank" rel="noopener">
                  Voir sur Google Maps
                </a>
              </div>
            </div>

            <!-- Température -->
            <div class="info-card card-temperature">
              <div class="card-icon"><i class="fa-solid fa-temperature-half"></i></div>
              <div class="card-content">
                <div class="card-label">TEMPÉRATURE</div>
                @if (equipment.temperature !== null) {
                  <div class="card-value">{{ equipment.temperature }} °C</div>
                } @else {
                  <div class="card-empty">Donnée non disponible</div>
                }
              </div>
            </div>

            <!-- Tension -->
            <div class="info-card card-tension">
              <div class="card-icon"><i class="fa-solid fa-bolt"></i></div>
              <div class="card-content">
                <div class="card-label">TENSION</div>
                @if (equipment.tension !== null) {
                  <div class="card-value">{{ equipment.tension }} V</div>
                } @else {
                  <div class="card-empty">Donnée non disponible</div>
                }
              </div>
            </div>
          </div>

          <!-- Diagnostic -->
          <div class="diagnostic-block">
            <div class="diag-header">
              <div class="diag-icon"><i class="fa-solid fa-stethoscope"></i></div>
              <div class="card-label">DIAGNOSTIC DE L'ÉQUIPEMENT</div>
            </div>
            <div class="diag-grid">
              <div class="diag-row">
                <span class="diag-key">État</span>
                <span class="diag-val">{{ diagnostic.etat }}</span>
              </div>
              <div class="diag-row">
                <span class="diag-key">Gravité</span>
                <span class="diag-val">{{ diagnostic.gravite }}</span>
              </div>
              <div class="diag-row">
                <span class="diag-key">Anomalie</span>
                <span class="diag-val">{{ diagnostic.anomalie || 'Aucune' }}</span>
              </div>
            </div>
          </div>

        }
      </div>
    </app-base-page>
  `,
  styles: [`
    .detail-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    .page-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

    /* Bouton retour */
    .btn-back {
      background: #FFFFFF;
      color: #475569;
      border: 1px solid #E2E8F0;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-back:hover { background: #F8FAFC; }

    /* Bouton action */
    .btn-action {
      background: transparent;
      color: #2563EB;
      border: 1px solid #2563EB;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-action:hover { background: #2563EB; color: #FFFFFF; }

    /* En-tête */
    .equip-header {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px 24px;
    }
    .equip-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .equip-name { font-size: 20px; font-weight: 600; color: #1E293B; margin: 0; }
    .equip-subtitle { font-size: 13px; color: #64748B; margin-top: 6px; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      background: #F1F5F9;
      color: #475569;
      white-space: nowrap;
    }
    .status-badge.badge-alert { background: #FEE2E2; color: #DC2626; }
    .status-badge.badge-inspection { background: #FEF3C7; color: #D97706; }

    /* Grille d'informations */
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

    /* Cartes d'information */
    .info-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      transition: all 0.2s ease;
    }
    .info-card:hover { box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08); }
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #3B82F6;
      background: #FFFFFF;
      border: 1.5px solid #3B82F6;
      flex-shrink: 0;
    }
    .card-etat { border-color: #BFDBFE; }
    .card-localisation { border-color: #BFDBFE; }
    .card-temperature { border-color: #BFDBFE; }
    .card-tension { border-color: #BFDBFE; }
    .card-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      color: #94A3B8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .card-value { font-size: 18px; font-weight: 600; color: #1E293B; }
    .card-meta { font-size: 12px; color: #94A3B8; }
    .coords-value { font-size: 13px; font-weight: 600; color: #3B82F6; }
    .card-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 500;
      background: #3B82F6;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.15s ease;
      width: fit-content;
    }
    .card-link:hover { background: #1D4ED8; }
    .card-empty { font-size: 14px; color: #94A3B8; font-style: italic; }

    /* Diagnostic */
    .diagnostic-block {
      background: #FFFFFF;
      border: 1px solid #BFDBFE;
      border-radius: 12px;
      padding: 20px;
    }
    .diag-header { display: flex; align-items: center; gap: 10px; }
    .diag-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 1.5px solid #3B82F6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #3B82F6;
      flex-shrink: 0;
    }
    .diag-grid { display: flex; flex-direction: column; gap: 0; margin-top: 16px; }
    .diag-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      margin-bottom: 8px;
      background: #FAFBFF;
    }
    .diag-row:last-child { margin-bottom: 0; }
    .diag-key { font-size: 13px; color: #64748B; font-weight: 500; }
    .diag-val { font-size: 14px; color: #1E293B; font-weight: 500; }

    /* Empty state */
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #6B7280; text-align: center; }
    .empty-icon { font-size: 36px; color: #9CA3AF; }

    /* Responsive */
    @media (max-width: 768px) {
      .info-grid { grid-template-columns: 1fr; }
      .equip-title-row { flex-direction: column; align-items: flex-start; gap: 8px; }
    }
  `]
})
export class EquipmentDetailPageComponent implements OnInit {
  equipment: Equipment | null = null;
  diagnostic: EquipmentDiagnostic = { etat: 'État normal', gravite: '—', anomalie: null };
  source: 'equipment' | 'alerts' | 'maintenance' = 'equipment';
  isAlertTaken = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipmentService: EquipmentService,
    private maintenanceService: MaintenanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const imei = this.route.snapshot.paramMap.get('imei');
    const sourceParam = this.route.snapshot.queryParamMap.get('source');
    if (sourceParam === 'alerts') {
      this.source = 'alerts';
    } else if (sourceParam === 'maintenance') {
      this.source = 'maintenance';
    }

    if (imei) {
      const eq = this.equipmentService.getByImei(imei);
      if (eq) {
        this.equipment = eq;
        this.diagnostic = this.equipmentService.getDiagnostic(eq);
        this.checkAlertStatus();
      }
    }
  }

  private checkAlertStatus(): void {
    if (!this.equipment) return;
    const maintenanceItems = this.maintenanceService.getItems();
    const item = maintenanceItems.find(i => i.equipment === this.equipment!.nom);
    this.isAlertTaken = item?.prisPar != null;
  }

  get backButtonText(): string {
    switch (this.source) {
      case 'alerts': return 'Retour aux alertes';
      case 'maintenance': return 'Retour à la maintenance';
      default: return 'Retour au parc d\'équipement';
    }
  }

  retour(): void {
    switch (this.source) {
      case 'alerts':
        this.router.navigate(['/alerts']);
        break;
      case 'maintenance':
        this.router.navigate(['/maintenance']);
        break;
      default:
        this.router.navigate(['/location']);
    }
  }

  prendreAlerte(): void {
    if (!this.equipment) return;
    const maintenanceItems = this.maintenanceService.getItems();
    const item = maintenanceItems.find(i => i.equipment === this.equipment!.nom);
    if (item && !item.prisPar) {
      const userName = this.authService.getUser()?.name || 'Utilisateur';
      this.maintenanceService.prendreAlerte(item.id, userName);
      this.isAlertTaken = true;
    }
  }

  inspecter(): void {
    this.router.navigate(['/maintenance']);
  }
}