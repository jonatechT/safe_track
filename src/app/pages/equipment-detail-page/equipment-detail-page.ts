import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  EquipmentService,
  Equipment,
  EquipmentDiagnostic,
  BatteryCurrentDiagnostic,
  BatteryHistoryEntry
} from '../../services/equipment.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';
import { BatteryHistoryChartsComponent } from '../../components/battery-history-charts/battery-history-charts';
import { BatteryExportService } from '../../services/battery-export.service';

@Component({
  selector: 'app-equipment-detail-page',
  standalone: true,
  imports: [BatteryHistoryChartsComponent],
  template: `
    <div class="eqd-shell">
      <!-- ===== Header premium ===== -->
      <header class="eqd-header">
        <div class="eqd-header-text">
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

          @if (batteryLoading) {
            <!-- ===== Chargement ===== -->
            <div class="eqd-bdiag-unavailable">
              <span class="eqd-bdiag-unavail-icon"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <h4 class="eqd-bdiag-unavail-title">Chargement du diagnostic…</h4>
              <p class="eqd-bdiag-unavail-text">Récupération des données batterie en cours.</p>
            </div>
          } @else if (!batteryDiagnostic) {
            <!-- ===== Diagnostic indisponible / backend indisponible ===== -->
            <div class="eqd-bdiag-unavailable">
              <span class="eqd-bdiag-unavail-icon"><i class="fa-solid fa-circle-info"></i></span>
              <h4 class="eqd-bdiag-unavail-title">{{ batteryUnavailableTitle }}</h4>
              <p class="eqd-bdiag-unavail-text">{{ batteryUnavailableMessage }}</p>
            </div>
          } @else {
            <!-- ===== Grille état / SOH ===== -->
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
                <span class="eqd-bdiag-stat-key">SOH — État de santé</span>
                <div class="eqd-bdiag-stat-value">
                  <span [class]="'eqd-bdiag-state-icon ' + batteryStateIconClass">
                    <i class="fa-solid fa-heart-pulse"></i>
                  </span>
                  @if (batteryDiagnostic.soh_pourcent !== null && batteryDiagnostic.soh_pourcent !== undefined) {
                    <span>{{ batteryDiagnostic.soh_pourcent }} %</span>
                  } @else {
                    <span>—</span>
                  }
                </div>
                <span class="eqd-bdiag-state-hint">{{ batterySohHint }}</span>
              </div>
            </div>
<!-- ===== Mesures capteurs ===== -->
            <div class="eqd-bdiag-measures">
              <div class="eqd-bdiag-measure">
                <span class="eqd-bdiag-measure-icon eqd-bdiag-measure-icon--blue"><i class="fa-solid fa-bolt"></i></span>
                <div class="eqd-bdiag-measure-text">
                  <span class="eqd-bdiag-measure-key">Tension du pack</span>
                  <span class="eqd-bdiag-measure-value">{{ batteryVoltageDisplay }}</span>
                </div>
              </div>
              <div class="eqd-bdiag-measure">
                <span class="eqd-bdiag-measure-icon eqd-bdiag-measure-icon--green"><i class="fa-solid fa-microchip"></i></span>
                <div class="eqd-bdiag-measure-text">
                  <span class="eqd-bdiag-measure-key">Courant</span>
                  <span class="eqd-bdiag-measure-value">{{ batteryCurrentDisplay }}</span>
                </div>
              </div>
              <div class="eqd-bdiag-measure">
                <span class="eqd-bdiag-measure-icon eqd-bdiag-measure-icon--orange"><i class="fa-solid fa-temperature-half"></i></span>
                <div class="eqd-bdiag-measure-text">
                  <span class="eqd-bdiag-measure-key">Température</span>
                  <span class="eqd-bdiag-measure-value">{{ batteryTemperatureDisplay }}</span>
                </div>
              </div>
              <div class="eqd-bdiag-measure">
                <span class="eqd-bdiag-measure-icon eqd-bdiag-measure-icon--red"><i class="fa-solid fa-arrow-trend-down"></i></span>
                <div class="eqd-bdiag-measure-text">
                  <span class="eqd-bdiag-measure-key">Profondeur de décharge (DoD)</span>
                  <span class="eqd-bdiag-measure-value">{{ batteryDodDisplay }}</span>
                </div>
              </div>
            </div>

            <!-- ===== Capacité + durée de vie ===== -->
            <div class="eqd-bdiag-duration-row">
              <div class="eqd-bdiag-duration">
                <span class="eqd-bdiag-dur-key">Durée de vie estimée</span>
                <div class="eqd-bdiag-dur-main">
                  <span class="eqd-bdiag-dur-value">{{ batteryDurationDisplay }}</span>
                  <span class="eqd-bdiag-dur-range">Estimation fournie par le backend</span>
                </div>
              </div>
              <div class="eqd-bdiag-duration">
                <span class="eqd-bdiag-dur-key">Capacité restante</span>
                <div class="eqd-bdiag-dur-main">
                  <span class="eqd-bdiag-dur-value">{{ batteryCapacityDisplay }}</span>
                  <span class="eqd-bdiag-dur-range">Dernière analyse : {{ batteryDateDisplay }}</span>
                </div>
              </div>
            </div>

            <!-- ===== Message de maintenance ===== -->
            <div [class]="'eqd-bdiag-message ' + batteryMessageClass">
              <span class="eqd-bdiag-msg-icon"><i [class]="batteryMessageIcon"></i></span>
              <span class="eqd-bdiag-msg-text">{{ batteryMessageDisplay }}</span>
            </div>
          }
        </section>
<!-- ===== Historique de la batterie ===== -->
        <section class="eqd-battery-history">
          <header class="eqd-bdiag-head">
            <span class="eqd-chip eqd-chip-blue eqd-chip-lg"><i class="fa-solid fa-chart-line"></i></span>
            <div class="eqd-bdiag-head-text">
              <h3 class="eqd-bdiag-title">Historique de la batterie</h3>
              <p class="eqd-bdiag-sub">Évolution du SOH, de la capacité et de la température.</p>
            </div>
            @if (batteryHistory.length > 0) {
              <div class="eqd-history-actions">
                <button type="button" class="eqd-btn eqd-btn-ghost" (click)="exportCsv()" title="Télécharger l'historique (CSV)">
                  <i class="fa-solid fa-file-csv"></i><span>Télécharger CSV</span>
                </button>
                <button type="button" class="eqd-btn eqd-btn-primary" (click)="exportPdf()" title="Télécharger le rapport (PDF)">
                  <i class="fa-solid fa-file-pdf"></i><span>Télécharger PDF</span>
                </button>
              </div>
            }
          </header>

          @if (batteryHistoryLoading) {
            <div class="eqd-bdiag-unavailable">
              <span class="eqd-bdiag-unavail-icon"><i class="fa-solid fa-spinner fa-spin"></i></span>
              <h4 class="eqd-bdiag-unavail-title">Chargement de l'historique…</h4>
              <p class="eqd-bdiag-unavail-text">Récupération des données d'historique en cours.</p>
            </div>
          } @else if (batteryHistory.length === 0) {
            <div class="eqd-bdiag-unavailable">
              <span class="eqd-bdiag-unavail-icon"><i class="fa-solid fa-clock-rotate-left"></i></span>
              <h4 class="eqd-bdiag-unavail-title">Historique indisponible</h4>
              <p class="eqd-bdiag-unavail-text">
                Aucune donnée d'historique n'est disponible pour cet équipement.
              </p>
            </div>
          } @else {
            <app-battery-history-charts [history]="batteryHistory" />
            @if (exportError) {
              <div class="eqd-export-error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {{ exportError }}
              </div>
            }
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
      padding: 16px 26px 34px;
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
      margin: 0;
      font-size: 26px;
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
      font-size: 24px;
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

    /* ===== Carte historique batterie ===== */
    .eqd-battery-history {
      background: #FFFFFF;
      border: 1px solid rgba(23, 32, 51, 0.06);
      border-radius: 22px;
      padding: 28px;
      box-shadow: 0 12px 40px rgba(65, 78, 120, 0.10);
      display: flex;
      flex-direction: column;
      gap: 22px;
      min-width: 0;
      overflow: hidden;
    }

    .eqd-history-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .eqd-export-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 12px;
      background: #FEF3F2;
      border: 1px solid rgba(229, 72, 77, 0.25);
      color: #B42318;
      font-size: 13px;
      font-weight: 500;
    }

    .eqd-export-error i { color: #E5484D; }

    /* ===== Mesures capteurs ===== */
    .eqd-bdiag-measures {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .eqd-bdiag-measure {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 1px solid rgba(23, 32, 51, 0.06);
      border-radius: 14px;
      padding: 14px 16px;
      min-width: 0;
    }

    .eqd-bdiag-measure-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .eqd-bdiag-measure-icon--blue { background: rgba(79, 124, 255, 0.12); color: #4F7CFF; }
    .eqd-bdiag-measure-icon--green { background: rgba(32, 201, 151, 0.14); color: #12B886; }
    .eqd-bdiag-measure-icon--orange { background: rgba(245, 158, 11, 0.14); color: #D97706; }
    .eqd-bdiag-measure-icon--red { background: rgba(239, 68, 68, 0.12); color: #EF4444; }

    .eqd-bdiag-measure-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .eqd-bdiag-measure-key {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: #8A93A8;
    }

    .eqd-bdiag-measure-value {
      font-size: 17px;
      font-weight: 700;
      color: #172033;
      overflow-wrap: anywhere;
    }

    /* ===== Capacité restante + durée de vie ===== */
    .eqd-bdiag-duration-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    @media (max-width: 900px) {
      .eqd-bdiag-measures { grid-template-columns: 1fr; }
      .eqd-bdiag-duration-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .eqd-history-actions { width: 100%; }
      .eqd-history-actions .eqd-btn { flex: 1 1 auto; }
      .eqd-battery-history { padding: 22px; }
    }

    @media (max-width: 560px) {
      .eqd-battery-history { padding: 20px; }
    }

    @media (max-width: 400px) {
      .eqd-battery-history { padding: 18px; }
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
  batteryDiagnostic: BatteryCurrentDiagnostic | null = null;
  batteryHistory: BatteryHistoryEntry[] = [];
  batteryLoading = false;
  batteryHistoryLoading = false;
  batteryError: string | null = null;
  exportError: string | null = null;
  source: 'equipment' | 'alerts' | 'maintenance' = 'equipment';
  isAlertTaken = false;

  @ViewChild(BatteryHistoryChartsComponent)
  historyCharts?: BatteryHistoryChartsComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipmentService: EquipmentService,
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private batteryExportService: BatteryExportService
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
      // Diagnostic + historique batterie : consommation des endpoints backend.
      // (Le frontend n'exécute aucune prédiction IA.)
      this.loadBatteryDiagnostic(imei);
      this.loadBatteryHistory(imei);
    }
  }

  /** Récupère le diagnostic courant — GET /api/batterie/{device_id}/actuel. */
  private loadBatteryDiagnostic(imei: string): void {
    this.batteryLoading = true;
    this.batteryError = null;
    this.equipmentService.getBatteryCurrentDiagnostic(imei).subscribe({
      next: result => {
        this.batteryLoading = false;
        this.batteryDiagnostic = result;
        this.batteryError = this.equipmentService.batteryApiError();
      },
      error: () => {
        this.batteryLoading = false;
        this.batteryError =
          this.equipmentService.batteryApiError() ??
          'Erreur lors de la récupération du diagnostic batterie.';
      }
    });
  }

  /** Récupère l'historique — GET /api/batterie/{device_id}/historique. */
  private loadBatteryHistory(imei: string): void {
    this.batteryHistoryLoading = true;
    this.equipmentService.getBatteryHistory(imei).subscribe({
      next: list => {
        this.batteryHistoryLoading = false;
        this.batteryHistory = list;
      },
      error: () => {
        this.batteryHistoryLoading = false;
        this.batteryHistory = [];
      }
    });
  }

  /** Titre de l'état « diagnostic indisponible » (backend indisponible vs absence de données). */
  get batteryUnavailableTitle(): string {
    if (this.batteryError) return 'Diagnostic momentanément indisponible';
    return 'Diagnostic indisponible';
  }

  get batteryUnavailableMessage(): string {
    if (this.batteryError) return this.batteryError;
    return "Aucune donnée de diagnostic n'est disponible pour cet équipement.";
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

  /**
   * État effectif affiché : la valeur `etat` fournie par le backend est
   * prioritaire ; à défaut, on applique les seuils SOH comme règle d'affichage
   * (SOH ≥ 80 → Bon, 70 ≤ SOH < 80 → Surveiller, SOH < 70 → À remplacer).
   */
  private get effectiveEtat(): string {
    const etatApi = this.batteryDiagnostic?.etat;
    if (etatApi) return this.normalizeEtat(etatApi);
    const soh = this.batteryDiagnostic?.soh_pourcent;
    if (soh === null || soh === undefined) return 'Indéterminé';
    if (soh >= 80) return 'Bon';
    if (soh >= 70) return 'Surveiller';
    return 'À remplacer';
  }

  private normalizeEtat(etat: string | null | undefined): string {
    if (!etat) return 'Indéterminé';
    return etat === 'A_remplacer' ? 'À remplacer' : etat;
  }

  /** Affichage de l'état de la batterie (A_remplacer → À remplacer). */
  get batteryEtatDisplay(): string {
    if (!this.batteryDiagnostic) return '';
    return this.effectiveEtat;
  }

  /** Classe de badge de l'état de la batterie. */
  get batteryStateBadgeClass(): string {
    if (!this.batteryDiagnostic) return 'eqd-badge-neutral';
    switch (this.effectiveEtat) {
      case 'Bon': return 'eqd-badge-success';
      case 'Surveiller': return 'eqd-badge-warning';
      case 'À remplacer': return 'eqd-badge-danger';
      default: return 'eqd-badge-neutral';
    }
  }

  /** Classe du conteneur d'icône d'état. */
  get batteryStateIconClass(): string {
    if (!this.batteryDiagnostic) return 'eqd-bdiag-state-icon--neutral';
    switch (this.effectiveEtat) {
      case 'Bon': return 'eqd-bdiag-state-icon--success';
      case 'Surveiller': return 'eqd-bdiag-state-icon--warning';
      case 'À remplacer': return 'eqd-bdiag-state-icon--danger';
      default: return 'eqd-bdiag-state-icon--neutral';
    }
  }

  /** Icône FontAwesome selon l'état de la batterie. */
  get batteryStateIcon(): string {
    if (!this.batteryDiagnostic) return 'fa-solid fa-battery';
    switch (this.effectiveEtat) {
      case 'Bon': return 'fa-solid fa-battery-full';
      case 'Surveiller': return 'fa-solid fa-battery-quarter';
      case 'À remplacer': return 'fa-solid fa-battery-empty';
      default: return 'fa-solid fa-battery';
    }
  }

  /** Message d'information sous l'état de la batterie. */
  get batteryStateHint(): string {
    if (!this.batteryDiagnostic) return '';
    switch (this.effectiveEtat) {
      case 'Bon': return 'Aucune action particulière nécessaire.';
      case 'Surveiller': return 'Surveillance régulière recommandée.';
      case 'À remplacer': return 'Planifier le remplacement de la batterie.';
      default: return '';
    }
  }

  /** Rappel visuel des seuils SOH utilisés en l'absence de valeur `etat`. */
  get batterySohHint(): string {
    const soh = this.batteryDiagnostic?.soh_pourcent;
    if (soh === null || soh === undefined) return '';
    if (soh >= 80) return 'Seuil ≥ 80 % : Bon';
    if (soh >= 70) return 'Seuil 70–79 % : Surveiller';
    return 'Seuil < 70 % : À remplacer';
  }

  /** Classe du conteneur de message. */
  get batteryMessageClass(): string {
    if (!this.batteryDiagnostic) return '';
    switch (this.effectiveEtat) {
      case 'Bon': return 'eqd-bdiag-msg--success';
      case 'Surveiller': return 'eqd-bdiag-msg--warning';
      case 'À remplacer': return 'eqd-bdiag-msg--danger';
      default: return 'eqd-bdiag-msg--neutral';
    }
  }

  /** Icône du message de maintenance. */
  get batteryMessageIcon(): string {
    if (!this.batteryDiagnostic) return 'fa-solid fa-circle-info';
    switch (this.effectiveEtat) {
      case 'Bon': return 'fa-solid fa-check-circle';
      case 'Surveiller': return 'fa-solid fa-exclamation-triangle';
      case 'À remplacer': return 'fa-solid fa-circle-exclamation';
      default: return 'fa-solid fa-circle-info';
    }
  }

  get batteryMessageDisplay(): string {
    return (
      this.batteryDiagnostic?.message ||
      'Aucun message de maintenance fourni par le backend.'
    );
  }

  get batteryVoltageDisplay(): string {
    const v = this.batteryDiagnostic?.voltage_v;
    return v !== null && v !== undefined ? `${Number(v).toFixed(2)} V` : '—';
  }

  get batteryCurrentDisplay(): string {
    const v = this.batteryDiagnostic?.current_a;
    return v !== null && v !== undefined ? `${Number(v).toFixed(2)} A` : '—';
  }

  get batteryTemperatureDisplay(): string {
    const v = this.batteryDiagnostic?.temperature_c;
    return v !== null && v !== undefined ? `${Number(v).toFixed(1)} °C` : '—';
  }

  get batteryDodDisplay(): string {
    const v = this.batteryDiagnostic?.dod_percent;
    return v !== null && v !== undefined ? `${Number(v).toFixed(1)} %` : '—';
  }

  get batteryCapacityDisplay(): string {
    const v = this.batteryDiagnostic?.capacite_restante_ah;
    return v !== null && v !== undefined ? `${Number(v).toFixed(1)} Ah` : '—';
  }

  get batteryDurationDisplay(): string {
    const v = this.batteryDiagnostic?.duree_estimee_jours;
    return v !== null && v !== undefined ? `~${v} jours` : '—';
  }

  get batteryDateDisplay(): string {
    const raw = this.batteryDiagnostic?.date_heure;
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return (
      d.toLocaleDateString('fr-FR') +
      ' ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  }

  /* ===== Exports (CSV + PDF) ===== */

  exportCsv(): void {
    if (!this.equipment || this.batteryHistory.length === 0) return;
    this.exportError = null;
    this.batteryExportService.exportCsv(this.equipment.imei, this.batteryHistory);
  }

  async exportPdf(): Promise<void> {
    if (!this.equipment || this.batteryHistory.length === 0) return;
    this.exportError = null;
    try {
      const sohImageDataUrl = this.historyCharts?.getSohChartImageDataUrl() ?? null;
      await this.batteryExportService.exportPdf({
        deviceId: this.equipment.imei,
        rapportDate: new Date().toISOString(),
        diagnostic: this.batteryDiagnostic,
        history: this.batteryHistory,
        sohImageDataUrl
      });
    } catch (err) {
      console.error('Export PDF batterie', err);
      this.exportError = 'Le rapport PDF n\'a pas pu être généré. Réessayez plus tard.';
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