import { Component, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, Inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  sublabel?: string;
  subColor?: string;
  route: string;
  displayValue: ReturnType<typeof signal<string>>;
}

interface AlertItem {
  title: string;
  time: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface ComponentHealth {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gaugeCanvas') gaugeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  protected chartsLoaded = false;
  private charts: Chart[] = [];
  private map: any = null;
  private countUpStarted = false;
  private scrollHandler: (() => void) | null = null;

  protected readonly kpiCards: KpiCard[] = [
    {
      label: 'Total équipements',
      value: '1248',
      icon: 'fa-solid fa-cube',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      route: '/equipment',
      displayValue: signal('0')
    },
    {
      label: 'En ligne',
      value: '1023',
      icon: 'fa-solid fa-signal',
      color: '#10B981',
      bgColor: '#ECFDF5',
      sublabel: '82% des équipements',
      subColor: '#10B981',
      route: '/location',
      displayValue: signal('0')
    },
    {
      label: 'Alertes actives',
      value: '32',
      icon: 'fa-solid fa-bell',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      route: '/alerts',
      displayValue: signal('0')
    },
    {
      label: 'Anomalies détectées',
      value: '18',
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      route: '/tests',
      displayValue: signal('0')
    }
  ];

  protected readonly alerts: AlertItem[] = [
    {
      title: 'Violation de box détectée',
      time: 'Il y a 5 min',
      icon: 'fa-solid fa-shield-halved',
      color: '#EF4444',
      bgColor: '#FEF2F2'
    },
    {
      title: 'Déplacement non autorisé',
      time: 'Il y a 12 min',
      icon: 'fa-solid fa-location-crosshairs',
      color: '#F59E0B',
      bgColor: '#FFFBEB'
    },
    {
      title: 'Anomalie de batterie',
      time: 'Il y a 28 min',
      icon: 'fa-solid fa-battery-half',
      color: '#F59E0B',
      bgColor: '#FFFBEB'
    },
  ];

  protected readonly mapLegend = [
    { label: 'Kits solaires', count: 645, color: '#10B981' },
    { label: 'Engins miniers', count: 210, color: '#3B82F6' },
    { label: 'Véhicules admin.', count: 245, color: '#F59E0B' },
    { label: 'Véhicules', count: 148, color: '#94A3B8' }
  ];

  protected readonly componentHealth: ComponentHealth[] = [
    { label: 'Batterie', value: 92, color: '#10B981' },
    { label: 'Panneau / Moteur', value: 85, color: '#3B82F6' },
    { label: 'Boîtier / Box', value: 73, color: '#F59E0B' },
    { label: 'Capteurs', value: 90, color: '#8B5CF6' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initDonutChart();
      this.initGaugeChart();
      this.initLineChart();
      this.initMap();
      this.chartsLoaded = true;
      this.initCountUpAnimation();
    }
  }

  private initCountUpAnimation(): void {
    // Trigger animation immediately on load
    this.startCountUp();

    // Re-trigger animation on scroll when cards come back into view
    this.scrollHandler = () => {
      const cards = document.querySelectorAll('.kpi-card');
      cards.forEach((card, index) => {
        if (index >= this.kpiCards.length) return;
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible && this.kpiCards[index].displayValue() === '0') {
          this.animateCountUp(index);
        }
      });
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private startCountUp(): void {
    this.kpiCards.forEach((_, index) => this.animateCountUp(index));
  }

  private animateCountUp(index: number): void {
    const card = this.kpiCards[index];
    const target = parseInt(card.value, 10);
    const duration = 1500;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      card.displayValue.set(Math.round(eased * target).toString());
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  private initDonutChart(): void {
    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Kits solaires', 'Engins miniers', 'Véhicules admin.', 'Véhicules'],
        datasets: [{
          data: [51.8, 16.8, 19.6, 11.8],
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#94A3B8'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 8,
            displayColors: true
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private initGaugeChart(): void {
    const ctx = this.gaugeCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Bon état', 'Reste'],
        datasets: [{
          data: [87, 13],
          backgroundColor: ['#10B981', '#E2E8F0'],
          borderWidth: 0,
          circumference: 270,
          rotation: 225
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
    this.charts.push(chart);
  }

  private initLineChart(): void {
    const ctx = this.lineCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'],
        datasets: [{
          label: 'Équipements à risque',
          data: [8, 10, 9, 12, 11, 13, 14],
          borderColor: '#8B5CF6',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#8B5CF6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#94A3B8'
            },
            border: { display: false }
          },
          y: {
            grid: {
              color: '#F1F5F9'
            },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#94A3B8',
              maxTicksLimit: 5
            },
            border: { display: false },
            beginAtZero: true
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private async initMap(): Promise<void> {
    if (!this.mapContainer) return;

    const L = await import('leaflet');

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [12.3714, -1.5197],
      zoom: 12,
      scrollWheelZoom: false,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    const points: { lat: number; lng: number; color: string; type: string }[] = [
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
      L.marker([p.lat, p.lng], { icon }).addTo(this.map).bindPopup(`<b>${p.type}</b>`);
    });
  }
}