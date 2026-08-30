import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BasePageComponent } from '../base-page/base-page';
import { EquipmentService } from '../../services/equipment.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { AuthService } from '../../auth/auth.service';

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
                          } @else if (header === 'IMEI') {
                            <span class="imei-code">{{ row[header] }}</span>
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
                            <span
                              class="statut-badge"
                              [class.statut-ouverte]="row['Statut'] === 'Ouverte'"
                              [class.statut-en-cours]="row['Statut'] === 'En cours'"
                              [class.statut-termine]="row['Statut'] === 'Terminée'"
                            >{{ row['Statut'] }}</span>
                          } @else if (header === 'Action') {
                            @if (row['Statut'] === 'Ouverte') {
                              <button class="action-take-btn" (click)="prendreAlerte(row); $event.stopPropagation()">
                                {{ row[header] }}
                              </button>
                            } @else if (row['Statut'] === 'En cours') {
                              <div class="done-actions">
                                <span class="taken-label">
                                  <i class="fa-solid fa-clock"></i> En cours
                                </span>
                                <button class="action-take-btn" (click)="terminerAlerte(row); $event.stopPropagation()">
                                  <i class="fa-solid fa-flag-checkered"></i> Terminer
                                </button>
                              </div>
                            } @else {
                              <span class="done-label">
                                <i class="fa-solid fa-check"></i> Terminée
                              </span>
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
    .imei-code { font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace; font-size: 12px; color: #64748B; letter-spacing: 0.3px; }
    .sync-time { color: #64748B; font-size: 12px; }
    .data-table tbody tr.active .imei-code,
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
    .parc-equipement .imei-code { font-size: 13px; }
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
    private router: Router
  ) {}

  get rows(): TableRow[] {
    return this.tableRowsSignal();
  }

  get cards(): StatCard[] {
    return this.statCardsSignal();
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

  /** Prendre une alerte : met à jour le statut et le technicien dans le tableau */
  prendreAlerte(row: TableRow): void {
    const userName = this.authService.getUser()?.name || 'Utilisateur';
    const updated = this.tableRowsSignal().map(r => {
      if (r['Équipement'] === row['Équipement'] && r['Statut'] === 'Ouverte') {
        return {
          ...r,
          'Statut': 'En cours',
          'Technicien': userName,
          'Action': 'En cours'
        };
      }
      return r;
    });
    this.tableRowsSignal.set(updated);
    this.refreshAlertCounters();
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
        this.router.navigate(['/equipements', equipment.imei], { queryParams: { source: 'alerts' } });
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