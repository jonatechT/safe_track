import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BasePageComponent } from '../base-page/base-page';
import { EquipmentService } from '../../services/equipment.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService, User } from '../../auth/auth.service';
import { UsersService } from '../../services/users.service';
import { SettingsService } from '../../services/settings.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  progress?: number;
}

interface TableRow {
  [key: string]: string;
}

@Component({
  selector: 'app-generic-page',
  standalone: true,
  imports: [BasePageComponent],
  template: `
    <app-base-page [title]="title" [subtitle]="subtitle" [icon]="icon">
      <div class="generic-content" [class.parc-equipement]="isParcEquipement">
        @if (cards.length) {
          <div class="stat-grid">
            @for (stat of cards; track stat.label) {
              <div class="stat-card" [style.background]="stat.bgColor" [style.borderColor]="stat.color + '33'">
                <div class="stat-main">
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-value"><strong>{{ stat.value }}</strong></span>
                </div>
                <i class="stat-icon" [class]="stat.icon" [style.color]="stat.color"></i>
              </div>
            }
          </div>
        }
        @if (showMap) {
          <div class="card map-card-page">
            <div class="card-header">
              <div>
                <h2 class="card-title">Géolocalisation des équipements</h2>
                <p class="card-subtitle">Ouagadougou, Burkina Faso</p>
              </div>
            </div>
            <div class="map-container-page" #mapPageContainer></div>
          </div>
        }
        @if (tableHeaders.length) {
          @if (isAlertsPage) {
            <div class="alerts-tabs">
              <button
                type="button"
                class="alerts-tab"
                [class.active]="currentTab === 'en-cours'"
                (click)="setTab('en-cours')"
              >
                <i class="fa-solid fa-triangle-exclamation"></i>
                En cours
                <span class="alerts-tab-count">{{ openAlertCount }}</span>
              </button>
              <button
                type="button"
                class="alerts-tab"
                [class.active]="currentTab === 'historique'"
                (click)="setTab('historique')"
              >
                <i class="fa-solid fa-clock-rotate-left"></i>
                Historique
                <span class="alerts-tab-count">{{ historyAlertCount }}</span>
              </button>
            </div>

            <div class="alerts-filter-bar">
              <div class="alerts-filter-tabs">
                <button
                  type="button"
                  class="alert-filter"
                  [class.active]="severiteFilter === 'Tout'"
                  (click)="setSeveriteFilter('Tout')"
                >
                  <i class="fa-solid fa-list-ul"></i>
                  Tout
                </button>
                @for (sev of alertSeverites; track sev) {
                  <button
                    type="button"
                    class="alert-filter"
                    [class.active]="severiteFilter === sev"
                    (click)="setSeveriteFilter(sev)"
                  >
                    <i
                      class="fa-solid"
                      [class.fa-circle-exclamation]="sev.toLowerCase() === 'critique'"
                      [class.fa-triangle-exclamation]="sev.toLowerCase() !== 'critique'"
                    ></i>
                    {{ sev }}
                  </button>
                }
              </div>
              <div class="alerts-search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  class="alerts-search-input"
                  placeholder="Rechercher un équipement…"
                  [value]="searchTerm"
                  (input)="searchTerm = $any($event.target).value"
                />
                @if (searchTerm) {
                  <button
                    type="button"
                    class="alerts-search-clear"
                    (click)="searchTerm = ''"
                    aria-label="Effacer la recherche"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                }
              </div>
            </div>
          }
          @if (rows.length) {
          <div class="table-card">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    @for (header of tableHeaders; track header) {
                      <th>{{ header }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of rows; track $index) {
                    <tr (click)="ouvrirDetail(row)">
                      @for (header of tableHeaders; track header) {
                        <td>
                          @if (header === 'Équipement') {
                            <div class="equipment-cell">
                              <span class="equipment-name">{{ row[header] }}</span>
                            </div>
                          } @else if (header === 'ID') {
                            <span class="id-code">{{ row[header] }}</span>
                          } @else if (header === 'Localisation' && row['LienLocalisation']) {
                            <a
                              class="location-link"
                              href="https://www.google.com/maps?q={{ row['LienLocalisation'] }}"
                              target="_blank"
                              rel="noopener"
                              (click)="$event.stopPropagation()"
                            >
                              <i class="fa-solid fa-location-dot"></i>
                              {{ row[header] }}
                            </a>
                          } @else if (header === 'Dernière synchro') {
                            <span class="sync-time">{{ row[header] }}</span>
                          } @else if (header === 'Statut') {
                            @if (row['Statut'] === 'Ouverte') {
                              <span class="statut-badge statut-ouverte"><i class="fa-solid fa-hourglass-half"></i> Non pris</span>
                            } @else if (row['Statut'] === 'En cours') {
                              <span class="statut-badge statut-en-cours"><i class="fa-solid fa-clock"></i> Intervention en cours</span>
                            } @else if (row['Statut'] === 'Terminée') {
                              <span class="statut-badge statut-termine"><i class="fa-solid fa-check"></i> Terminée</span>
                            } @else {
                              <span class="statut-badge">{{ row['Statut'] }}</span>
                            }
                          } @else if (header === 'Action') {
                            @if (row['Statut'] === 'Ouverte') {
                              @if (isAdminUser()) {
                                <button class="action-take-btn" (click)="prendreAlerte(row); $event.stopPropagation()">
                                  <i class="fa-solid fa-user-clock"></i>
                                  {{ planifMode ? 'Planifier' : 'Affecter' }}
                                </button>
                              } @else if (canTakeAlerts) {
                                <button class="action-take-btn" (click)="prendreAlerte(row); $event.stopPropagation()">
                                  <i
                                    class="fa-solid"
                                    [class.fa-hand]="!inspectionMode"
                                    [class.fa-magnifying-glass]="inspectionMode"
                                  ></i>
                                  {{ inspectionMode ? 'Inspecter' : row[header] }}
                                </button>
                              } @else {
                                <span class="done-label"><i class="fa-solid fa-lock"></i> En attente</span>
                              }
                            } @else if (row['Statut'] === 'En cours') {
                              <button class="action-take-btn" (click)="terminerAlerte(row); $event.stopPropagation()">
                                <i class="fa-solid fa-flag-checkered"></i> Terminer
                              </button>
                            } @else {
                              <span class="done-label">—</span>
                            }
                          } @else {
                            {{ row[header] }}
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            </div>
          } @else {
            @if (isAlertsPage) {
              <div class="alerts-tab-empty">
                @if (currentTab === 'historique') {
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <p>Aucune alerte terminée pour l'instant.</p>
                } @else {
                  <i class="fa-solid fa-circle-check"></i>
                  <p>Aucune alerte en cours. Tout est sous contrôle.</p>
                }
              </div>
            }
          }
        }
        @if (showAffectModal && selectedAlertRow) {
          <div class="affect-overlay" (click)="closeAffectModal()">
            <div class="affect-modal" role="dialog" aria-modal="true" aria-label="Affecter une intervention" (click)="$event.stopPropagation()">
              <div class="affect-modal-header">
                <div class="affect-modal-icon"><i class="fa-solid fa-user-clock"></i></div>
                <div class="affect-modal-title-block">
                  <h3 class="affect-modal-title">{{ planifMode ? 'Planifier une intervention' : 'Affecter une intervention' }}</h3>
                  <span class="affect-modal-subtitle">{{ selectedAlertRow['Équipement'] }} — {{ selectedAlertRow['Type'] }}</span>
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
                      <button
                        type="button"
                        class="affect-item"
                        [class.selected]="isTechnicienSelected(tech.id)"
                        (click)="toggleTechnicien(tech.id)"
                      >
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
                <button
                  type="button"
                  class="affect-item affect-self"
                  [class.selected]="isTechnicienSelected(-1)"
                  (click)="toggleTechnicien(-1)"
                >
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
                <button
                  type="button"
                  class="affect-btn-confirm"
                  [disabled]="!selectedTechnicienIds.length"
                  (click)="confirmerAffectation()"
                >
                  <i class="fa-solid fa-user-check"></i>
                  {{ planifMode ? 'Planifier' : 'Affecter' }}
                </button>
              </div>
            </div>
          </div>
        }
        @if (!cards.length && !tableHeaders.length && !showMap) {
          <div class="empty-state">
            <i class="fa-solid fa-inbox empty-icon"></i>
            <p>Aucune donnée disponible pour le moment.</p>
          </div>
        }
      </div>
    </app-base-page>
  `,
  styles: [`
    .generic-content { display: flex; flex-direction: column; gap: 24px; width: 100%; }
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
    .card { background: #FFFFFF; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); transition: box-shadow 0.3s ease, transform 0.3s ease; width: 100%; }
    .card:hover { box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12); transform: translateY(-2px); }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; width: 100%; }
    .card-title { font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px; }
    .card-subtitle { font-size: 12px; color: #94A3B8; margin-top: 2px; }
    .map-card-page { padding: 24px; margin-bottom: 0; }
    .map-container-page { height: 340px; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; background: #FFFFFF; }
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
      cursor: pointer;
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
    .data-table tbody td:nth-child(2) {
      color: #64748B;
      font-size: 12px;
    }
    .data-table tbody td:nth-child(3) {
      color: #2563EB;
      font-weight: 500;
    }
    .data-table tbody td:nth-child(4) {
      color: #64748B;
      font-size: 12px;
    }
    .data-table tbody td:last-child { text-align: right; }
    .id-code { font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace; font-size: 12px; color: #64748B; letter-spacing: 0.3px; }
    .sync-time { color: #64748B; font-size: 12px; }
    .data-table tbody tr.active .id-code,
    .data-table tbody tr.active .sync-time { color: rgba(255, 255, 255, 0.9); }
    .data-table tbody tr.active .location-link { color: #FFFFFF; }
    .data-table tbody tr.active .location-link:hover { color: #FFFFFF; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .status-alert { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
    .status-inspection { background: #FFFBEB; color: #D97706; border: 1px solid #FCD39D; }
    .status-normal { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .statut-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .statut-ouverte { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
    .statut-en-cours { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
    .statut-termine { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .taken-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #2563EB; font-weight: 600; }
    .done-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #059669; font-weight: 600; }
    .done-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
    .location-link { display: inline-flex; align-items: center; gap: 6px; color: #2563EB; text-decoration: none; font-weight: 500; font-size: 12px; transition: all 0.2s ease; }
    .location-link:hover { color: #1D4ED8; }
    .location-link i { font-size: 12px; }
    .action-take-btn { background: transparent; color: #2563EB; border: 1px solid #2563EB; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; }
    .action-take-btn:hover { background: #2563EB; color: #FFFFFF; }
    .alerts-tabs { display: flex; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
    .alerts-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .alerts-tab:hover { border-color: #BFDBFE; color: #2563EB; }
    .alerts-tab.active {
      background: #2563EB;
      color: #FFFFFF;
      border-color: #2563EB;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .alerts-tab-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.12);
      color: #2563EB;
      font-size: 11px;
      font-weight: 700;
    }
    .alerts-tab.active .alerts-tab-count { background: rgba(255, 255, 255, 0.22); color: #FFFFFF; }
    /* ===== Barre de filtres & recherche (page Alertes) ===== */
    .alerts-filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    .alerts-filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .alert-filter {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #64748B;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .alert-filter:hover { border-color: #BFDBFE; color: #2563EB; }
    .alert-filter.active { background: #2563EB; border-color: #2563EB; color: #FFFFFF; }
    .alerts-search { position: relative; display: flex; align-items: center; flex: 1; min-width: 200px; }
    .alerts-search > i { position: absolute; left: 12px; color: #94A3B8; font-size: 13px; pointer-events: none; }
    .alerts-search-input {
      width: 100%;
      padding: 8px 32px 8px 34px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #0F172A;
      font-size: 12.5px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .alerts-search-input:focus { border-color: #2563EB; }
    .alerts-search-input::placeholder { color: #94A3B8; }
    .alerts-search-clear {
      position: absolute;
      right: 8px;
      width: 22px;
      height: 22px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #94A3B8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .alerts-search-clear:hover { background: #F1F5F9; color: #0F172A; }
    .affect-multi-note {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: #64748B;
      padding: 10px 20px 4px;
    }
    .alerts-tab-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 36px;
      background: #FFFFFF;
      border: 1px dashed #CBD5E1;
      border-radius: 12px;
      color: #94A3B8;
      text-align: center;
    }
    .alerts-tab-empty i { font-size: 26px; color: #22C55E; }
    /* ===== Modale d'affectation d'une intervention (admin) ===== */
    .affect-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .affect-modal {
      background: #FFFFFF;
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
    }
    .affect-modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid #E2E8F0;
    }
    .affect-modal-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #EFF6FF;
      color: #2563EB;
      font-size: 18px;
      flex-shrink: 0;
    }
    .affect-modal-title-block { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .affect-modal-title { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; }
    .affect-modal-subtitle {
      font-size: 11.5px;
      color: #64748B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .affect-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #64748B;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .affect-modal-close:hover { background: #F1F5F9; color: #0F172A; }
    .affect-modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
    .affect-list { display: flex; flex-direction: column; gap: 8px; }
    .affect-item, .affect-self {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .affect-item:hover, .affect-self:hover { border-color: #BFDBFE; background: #F8FAFC; }
    .affect-item.selected, .affect-self.selected {
      border-color: #2563EB;
      background: #EFF6FF;
      box-shadow: 0 0 0 1px #2563EB;
    }
    .affect-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #EFF6FF;
      color: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    .affect-item-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
    .affect-item-name { font-size: 13px; font-weight: 600; color: #0F172A; }
    .affect-item-email { font-size: 11.5px; color: #64748B; }
    .affect-check { color: #2563EB; opacity: 0; transition: opacity 0.15s ease; }
    .affect-item.selected .affect-check, .affect-self.selected .affect-check { opacity: 1; }
    .affect-empty { font-size: 13px; color: #64748B; text-align: center; padding: 12px 0; }
    .affect-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid #E2E8F0;
    }
    .affect-btn-cancel {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #475569;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .affect-btn-cancel:hover { background: #F1F5F9; }
    .affect-btn-confirm {
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      background: #2563EB;
      color: #FFFFFF;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .affect-btn-confirm:hover { background: #1D4ED8; }
    .affect-btn-confirm:disabled { background: #CBD5E1; cursor: not-allowed; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; color: #6B7280; text-align: center; }
    .empty-icon { font-size: 36px; color: #9CA3AF; }

    /* ===== Spécifique page « Parc d'équipement » : lignes plus hautes + police plus grande ===== */
    .parc-equipement .data-table thead th {
      padding: 14px 18px;
      font-size: 13px;
    }
    .parc-equipement .data-table tbody td {
      padding: 16px 18px;
      font-size: 14px;
    }
    .parc-equipement .data-table tbody td:first-child { font-size: 15px; }
    .parc-equipement .data-table tbody td:nth-child(2) { font-size: 13px; }
    .parc-equipement .data-table tbody td:nth-child(3) { font-size: 14px; }
    .parc-equipement .data-table tbody td:nth-child(4) { font-size: 14px; }
    .parc-equipement .id-code { font-size: 13px; }
    .parc-equipement .sync-time { font-size: 14px; }
    .parc-equipement .location-link { font-size: 14px; }
    .parc-equipement .location-link i { font-size: 13px; }
    .parc-equipement .equipment-name { font-size: 15px; }

    @media (max-width: 1024px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class GenericPageComponent implements OnInit, AfterViewInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'fa-solid fa-cube';
  @Input() statCards: StatCard[] = [];
  @Input() showMap: boolean = false;
  @Input() tableHeaders: string[] = [];
  @Input() tableRows: TableRow[] = [];

  private tableRowsSignal = signal<TableRow[]>([]);
  private statCardsSignal = signal<StatCard[]>([]);

  @ViewChild('mapPageContainer') mapPageContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private equipmentService: EquipmentService,
    private authService: AuthService,
    private usersService: UsersService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  get rows(): TableRow[] {
    return this.filteredRows();
  }

  /** Onglet actif de la page Alertes (« en-cours » | « historique ») */
  currentTab: 'en-cours' | 'historique' = 'en-cours';

  /** Filtre de sévérité actif (« Tout » par défaut) */
  severiteFilter = 'Tout';

  /** Terme de recherche libre (équipement / type d'anomalie) */
  searchTerm = '';

  /** Applique un filtre de sévérité */
  setSeveriteFilter(sev: string): void {
    this.severiteFilter = sev;
  }

  /** Sévérités présentes dans les données → génèrent les puces de filtre */
  get alertSeverites(): string[] {
    const set = new Set<string>();
    for (const r of this.tableRowsSignal()) {
      const s = r['Sévérité'];
      if (s && s.trim()) set.add(s.trim());
    }
    return Array.from(set);
  }

  get cards(): StatCard[] {
    return this.statCardsSignal();
  }

  /** Vrai uniquement pour la page Alertes (les onglets n'existent pas ailleurs) */
  get isAlertsPage(): boolean {
    return this.title === 'Alertes';
  }

  /** Nombre d'alertes encore actives (Non pris + En cours) */
  get openAlertCount(): number {
    return this.tableRowsSignal().filter(r => r['Statut'] !== 'Terminée').length;
  }

  /** Nombre d'alertes terminées (visibles dans l'onglet Historique) */
  get historyAlertCount(): number {
    return this.tableRowsSignal().filter(r => r['Statut'] === 'Terminée').length;
  }

  /** Basculer entre les onglets « En cours » et « Historique » */
  setTab(tab: 'en-cours' | 'historique'): void {
    this.currentTab = tab;
  }

  /**
   * Filtre les lignes selon l'onglet actif (page Alertes uniquement) :
   * - « En cours » : toutes les alertes dont le statut n'est pas « Terminée »
   * - « Historique » : uniquement les alertes « Terminée »
   * Les autres pages ne sont pas filtrées.
   */
  private filteredRows(): TableRow[] {
    const all = this.tableRowsSignal();
    if (!this.isAlertsPage) return all;

    // 1) Onglet : En cours vs Historique
    let rows = all;
    if (this.currentTab === 'historique') {
      rows = all.filter(r => r['Statut'] === 'Terminée');
    } else {
      rows = all.filter(r => r['Statut'] !== 'Terminée');
    }

    // 2) Filtre de sévérité (Tout / Critique / Avertissement…)
    if (this.severiteFilter !== 'Tout') {
      rows = rows.filter(r => r['Sévérité'] === this.severiteFilter);
    }

    // 3) Recherche libre sur l'équipement ou le type d'anomalie
    const q = this.searchTerm.trim().toLowerCase();
    if (q) {
      rows = rows.filter(r => {
        const eq = String(r['Équipement'] ?? '').toLowerCase();
        const type = String(r['Type'] ?? '').toLowerCase();
        return eq.includes(q) || type.includes(q);
      });
    }

    return rows;
  }

  /** Classe spécifique pour la page « Parc d'équipement » (styles dédiés) */
  get isParcEquipement(): boolean {
    return this.title === "Parc d'équipement";
  }

  ngOnInit(): void {
    const data = this.route.snapshot.data as any;
    if (data) {
      this.title = data['title'] ?? this.title;
      this.subtitle = data['subtitle'] ?? this.subtitle;
      this.icon = data['icon'] ?? this.icon;
      this.statCards = data['statCards'] ?? this.statCards;
      this.showMap = data['showMap'] ?? this.showMap;
      this.tableHeaders = data['tableHeaders'] ?? this.tableHeaders;
      this.tableRows = data['tableRows'] ?? this.tableRows;
      this.statCardsSignal.set([...(data['statCards'] ?? [])]);
      this.tableRowsSignal.set([...(data['tableRows'] ?? [])]);
    }
  }

  ngAfterViewInit(): void {
    if (this.showMap && isPlatformBrowser(this.platformId) && this.mapPageContainer) {
      this.initMap();
    }
  }

  /** Prendre une alerte :
   *  - Admin de structure / SuperAdmin → ouvre la modale d'affectation
   *  - Technicien (USER) → prend l'alerte pour lui-même */
  prendreAlerte(row: TableRow): void {
    if (this.isAdminUser()) {
      this.ouvrirAffectation(row);
      return;
    }
    this.assignerAlerte(row, this.currentUserName);
  }

  /** Met à jour une alerte « Ouverte » en « En cours » avec le technicien assigné */
  private assignerAlerte(row: TableRow, technicienName: string): void {
    const updated = this.tableRowsSignal().map(r => {
      if (r['Équipement'] === row['Équipement'] && r['Statut'] === 'Ouverte') {
        return {
          ...r,
          'Statut': 'En cours',
          'Technicien': technicienName,
          'Action': 'En cours'
        };
      }
      return r;
    });
    this.tableRowsSignal.set(updated);
    this.refreshAlertCounters();
  }

  /* ===== Affectation d'une intervention à un technicien (admin) ===== */

  showAffectModal = false;
  selectedAlertRow: TableRow | null = null;
  selectedTechnicienIds: number[] = [];

  /** L'utilisateur connecté est un administrateur : il peut affecter les interventions */
  isAdminUser(): boolean {
    return this.authService.isStructureAdmin() || this.authService.isSuperAdmin();
  }

  /* ===== Réglages issus de la page Paramètres ===== */

  /** Affectation multi-techniciens activée dans les paramètres */
  get affectModeMulti(): boolean {
    return this.settingsService.settings().multiTechniciens;
  }

  /** Nombre maximal de techniciens par intervention (paramètres) */
  get maxTechniciens(): number {
    return this.settingsService.settings().maxTechniciens;
  }

  /** Les techniciens peuvent prendre une alerte sans affectation admin préalable */
  get canTakeAlerts(): boolean {
    return this.settingsService.settings().priseEnChargeGlobale;
  }

  /** Le bouton d'affectation agit en mode « planification d'une maintenance » */
  get planifMode(): boolean {
    return this.settingsService.settings().planifierMaintenance;
  }

  /** Les techniciens inspectent d'abord l'alerte avant de la prendre */
  get inspectionMode(): boolean {
    return this.settingsService.settings().inspectionTechniciens;
  }

  /** Nom de la personne connectée */
  get currentUserName(): string {
    return this.authService.getUser()?.name || 'Utilisateur';
  }

  /** Techniciens ACTIFS de la structure de l'admin, triés par nom */
  get techniciensDisponibles(): User[] {
    const structureId = this.authService.getUser()?.structureId;
    if (!structureId) return [];
    return this.usersService
      .getUsersByStructure(structureId)
      .filter(u => u.role === 'USER' && (u.statut ?? 'ACTIVE') === 'ACTIVE')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Ouvre la modale de sélection d'un technicien pour une alerte donnée */
  private ouvrirAffectation(row: TableRow): void {
    this.selectedAlertRow = row;
    this.selectedTechnicienIds = [];
    this.showAffectModal = true;
  }

  protected closeAffectModal(): void {
    this.showAffectModal = false;
    this.selectedAlertRow = null;
    this.selectedTechnicienIds = [];
  }

  protected isTechnicienSelected(id: number): boolean {
    return this.selectedTechnicienIds.includes(id);
  }

  /**
   * Sélection / désélection d'un technicien.
   * En mode multiple, on limite la sélection au maximum configuré.
   * « M'affecter » (id -1) est exclusif : on ne peut pas le cumuler avec un technicien.
   */
  protected toggleTechnicien(id: number): void {
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

  /** Valide l'affectation : l'intervention passe « En cours » avec le(s) technicien(s) choisi(s) */
  protected confirmerAffectation(): void {
    if (this.selectedAlertRow === null || this.selectedTechnicienIds.length === 0) return;
    const row = this.selectedAlertRow;
    const names = this.selectedTechnicienIds
      .filter(id => id !== -1)
      .map(id => this.techniciensDisponibles.find(t => t.id === id)?.name)
      .filter((n): n is string => !!n);
    if (this.selectedTechnicienIds.includes(-1)) names.unshift(this.currentUserName);
    const technicienName = names.length ? names.join(' & ') : this.currentUserName;
    this.assignerAlerte(row, technicienName);
    this.closeAffectModal();
  }

  /** Terminer une alerte : met à jour le statut en "Terminée" */
  terminerAlerte(row: TableRow): void {
    const updated = this.tableRowsSignal().map(r => {
      if (r['Équipement'] === row['Équipement'] && r['Statut'] === 'En cours') {
        return {
          ...r,
          'Statut': 'Terminée',
          'Action': 'Terminée'
        };
      }
      return r;
    });
    this.tableRowsSignal.set(updated);
    this.refreshAlertCounters();
  }

  ouvrirDetail(row: TableRow): void {
    const equipmentName = row['Équipement'];
    if (equipmentName) {
      const equipment = this.equipmentService.getAll().find(e => e.nom === equipmentName);
      if (equipment) {
        this.router.navigate(['/equipements', equipment.id], { queryParams: { source: 'alerts' } });
      }
    }
  }

  /**
   * Recalcule les compteurs d'alertes (Critiques / Avertissements / Résolues)
   * à partir de l'état actuel des lignes du tableau.
   * Une alerte "Terminée" passe au compteur Résolues et sort de son compteur de sévérité.
   */
  private refreshAlertCounters(): void {
    // Uniquement pour les pages qui affichent une colonne Sévérité (page Alertes)
    if (!this.tableHeaders.includes('Sévérité')) return;

    const rows = this.tableRowsSignal();
    const critiques = rows.filter(r => r['Sévérité'] === 'Critique' && r['Statut'] !== 'Terminée').length;
    const avertissements = rows.filter(r => r['Sévérité'] === 'Avertissement' && r['Statut'] !== 'Terminée').length;
    const resolues = rows.filter(r => r['Statut'] === 'Terminée').length;
    const total = Math.max(1, rows.length);

    this.statCardsSignal.set(
      this.statCardsSignal().map(card => {
        const label = card.label.toLowerCase();
        if (label.startsWith('critique')) {
          return { ...card, value: String(critiques), progress: Math.round((critiques / total) * 100) };
        }
        if (label.startsWith('avertissement')) {
          return { ...card, value: String(avertissements), progress: Math.round((avertissements / total) * 100) };
        }
        if (label.startsWith('résolue') || label.startsWith('resolue')) {
          return { ...card, value: String(resolues), progress: Math.round((resolues / total) * 100) };
        }
        return card;
      })
    );
  }

  /** Génère le style conic-gradient pour un cercle de progression */
  getProgressStyle(percent: number, color: string): string {
    const p = Math.min(100, Math.max(0, percent));
    return `conic-gradient(${color} 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }

  protected getEquipmentIcon(nom: string): string {
    const lower = nom.toLowerCase();
    if (lower.includes('kit')) return 'fa-solid fa-solar-panel';
    if (lower.includes('véhicule') || lower.includes('vehicule')) return 'fa-solid fa-car';
    if (lower.includes('engin')) return 'fa-solid fa-truck-pickup';
    return 'fa-solid fa-box';
  }

  protected getEquipmentClass(nom: string): string {
    const lower = nom.toLowerCase();
    if (lower.includes('kit')) return 'equip-solar';
    if (lower.includes('véhicule') || lower.includes('vehicule')) return 'equip-vehicle';
    if (lower.includes('engin')) return 'equip-mining';
    return '';
  }

  protected getEquipmentType(nom: string): string {
    const lower = nom.toLowerCase();
    if (lower.includes('kit')) return 'Kit solaire';
    if (lower.includes('véhicule') || lower.includes('vehicule')) return 'Véhicule';
    if (lower.includes('engin')) return 'Engin minier';
    return 'Équipement';
  }

  protected formatCoordinates(localisation: string): string {
    return localisation;
  }

  protected getCity(localisation: string): string {
    // Inférer la ville en fonction des coordonnées (approximation pour le mock)
    const lat = parseFloat(localisation.split('°')[0].replace(',', '.'));
    if (lat > 12.4) return 'Zone industrielle Kossodo';
    if (lat > 12.3) return 'Ouagadougou';
    if (lat > 11) return 'Bobo-Dioulasso';
    return 'Région rurale';
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet');
    const map = L.map(this.mapPageContainer.nativeElement, {
      center: [12.3714, -1.5197],
      zoom: 12,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const points = [
      { lat: 12.3714, lng: -1.5197, color: '#10B981', type: 'Kits solaires' },
      { lat: 12.3680, lng: -1.5250, color: '#10B981', type: 'Kits solaires' },
      { lat: 12.3750, lng: -1.5150, color: '#3B82F6', type: 'Engins miniers' },
      { lat: 12.3600, lng: -1.5400, color: '#3B82F6', type: 'Engins miniers' },
      { lat: 12.3730, lng: -1.5120, color: '#F59E0B', type: 'Véhicules admin.' },
      { lat: 12.3690, lng: -1.5280, color: '#F59E0B', type: 'Véhicules admin.' },
      { lat: 12.3660, lng: -1.5180, color: '#94A3B8', type: 'Véhicules' },
      { lat: 12.3740, lng: -1.5220, color: '#94A3B8', type: 'Véhicules' }
    ];

    points.forEach((p) => {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="width: 12px; height: 12px; background: ${p.color}; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<b>${p.type}</b>`);
    });
  }
}