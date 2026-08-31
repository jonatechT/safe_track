import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { EquipmentService, Equipment } from '../../services/equipment.service';

@Component({
  selector: 'app-equipment-list-page',
  standalone: true,
  imports: [BasePageComponent],
  template: `
    <app-base-page
      title="Parc d'équipement"
      subtitle="Suivi en temps réel de vos équipements sur la carte."
      icon="fa-solid fa-location-dot"
    >
      <div class="equip-content">
        <!-- KPI Cards (identiques à l'existant) -->
        <div class="stat-grid">
          <div class="stat-card" style="background: #DBEAFE; border-color: rgba(59, 130, 246, 0.24);">
            <div class="stat-main">
              <span class="stat-label">Équipements localisés</span>
              <span class="stat-value"><strong>100</strong></span>
            </div>
            <i class="fa-solid fa-cube stat-icon" style="color: #3B82F6;"></i>
          </div>
          <div class="stat-card" style="background: #FEE2E2; border-color: rgba(239, 68, 68, 0.24);">
            <div class="stat-main">
              <span class="stat-label">Hors ligne</span>
              <span class="stat-value"><strong>18</strong></span>
            </div>
            <i class="fa-solid fa-wifi stat-icon" style="color: #EF4444;"></i>
          </div>
          <div class="stat-card" style="background: #D1FAE5; border-color: rgba(16, 185, 129, 0.24);">
            <div class="stat-main">
              <span class="stat-label">En ligne</span>
              <span class="stat-value"><strong>82</strong></span>
            </div>
            <i class="fa-solid fa-wifi stat-icon" style="color: #10B981;"></i>
          </div>
        </div>

<!-- Tableau : Équipement | IMEI | Mise en ligne | Détail (bouton "Voir") -->
        <div class="table-card">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>IMEI</th>
                  <th>Mise en ligne</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                @for (eq of equipments; track eq.imei) {
                  <tr class="row-clickable" (click)="ouvrirDetail(eq.imei)">
                    <td>
                      <div class="equipment-cell">
                        <span class="equipment-name">{{ eq.nom }}</span>
                      </div>
                    </td>
                    <td><span class="imei-code">{{ eq.imei }}</span></td>
                    <td><span class="sync-time">{{ eq.miseEnLigne }}</span></td>
                    <td class="detail-cell">
                      <button class="btn-detail" (click)="ouvrirDetail(eq.imei); $event.stopPropagation()">
                        Voir
                      </button>
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
    .equip-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
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
    .stat-icon { font-size: 20px; flex-shrink: 0; }

    /* ===== Tableau (design conservé) ===== */
    .table-card { background: transparent; border: none; border-radius: 0; padding: 0; overflow: visible; box-shadow: none; }
    .table-wrapper { overflow-x: auto; border: none; border-radius: 0; }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px; }

    .data-table thead th {
      text-align: left;
      padding: 14px 18px;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background-color: #2563EB;
      border-bottom: 1px solid #2563EB;
      vertical-align: middle;
    }
    .data-table thead th:first-child { border-radius: 8px 0 0 8px; }
    .data-table thead th:last-child { border-radius: 0 8px 8px 0; text-align: right; }

    .data-table tbody tr { transition: background-color 0.15s ease, border-color 0.15s ease; background-color: #FFFFFF; }
    .data-table tbody td {
      background-color: #FFFFFF;
      padding: 16px 18px;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
      font-weight: 400;
      font-size: 14px;
      vertical-align: middle;
    }
    .data-table tbody td:first-child { border-left: 1px solid #E2E8F0; border-radius: 8px 0 0 8px; }
    .data-table tbody td:last-child { border-right: 1px solid #E2E8F0; border-radius: 0 8px 8px 0; text-align: right; }
    .detail-cell { white-space: nowrap; }

    /* Ligne cliquable */
    .row-clickable { cursor: pointer; }
    .row-clickable:hover td { background-color: #F8FAFC; border-color: #BFDBFE; }

    .equipment-cell { display: flex; align-items: center; gap: 10px; }
    .equipment-name { font-weight: 600; color: #1E293B; font-size: 15px; }
    .imei-code { font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace; font-size: 14px; font-weight: 500; color: #475569; letter-spacing: 0.3px; }
    .sync-time { color: #64748B; font-size: 14px; }
    /* Bouton Voir (petit badge bleu autour du mot) */
    .btn-detail {
      background-color: transparent;
      color: #2563EB;
      border: 1px solid #2563EB;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .btn-detail:hover { background-color: #2563EB; color: #FFFFFF; }

    @media (max-width: 1024px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class EquipmentListPageComponent {
  equipments: Equipment[] = [];

  constructor(
    private equipmentService: EquipmentService,
    private router: Router
  ) {
    this.equipments = this.equipmentService.getAll();
  }

  ouvrirDetail(imei: string): void {
    this.router.navigate(['/equipements', imei]);
  }
}