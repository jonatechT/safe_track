import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Activity {
  title: string;
  time: string;
  status?: string;
  statusClass?: string;
  imei: string;
}

interface Alert {
  title: string;
  time: string;
  imei: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  // Activités récentes (mock) — à remplacer par un appel API
  activities: Activity[] = [
    {
      title: 'Maintenance Kit solaire #SK-045',
      time: 'Il y a 10 min',
      status: 'En cours',
      statusClass: 'status-progress',
      imei: '354123456789012'
    }
  ];

  // Alertes récentes (mock) — à remplacer par un appel API
  alerts: Alert[] = [
    {
      title: 'Violation de box — Kit solaire #SK-045',
      time: 'Il y a 5 min',
      imei: '354123456789012'
    },
    {
      title: 'Déplacement non autorisé — Véhicule #V-007',
      time: 'Il y a 28 min',
      imei: '354123456789014'
    }
  ];

  // Valeurs par défaut (mock) - à remplacer par un appel API
  totalEquipements: number = 100;
  enLigne: number = 90;
  alerteActive: number = 7;
  anomalieDetectee: number = 3;

  // Équipements par catégorie (proportionnels au total = 100)
  kits: number = 75;
  motocyclettes: number = 27;
  automobiles: number = 15;

  // Pourcentages des barres de progression
  kitsPourcent: number = 75;
  motocyclettesPourcent: number = 27;
  automobilesPourcent: number = 15;

  // Pourcentages pour les cercles de progression KPI
  totalEquipementsPourcent: number = 100;
  enLignePourcent: number = 90;
  alerteActivePourcent: number = 7;
  anomalieDetecteePourcent: number = 3;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadKpiData();
  }

  /** Navigation vers la page détail d'un équipement */
  goToEquipment(imei: string | undefined): void {
    if (imei) {
      this.router.navigate(['/equipements', imei]);
    }
  }

  private loadKpiData(): void {
    // Données mock rechargées à chaque ouverture du dashboard (à remplacer par un appel API)
    this.totalEquipements = 100;
    this.enLigne = 90;
    this.alerteActive = 7;
    this.anomalieDetectee = 3;

    // Catégories : 75 + 27 + 15 = 100 équipements (motocyclettes non affichées)
    this.kits = 75;
    this.motocyclettes = 27;
    this.automobiles = 15;

    this.kitsPourcent = 75;
    this.motocyclettesPourcent = 27;
    this.automobilesPourcent = 15;

    // Calcul des pourcentages pour les cercles de progression
    this.totalEquipementsPourcent = 100;
    this.enLignePourcent = Math.round((this.enLigne / this.totalEquipements) * 100);
    this.alerteActivePourcent = Math.round((this.alerteActive / this.totalEquipements) * 100);
    this.anomalieDetecteePourcent = Math.round((this.anomalieDetectee / this.totalEquipements) * 100);
  }

  /** Génère le style conic-gradient pour un cercle de progression */
  getProgressStyle(percent: number, color: string): string {
    const p = Math.min(100, Math.max(0, percent));
    return `conic-gradient(${color} 0% ${p}%, #E2E8F0 ${p}% 100%)`;
  }
}