import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EquipmentService, Equipment, EquipmentDiagnostic, BatteryDiagnostic } from '../../services/equipment.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';

/**
 * MOCK TEMPORAIRE — Prévisualisation de la carte « Diagnostic batterie ».
 * À supprimer lorsque l'API backend fournira les données réelles.
 * Remplacer alors par : this.batteryDiagnostic = equipment.batteryDiagnostic;
 */
const mockBatteryDiagnostic: BatteryDiagnostic = {
  etat: 'A_remplacer',
  duree_estimee_jours: 77,
  duree_min_jours: 36,
  duree_max_jours: 118,
  priorite: 'Haute',
  message: 'Batterie en fin de vie - planifier le remplacement !'
};

@Component({
  selector: 'app-equipment-detail-page',
  standalone: true,
  imports: [],
  template: `
    <div class="eqd-shell">
      <!-- ===== Header premium ===== -->
      <header class="eqd-header">
        <div class="eqd-header-text">
          <span class="eqd-eyebrow">
            <i class="fa-solid fa-solar-panel"></i>
            Parc d'équipement
          </span>
          <h1 class="eqd-title">Détail de l'équipement</h1>
          <p class="eqd-subtitle">Informations techniques et diagnostic en temps réel.</p>
        </div>
        <div class="eqd-header-actions">
          @if (source === 'alerts' && !isAlertTaken) {
            <button type="button" class="eqd-btn eqd-btn-primary" (click)="prendreAlerte()">
              <i class="fa-solid fa-bell"></i>
              <span>Prendre l'alerte</span>
            </button>
          } @else if (source === 'maintenance') {
            <button type="button" class="eqd-btn eqd-btn-primary" (click)="inspecter()">
              <i class="fa-solid fa-screwdriver-wrench"></i>
              <span>Inspecter</span>
            </button>
          }
          <button type="button" class="eqd-btn eqd-btn-ghost" (click)="retour()">
            <i class="fa-solid fa-arrow-left"></i>
            <span>{{ backButtonText }}</span>
          </button>
        </div>
      </header>

      @if (!equipment) {
        <!-- ===== État vide ===== -->
        <section class="eqd-empty">
          <span class="eqd-empty-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
          <p class="eqd-empty-text">Équipement introuvable.</p>
          <button type="button" class="eqd-btn eqd-btn-ghost" (click)="retour()">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Retour</span>
          </button>
        </section>
      } @else {
        <!-- ===== Carte résumé de l'équipement ===== -->
        <section class="eqd-summary">
          <div class="eqd-summary-main">
            <span class="eqd-summary-icon"><i [class]="'fa-solid ' + typeIcon"></i></span>
            <div class="eqd-summary-info">
              <h2 class="eqd-summary-name">{{ equipment.nom }}</h2>
              <div class="eqd-summary-imei">
                <span class="eqd-imei-chip">IMEI</span>
                <span class="eqd-imei-value">{{ equipment.imei }}</span>
              </div>
            </div>
          </div>
          <div class="eqd-summary-side">
            <span [class]="'eqd-badge eqd-badge-lg ' + statusClass">
              <span class="eqd-badge-dot"></span>
              {{ equipment.statut }}
            </span>
            <span class="eqd-summary-sync">
              <i class="fa-regular fa-clock"></i>
              Dernière synchro : {{ equipment.miseEnLigne }}
            </span>
          </div>
        </section>

        <!-- ===== Grille des indicateurs ===== -->
        <section class="eqd-grid">
          <!-- État -->
          <article class="eqd-card">
            <div class="eqd-card-head">
              <span class="eqd-chip eqd-chip-blue"><i class="fa-solid fa-signal"></i></span>
              <span class="eqd-card-label">État</span>
            </div>
            <div class="eqd-card-value">{{ equipment.statut }}</div>
            <div class="eqd-card-meta">Dernière synchro : {{ equipment.miseEnLigne }}</div>
          </article>

          <!-- Localisation -->
          <article class="eqd-card">
            <div class="eqd-card-head">
              <span class="eqd-chip eqd-chip-purple"><i class="fa-solid fa-location-dot"></i></span>
              <span class="eqd-card-label">Localisation</span>
            </div>
            <div class="eqd-card-value eqd-coords">{{ equipment.localisation }}</div>
            <a
              class="eqd-maps-btn"
              [href]="'https://www.google.com/maps?q=' + equipment.lienLocalisation"
              target="_blank"
              rel="noopener"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Voir sur Google Maps</span>
            </a>
          </article>

          <!-- Température -->
          <article class="eqd-card">
            <div class="eqd-card-head">
              <span class="eqd-chip eqd-chip-cyan"><i class="fa-solid fa-temperature-half"></i></span>
              <span class="eqd-card-label">Température</span>
            </div>
            @if (equipment.temperature !== null) {
              <div class="eqd-card-value">{{ equipment.temperature }} °C</div>
            } @else {
              <div class="eqd-card-value eqd-value-empty">—</div>
              <div class="eqd-card-foot">
                <span class="eqd-badge eqd-badge-neutral">Donnée non disponible</span>
                <span class="eqd-card-meta">Aucun capteur disponible</span>
              </div>
            }
          </article>

          <!-- Tension -->
          <article class="eqd-card">
            <div class="eqd-card-head">
              <span class="eqd-chip eqd-chip-green"><i class="fa-solid fa-bolt"></i></span>
              <span class="eqd-card-label">Tension</span>
            </div>
            @if (equipment.tension !== null) {
              <div class="eqd-card-value">{{ equipment.tension }} V</div>
            } @else {
              <div class="eqd-card-value eqd-value-empty">—</div>
              <div class="eqd-card-foot">
                <span class="eqd-badge eqd-badge-neutral">Donnée non disponible</span>
                <span class="eqd-card-meta">Aucun capteur disponible</span>
              </div>
            }
          </article>
        </section>

        <!-- ===== Carte diagnostic batterie ===== -->
        <section class="eqd-battery-diag">
          <header class="eqd-bdiag-head">
            <span class="eqd-chip eqd-chip-purple eqd-chip-lg"><i class="fa-solid fa-battery-full"></i></span>
            <div class="eqd-bdiag-head-text">
              <h3 class="eqd-bdiag-title">Diagnostic batterie</h3>
              <p class="eqd-bdiag-sub">Analyse automatique de l'état de la batterie</p>
            </div>
            @if (batteryDiagnostic) {
              <span [class]="'eqd-badge eqd-badge-lg ' + batteryStateBadgeClass">
                {{ batteryEtatDisplay }}
              </span>
            }
          </header>

          @if (!batteryDiagnostic) {
            <!-- ===== Diagnostic indisponible ===== -->
            <div class="eqd-bdiag-unavailable">
              <span class="eqd-bdiag-unavail-icon"><i class="fa-solid fa-circle-info"></i></span>
              <h4 class="eqd-bdiag-unavail-title">Diagnostic indisponible</h4>
              <p class="eqd-bdiag-unavail-text">
                Le diagnostic automatique n'est actuellement pas disponible.
              </p>
            </div>
          } @else {
            <!-- ===== Grille état / priorité ===== -->
            <div class="eqd-bdiag-grid">
              <div class="eqd-bdiag-stat-card">
                <span class="eqd-bdiag-stat-key">ÉTAT</span>
                <div class="eqd-bdiag-stat-value">
                  <span class="eqd-bdiag-state-icon" [class]="batteryStateIconClass">
                    <i [class]="batteryStateIcon"></i>
                  </span>
                  <span>{{ batteryEtatDisplay }}</span>
                </div>
                <span class="eqd-bdiag-state-hint">{{ batteryStateHint }}</span>
              </div>
              <div class="eqd-bdiag-stat-card">
                <span class="eqd-bdiag-stat-key">PRIORITÉ</span>
                <div class="eqd-bdiag-stat-value">
                  <span [class]="'eqd-badge eqd-badge-lg ' + batteryPriorityBadgeClass">
                    {{ batteryDiagnostic.priorite }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ===== Durée de vie estimée ===== -->
            <div class="eqd-bdiag-duration">
              <span class="eqd-bdiag-dur-key">Durée de vie estimée</span>
              <div class="eqd-bdiag-dur-main">
                <span class="eqd-bdiag-dur-value">~{{ batteryDiagnostic.duree_estimee_jours }} jours</span>
                <span class="eqd-bdiag-dur-range">
                  Entre {{ batteryDiagnostic.duree_min_jours }} et {{ batteryDiagnostic.duree_max_jours }} jours
                </span>
              </div>
            </div>

            <!-- ===== Message ===== -->
            <div [class]="'eqd-bdiag-message ' + batteryMessageClass">
              <span class="eqd-bdiag-msg-icon"><i [class]="batteryMessageIcon"></i></span>
              <span class="eqd-bdiag-msg-text">{{ batteryDiagnostic.message }}</span>
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    /* ==========================================================
       Page Détail de l'équipement — Dashboard SaaS premium
       Canvas lavande très clair + cartes blanches flottantes
       ========================================================== */

    :host {
      display: block;
      min-height: calc(100vh - 96px);
      padding: 26px 26px 34px;
      border-radius: 24px;
      background: #FFFFFF;
      box-sizing: border-box;
    }

    .eqd-shell {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ===== Header ===== */
    .eqd-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }

    .eqd-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 13px;
      border-radius: 999px;
      background: rgba(79, 124, 255, 0.10);
      border: 1px solid rgba(79, 124, 255, 0.18);
      color: #4F7CFF;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    .eqd-title {
      margin: 14px 0 0;
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.8px;
      color: #172033;
    }

    .eqd-subtitle {
      margin: 8px 0 0;
      font-size: 14px;
      color: #7A8499;
    }

    .eqd-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* ===== Boutons ===== */
    .eqd-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 18px;
      border-radius: 12px;
      border: 1px solid transparent;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
    }

    .eqd-btn-ghost {
      background: #FFFFFF;
      color: #3D4A63;
      border-color: rgba(23, 32, 51, 0.08);
      box-shadow: 0 2px 10px rgba(65, 78, 120, 0.06);
    }

    .eqd-btn-ghost:hover {
      background: #FFFFFF;
      color: #172033;
      border-color: rgba(79, 124, 255, 0.28);
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(65, 78, 120, 0.12);
    }

    .eqd-btn-primary {
      background: linear-gradient(135deg, #4F7CFF 0%, #6D4AFF 100%);
      color: #FFFFFF;
      box-shadow: 0 8px 20px rgba(79, 124, 255, 0.30);
    }

    .eqd-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 26px rgba(79, 124, 255, 0.38);
      filter: brightness(1.05);
    }

    /* ===== Carte résumé ===== */
    .eqd-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      background: #FFFFFF;
      border: 1px solid rgba(79, 124, 255, 0.12);
      border-radius: 20px;
      padding: 22px 24px;
      box-shadow: 0 12px 40px rgba(65, 78, 120, 0.10);
    }

    .eqd-summary-main {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }

    .eqd-summary-icon {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: linear-gradient(135deg, #4F7CFF 0%, #6D4AFF 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 10px 24px rgba(79, 124, 255, 0.35);
      flex-shrink: 0;
    }

    .eqd-summary-info { min-width: 0; }

    .eqd-summary-name {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #172033;
    }

    .eqd-summary-imei {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 9px;
      flex-wrap: wrap;
    }

    .eqd-imei-chip {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #6D4AFF;
      background: rgba(109, 74, 255, 0.10);
      border: 1px solid rgba(109, 74, 255, 0.18);
      padding: 2px 9px;
      border-radius: 999px;
    }

    .eqd-imei-value {
      font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.4px;
      color: #55607A;
    }

    .eqd-summary-side {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    .eqd-summary-sync {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #7A8499;
    }

    /* ===== Badges ===== */
    .eqd-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
      width: fit-content;
    }

    .eqd-badge-wrap { white-space: normal; }

    .eqd-badge-lg { padding: 8px 16px; font-size: 13px; }

    .eqd-badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .eqd-badge-danger {
      background: #FEF1F1;
      color: #E5484D;
      border: 1px solid rgba(239, 68, 68, 0.18);
    }

    .eqd-badge-danger .eqd-badge-dot {
      background: #EF4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.60);
    }

    .eqd-badge-warning {
      background: #FFF7E8;
      color: #D97706;
      border: 1px solid rgba(245, 158, 11, 0.20);
    }

    .eqd-badge-warning .eqd-badge-dot {
      background: #F59E0B;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.55);
    }

    .eqd-badge-success {
      background: #E9FBF4;
      color: #0FA97E;
      border: 1px solid rgba(32, 201, 151, 0.22);
    }

    .eqd-badge-success .eqd-badge-dot {
      background: #20C997;
      box-shadow: 0 0 8px rgba(32, 201, 151, 0.55);
    }

    .eqd-badge-neutral {
      background: #F1F3FA;
      color: #7A8499;
      border: 1px solid rgba(122, 132, 153, 0.18);
    }

    .eqd-badge-neutral .eqd-badge-dot {
      background: #A6AFC4;
    }

    /* ===== Grille KPI ===== */
    .eqd-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

    .eqd-card {
      background: #FFFFFF;
      border: 1px solid rgba(23, 32, 51, 0.06);
      border-radius: 18px;
      padding: 20px 22px;
      box-shadow: 0 8px 30px rgba(65, 78, 120, 0.08);
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    .eqd-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(65, 78, 120, 0.12);
      border-color: rgba(79, 124, 255, 0.18);
    }

    .eqd-card-head {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .eqd-chip {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .eqd-chip-lg {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      font-size: 19px;
    }

    .eqd-chip-blue { background: rgba(79, 124, 255, 0.12); color: #4F7CFF; }
    .eqd-chip-purple { background: rgba(109, 74, 255, 0.12); color: #6D4AFF; }
    .eqd-chip-cyan { background: rgba(14, 165, 233, 0.12); color: #0EA5E9; }
    .eqd-chip-green { background: rgba(32, 201, 151, 0.14); color: #12B886; }

    .eqd-card-label {
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #8A93A8;
    }

    .eqd-card-value {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #172033;
      overflow-wrap: anywhere;
    }

    .eqd-coords {
      font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: #3D4A63;
    }

    .eqd-value-empty {
      color: #B9C0D4;
      font-size: 28px;
      line-height: 1;
    }

    .eqd-card-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .eqd-card-meta {
      font-size: 12.5px;
      color: #7A8499;
    }

    .eqd-maps-btn {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 14px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4F7CFF 0%, #6D4AFF 100%);
      color: #FFFFFF;
      font-size: 12.5px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 6px 16px rgba(79, 124, 255, 0.28);
      transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
    }

    .eqd-maps-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(79, 124, 255, 0.36);
      filter: brightness(1.05);
    }

    /* ===== Carte diagnostic ===== */
    .eqd-diagnostic {
      background: #FFFFFF;
      border: 1px solid rgba(23, 32, 51, 0.06);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 12px 40px rgba(65, 78, 120, 0.10);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .eqd-diag-head {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 18px;
      border-bottom: 1px dashed rgba(23, 32, 51, 0.10);
    }

    .eqd-diag-head-text { min-width: 0; }

    .eqd-diag-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #172033;
    }

    .eqd-diag-sub {
      margin: 3px 0 0;
      font-size: 12.5px;
      color: #7A8499;
    }

    .eqd-diag-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .eqd-diag-item {
      background: linear-gradient(160deg, #F8F9FF 0%, #F3F5FE 100%);
      border: 1px solid rgba(79, 124, 255, 0.10);
      border-radius: 14px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .eqd-diag-key {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.9px;
      text-transform: uppercase;
      color: #8A93A8;
    }

    /* ===== Carte diagnostic batterie ===== */
    .eqd-battery-diag {
      background: #FFFFFF;
      border: 1px solid rgba(23, 32, 51, 0.06);
      border-radius: 22px;
      padding: 28px;
      box-shadow: 0 12px 40px rgba(65, 78, 120, 0.10);
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .eqd-bdiag-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding-bottom: 20px;
      border-bottom: 1px dashed rgba(23, 32, 51, 0.10);
    }

    .eqd-bdiag-head-text { min-width: 0; }

    .eqd-bdiag-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: #172033;
    }

    .eqd-bdiag-sub {
      margin: 3px 0 0;
      font-size: 13px;
      color: #7A8499;
    }

    /* ===== Grille état / priorité ===== */
    .eqd-bdiag-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .eqd-bdiag-stat-card {
      background: linear-gradient(160deg, #F8F9FF 0%, #F3F5FE 100%);
      border: 1px solid rgba(79, 124, 255, 0.10);
      border-radius: 16px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .eqd-bdiag-stat-key {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #8A93A8;
    }

    .eqd-bdiag-stat-value {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #172033;
    }

    .eqd-bdiag-state-icon {
      width: 44px;
      height: 44px;
      border-radius: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      transition: background 0.22s ease, color 0.22s ease;
    }

    .eqd-bdiag-state-icon--success {
      background: rgba(32, 201, 151, 0.12);
      color: #12B886;
    }

    .eqd-bdiag-state-icon--warning {
      background: rgba(245, 158, 11, 0.12);
      color: #D97706;
    }

    .eqd-bdiag-state-icon--danger {
      background: rgba(239, 68, 68, 0.12);
      color: #E5484D;
    }

    .eqd-bdiag-state-icon--neutral {
      background: rgba(122, 132, 153, 0.12);
      color: #7A8499;
    }

    .eqd-bdiag-state-hint {
      font-size: 12.5px;
      color: #7A8499;
      margin-top: 2px;
    }

    /* ===== Durée de vie estimée ===== */
    .eqd-bdiag-duration {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .eqd-bdiag-dur-key {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #8A93A8;
    }

    .eqd-bdiag-dur-main {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .eqd-bdiag-dur-value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.8px;
      color: #172033;
    }

    .eqd-bdiag-dur-range {
      font-size: 13.5px;
      color: #7A8499;
    }

    /* ===== Message ===== */
    .eqd-bdiag-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 18px 20px;
      border-radius: 16px;
      border: 1px solid rgba(23, 32, 51, 0.06);
      font-size: 14px;
      line-height: 1.5;
      color: #3D4A63;
    }

    .eqd-bdiag-msg-icon {
      width: 36px;
      height: 36px;
      border-radius: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .eqd-bdiag-msg-text {
      flex: 1;
      min-width: 0;
      word-break: break-word;
    }

    .eqd-bdiag-msg--success {
      background: rgba(32, 201, 151, 0.06);
      border-color: rgba(32, 201, 151, 0.18);
    }

    .eqd-bdiag-msg--success .eqd-bdiag-msg-icon {
      background: rgba(32, 201, 151, 0.12);
      color: #12B886;
    }

    .eqd-bdiag-msg--warning {
      background: rgba(245, 158, 11, 0.06);
      border-color: rgba(245, 158, 11, 0.18);
    }

    .eqd-bdiag-msg--warning .eqd-bdiag-msg-icon {
      background: rgba(245, 158, 11, 0.12);
      color: #D97706;
    }

    .eqd-bdiag-msg--danger {
      background: rgba(239, 68, 68, 0.06);
      border-color: rgba(239, 68, 68, 0.18);
    }

    .eqd-bdiag-msg--danger .eqd-bdiag-msg-icon {
      background: rgba(239, 68, 68, 0.12);
      color: #E5484D;
    }

    .eqd-bdiag-msg--neutral {
      background: rgba(122, 132, 153, 0.06);
      border-color: rgba(122, 132, 153, 0.18);
    }

    .eqd-bdiag-msg--neutral .eqd-bdiag-msg-icon {
      background: rgba(122, 132, 153, 0.12);
      color: #7A8499;
    }

    /* ===== Diagnostic indisponible ===== */
    .eqd-bdiag-unavailable {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
      padding: 32px 20px;
    }

    .eqd-bdiag-unavail-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: rgba(122, 132, 153, 0.10);
      color: #7A8499;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .eqd-bdiag-unavail-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #172033;
    }

    .eqd-bdiag-unavail-text {
      margin: 0;
      font-size: 13.5px;
      color: #7A8499;
      max-width: 420px;
    }

    /* ===== État vide ===== */
    .eqd-empty {
      background: #FFFFFF;
      border: 1px solid rgba(23, 32, 51, 0.06);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(65, 78, 120, 0.08);
      padding: 56px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
    }

    .eqd-empty-icon {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      background: rgba(239, 68, 68, 0.10);
      color: #EF4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .eqd-empty-text {
      margin: 0;
      font-size: 14.5px;
      color: #7A8499;
    }

    /* ===== Responsive ===== */
    @media (max-width: 900px) {
      .eqd-diag-grid { grid-template-columns: 1fr; }
      .eqd-bdiag-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      :host {
        padding: 18px 16px 26px;
        border-radius: 18px;
        min-height: calc(100vh - 84px);
      }

      .eqd-header {
        flex-direction: column;
        align-items: stretch;
      }

      .eqd-title { font-size: 24px; }

      .eqd-header-actions { width: 100%; }

      .eqd-header-actions .eqd-btn { flex: 1 1 auto; }

      .eqd-summary {
        flex-direction: column;
        align-items: flex-start;
      }

      .eqd-summary-side {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        flex-wrap: wrap;
      }

      .eqd-battery-diag { padding: 22px; }
    }

    @media (max-width: 560px) {
      .eqd-grid { grid-template-columns: 1fr; }

      .eqd-title { font-size: 22px; }

      .eqd-summary-icon {
        width: 48px;
        height: 48px;
        font-size: 19px;
      }

      .eqd-card-value { font-size: 20px; }

      .eqd-battery-diag { padding: 20px; }

      .eqd-bdiag-head {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .eqd-bdiag-dur-value { font-size: 26px; }
    }

    @media (max-width: 400px) {
      :host { padding: 14px 12px 22px; }

      .eqd-summary { padding: 18px; }

      .eqd-card { padding: 18px; }

      .eqd-diagnostic { padding: 18px; }

      .eqd-battery-diag { padding: 18px; }
    }
  `]
})
export class EquipmentDetailPageComponent implements OnInit {
  equipment: Equipment | null = null;
  diagnostic: EquipmentDiagnostic = { etat: 'État normal', gravite: '—', anomalie: null };
  batteryDiagnostic: BatteryDiagnostic | null = null;
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

    // MOCK TEMPORAIRE — À remplacer par les données réelles du backend :
    // this.batteryDiagnostic = this.equipment?.batteryDiagnostic ?? null;
    this.batteryDiagnostic = mockBatteryDiagnostic;
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

  /** Icône selon le type d'équipement (présentation uniquement) */
  get typeIcon(): string {
    switch (this.equipment?.type) {
      case 'Kit solaire': return 'fa-solar-panel';
      case 'Véhicule': return 'fa-truck-fast';
      case 'Engin minier': return 'fa-helmet-safety';
      default: return 'fa-microchip';
    }
  }

  /** Classe de badge du statut (présentation uniquement) */
  get statusClass(): string {
    switch (this.equipment?.statut) {
      case 'En alerte': return 'eqd-badge-danger';
      case 'Inspection': return 'eqd-badge-warning';
      default: return 'eqd-badge-success';
    }
  }

  /** Classe de badge de l'état du diagnostic */
  get etatBadgeClass(): string {
    const etat = this.diagnostic.etat;
    if (etat.includes('Anomalie')) return 'eqd-badge-danger';
    if (etat.includes('Inspection')) return 'eqd-badge-warning';
    return 'eqd-badge-success';
  }

  /** Classe de badge de la gravité */
  get graviteBadgeClass(): string {
    switch (this.diagnostic.gravite) {
      case 'Élevée': return 'eqd-badge-danger';
      case 'Moyenne': return 'eqd-badge-warning';
      default: return 'eqd-badge-neutral';
    }
  }

  /** Classe de badge de l'anomalie */
  get anomalieBadgeClass(): string {
    if (!this.diagnostic.anomalie) return 'eqd-badge-neutral';
    return this.diagnostic.anomalie.includes('Alerte') ? 'eqd-badge-danger' : 'eqd-badge-warning';
  }

  /* ===== Getters pour le diagnostic batterie ===== */

  /** Affichage de l'état de la batterie (A_remplacer → À remplacer) */
  get batteryEtatDisplay(): string {
    if (!this.batteryDiagnostic) return '';
    return this.batteryDiagnostic.etat === 'A_remplacer' ? 'À remplacer' : this.batteryDiagnostic.etat;
  }

  /** Classe de badge de l'état de la batterie */
  get batteryStateBadgeClass(): string {
    if (!this.batteryDiagnostic) return 'eqd-badge-neutral';
    switch (this.batteryDiagnostic.etat) {
      case 'Bon': return 'eqd-badge-success';
      case 'Surveiller': return 'eqd-badge-warning';
      case 'A_remplacer': return 'eqd-badge-danger';
      default: return 'eqd-badge-neutral';
    }
  }

  /** Classe du conteneur d'icône d'état */
  get batteryStateIconClass(): string {
    if (!this.batteryDiagnostic) return 'eqd-bdiag-state-icon--neutral';
    switch (this.batteryDiagnostic.etat) {
      case 'Bon': return 'eqd-bdiag-state-icon--success';
      case 'Surveiller': return 'eqd-bdiag-state-icon--warning';
      case 'A_remplacer': return 'eqd-bdiag-state-icon--danger';
      default: return 'eqd-bdiag-state-icon--neutral';
    }
  }

  /** Icône FontAwesome selon l'état de la batterie */
  get batteryStateIcon(): string {
    if (!this.batteryDiagnostic) return 'fa-solid fa-battery';
    switch (this.batteryDiagnostic.etat) {
      case 'Bon': return 'fa-solid fa-battery-full';
      case 'Surveiller': return 'fa-solid fa-battery-quarter';
      case 'A_remplacer': return 'fa-solid fa-battery-empty';
      default: return 'fa-solid fa-battery';
    }
  }

  /** Message d'information sous l'état de la batterie */
  get batteryStateHint(): string {
    if (!this.batteryDiagnostic) return '';
    switch (this.batteryDiagnostic.etat) {
      case 'Bon': return 'Aucune action particulière nécessaire.';
      case 'Surveiller': return 'Surveillance régulière recommandée.';
      case 'A_remplacer': return 'Planifier le remplacement de la batterie.';
      default: return '';
    }
  }

  /** Classe de badge de la priorité */
  get batteryPriorityBadgeClass(): string {
    if (!this.batteryDiagnostic) return 'eqd-badge-neutral';
    const p = this.batteryDiagnostic.priorite.toUpperCase();
    if (p.includes('HAUT') || p.includes('ÉLEVÉE') || p.includes('CRITIQUE')) return 'eqd-badge-danger';
    if (p.includes('MOYENNE') || p.includes('MEDIUM')) return 'eqd-badge-warning';
    return 'eqd-badge-neutral';
  }

  /** Classe du conteneur de message */
  get batteryMessageClass(): string {
    if (!this.batteryDiagnostic) return '';
    switch (this.batteryDiagnostic.etat) {
      case 'Bon': return 'eqd-bdiag-msg--success';
      case 'Surveiller': return 'eqd-bdiag-msg--warning';
      case 'A_remplacer': return 'eqd-bdiag-msg--danger';
      default: return 'eqd-bdiag-msg--neutral';
    }
  }

  /** Icône du message */
  get batteryMessageIcon(): string {
    if (!this.batteryDiagnostic) return 'fa-solid fa-circle-info';
    switch (this.batteryDiagnostic.etat) {
      case 'Bon': return 'fa-solid fa-check-circle';
      case 'Surveiller': return 'fa-solid fa-exclamation-triangle';
      case 'A_remplacer': return 'fa-solid fa-circle-exclamation';
      default: return 'fa-solid fa-circle-info';
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