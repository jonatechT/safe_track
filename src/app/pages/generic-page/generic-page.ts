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
              <div class="stat-card">
                <div class="stat-icon" [style.background]="stat.bgColor" [style.color]="stat.color">
                  <i [class]="stat.icon"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
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
                  @for (row of tableRows; track $index) {
                    <tr>
                      @for (header of tableHeaders; track header) {
                        <td>
                          @if (header === 'Statut') {
                            @if (row[header].includes('alerte')) {
                              <span class="status-badge status-alert">
                                <i class="fa-solid fa-circle-exclamation"></i>
                                {{ row[header].replace('⚠️ ', '') }}
                              </span>
                            } @else if (row[header].includes('Inspection')) {
                              <span class="status-badge status-inspection">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                {{ row[header].replace('🔍 ', '') }}
                              </span>
                            } @else if (row[header].includes('Normal')) {
                              <span class="status-badge status-normal">
                                <i class="fa-solid fa-circle-check"></i>
                                {{ row[header].replace('✅ ', '') }}
                              </span>
                            } @else {
                              {{ row[header] }}
                            }
                          } @else if (header === 'Localisation' && row['LienLocalisation']) {
                            <a
                              class="location-link"
                              href="https://www.google.com/maps?q={{ row['LienLocalisation'] }}"
                              target="_blank"
                              rel="noopener"
                            >
                              <i class="fa-solid fa-location-dot"></i>
                              {{ row[header] }}
                            </a>
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
    .generic-content { display: flex; flex-direction: column; gap: 20px; width: 100%; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .stat-card { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.4); padding: 24px; display: flex; align-items: center; gap: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1); }
    .stat-card:hover { box-shadow: 0 20px 48px rgba(139, 92, 246, 0.16); border-color: rgba(255, 255, 255, 0.6); transform: translateY(-4px); }
    .stat-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .stat-info { display: flex; flex-direction: column; gap: 2px; }
    .stat-label { font-size: 12px; font-weight: 500; color: #64748B; }
    .stat-value { font-size: 22px; font-weight: 700; color: #0F172A; }
    .card { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.4); padding: 28px; transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1); }
    .card:hover { box-shadow: 0 20px 48px rgba(139, 92, 246, 0.16); border-color: rgba(255, 255, 255, 0.6); transform: translateY(-4px); }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
    .card-title { font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px; }
    .card-subtitle { font-size: 12px; color: #94A3B8; margin-top: 2px; }
    .map-card-page { padding: 24px; margin-bottom: 0; }
    .map-container-page { height: 340px; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.4); z-index: 0; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
    .table-card { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.4); padding: 28px; overflow: hidden; transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1); }
    .table-card:hover { box-shadow: 0 20px 48px rgba(139, 92, 246, 0.16); border-color: rgba(255, 255, 255, 0.6); transform: translateY(-4px); }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { text-align: left; padding: 12px 14px; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #EDF2F7; background: rgba(248, 250, 252, 0.5); }
    .data-table th:first-child { border-top-left-radius: 10px; }
    .data-table th:last-child { border-top-right-radius: 10px; }
    .data-table td { padding: 14px 14px; border-bottom: 1px solid #F1F5F9; color: #334155; font-weight: 500; }
    .data-table tbody tr { transition: background 0.2s ease, transform 0.2s ease; }
    .data-table tbody tr:hover { background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.03)); }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); }
    .status-alert { background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; }
    .status-inspection { background: #FFFBEB; color: #F59E0B; border: 1px solid #FDE68A; }
    .status-normal { background: #ECFDF5; color: #10B981; border: 1px solid #A7F3D0; }
    .location-link { display: inline-flex; align-items: center; gap: 6px; color: #3B82F6; text-decoration: none; font-weight: 600; font-size: 12px; transition: all 0.2s ease; }
    .location-link:hover { color: #1D4ED8; text-decoration: underline; }
    .location-link i { font-size: 12px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; color: #94A3B8; text-align: center; }
    .empty-icon { font-size: 36px; color: #CBD5E1; }
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
