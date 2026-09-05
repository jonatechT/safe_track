import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BasePageComponent } from '../base-page/base-page';
import { EquipmentService, Equipment } from '../../services/equipment.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-equipment-list-page',
  standalone: true,
  imports: [BasePageComponent],
  template: `
    <app-base-page
      [title]="pageTitle"
      [subtitle]="pageSubtitle"
      icon="fa-solid fa-location-dot"
    >
      <div page-actions>
        @if (canAddEquipment()) {
          <button type="button" class="equip-add-btn" (click)="ajouterEquipement()">
            <i class="fa-solid fa-plus"></i>
            <span>Ajouter un équipement</span>
          </button>
        }
      </div>
      <div class="equip-content">
        <!-- KPI Cards -->
        <div class="stat-grid">
          <div class="stat-card" style="background: #DBEAFE; border-color: rgba(59, 130, 246, 0.24);">
            <div class="stat-main">
              <span class="stat-label">{{ enLigneMode ? 'Équipements non bloqués' : 'Équipements localisés' }}</span>
              <span class="stat-value"><strong>{{ kpiLocalises }}</strong></span>
            </div>
            <i class="fa-solid fa-cube stat-icon" style="color: #3B82F6;"></i>
          </div>
          <div class="stat-card" style="background: #FEE2E2; border-color: rgba(239, 68, 68, 0.24);">
            <div class="stat-main">
              <span class="stat-label">Bloqués</span>
              <span class="stat-value"><strong>{{ kpiBloques }}</strong></span>
            </div>
            <i class="fa-solid fa-lock stat-icon" style="color: #EF4444;"></i>
          </div>
          <div class="stat-card" style="background: #D1FAE5; border-color: rgba(16, 185, 129, 0.24);">
            <div class="stat-main">
              <span class="stat-label">En ligne</span>
              <span class="stat-value"><strong>{{ enLigneMode ? kpiLocalises : kpiEnLigne }}</strong></span>
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
                @for (eq of equipments; track eq.imei; let i = $index) {
                  <tr class="row-clickable equip-row-animate" [style.animation-delay.ms]="70 * i" (click)="ouvrirDetail(eq.imei)">
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

    /* ===== Apparition en cascade des lignes (comme les autres listes Safe Track) ===== */
    .equip-row-animate {
      animation: equipRowIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes equipRowIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .equip-row-animate {
        animation: none !important;
      }
    }

    /* Bouton d'ajout d'équipement (en-tête de page) */
    .equip-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 13.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      white-space: nowrap;
    }
    .equip-add-btn:hover {
      background: #1D4ED8;
      transform: translateY(-1px);
    }
    .equip-add-btn i { font-size: 13px; }

    @media (max-width: 1024px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class EquipmentListPageComponent {
  /** Liste affichée (filtrée en mode « en ligne » : seuls les équipements non bloqués). */
  equipments: Equipment[] = [];
  /** Vrai quand la page est affichée via la route /location/en-ligne. */
  enLigneMode = false;

  /** Titre / sous-titre adaptés au mode. */
  pageTitle = "Parc d'équipement";
  pageSubtitle = 'Suivi en temps réel de vos équipements sur la carte.';

  /** Valeurs KPI — en mode normal, conservées telles qu'elles étaient affichées. */
  kpiLocalises = 100;
  kpiBloques = 0;
  kpiEnLigne = 82;

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.enLigneMode = this.route.snapshot.data['enLigne'] === true;

    const all = this.equipmentService.getAll();
    if (this.enLigneMode) {
      // Seuls les équipements non bloqués apparaissent sur cette page.
      this.equipments = all.filter(e => !e.bloque);
      this.pageTitle = 'Équipements en ligne';
      this.pageSubtitle = 'Équipements du parc actuellement non bloqués.';
      this.kpiLocalises = all.length;
      this.kpiBloques = all.filter(e => e.bloque).length;
    } else {
      this.equipments = all;
    }
  }

  ouvrirDetail(imei: string): void {
    this.router.navigate(['/equipements', imei]);
  }

  /** Seuls SUPERADMIN et ADMIN_STRUCTURE peuvent ajouter un équipement. */
  canAddEquipment(): boolean {
    return this.authService.isSuperAdmin() || this.authService.isStructureAdmin();
  }

  ajouterEquipement(): void {
    this.router.navigate(['/equipements/nouveau']);
  }
}