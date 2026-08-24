import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BasePageComponent } from '../base-page/base-page';

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
      <div class="generic-content">
        @if (statCards.length) {
          <div class="stat-grid">
            @for (stat of statCards; track stat.label) {
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
                      @if (header !== 'Statut') {
                        <th>{{ header }}</th>
                      }
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of tableRows; track $index) {
                    <tr>
                      @for (header of tableHeaders; track header) {
                        @if (header !== 'Statut') {
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
                              >
                                {{ row[header] }}
                              </a>
                            } @else if (header === 'Dernière synchro') {
                              <span class="sync-time">{{ row[header] }}</span>
                            } @else if (header === 'Action') {
                              <button class="action-take-btn">
                                <i class="fa-solid fa-hand"></i> {{ row[header] }}
                              </button>
                            } @else {
                              {{ row[header] }}
                            }
                          </td>
                        }
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
        @if (!statCards.length && !tableHeaders.length && !showMap) {
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
    /* ===== Tableau moderne ===== */
    .table-card {
      background: #EFF6FF;
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 16px;
      padding: 8px 20px 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04);
      transition: box-shadow 0.3s ease;
      margin-top: 24px;
    }
    .table-wrapper { overflow-x: auto; border-radius: 12px; margin: 0 -8px; }
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; font-size: 13px; }

    .data-table thead th {
      text-align: left;
      padding: 14px 18px;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.9px;
      background: #2563EB;
      border-bottom: 1px solid #2563EB;
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
    .data-table tbody tr:hover td {
      background: rgba(56, 189, 248, 0.10);
      border-color: rgba(56, 189, 248, 0.35);
    }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .status-alert { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
    .status-inspection { background: #FFFBEB; color: #D97706; border: 1px solid #FCD39D; }
    .status-normal { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .location-link { display: inline-flex; align-items: center; gap: 6px; color: #3B82F6; text-decoration: none; font-weight: 500; font-size: 12px; transition: all 0.2s ease; }
    .location-link:hover { color: #1D4ED8; }
    .location-link i { font-size: 12px; }
    .action-take-btn { background: #2563EB; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .action-take-btn:hover { background: #1D4ED8; transform: translateY(-1px); }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; color: #6B7280; text-align: center; }
    .empty-icon { font-size: 36px; color: #9CA3AF; }

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

  @ViewChild('mapPageContainer') mapPageContainer!: ElementRef<HTMLDivElement>;

  constructor(private route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {}

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
    }
  }

  ngAfterViewInit(): void {
    if (this.showMap && isPlatformBrowser(this.platformId) && this.mapPageContainer) {
      this.initMap();
    }
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