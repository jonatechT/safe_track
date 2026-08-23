import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  // Valeurs par défaut (mock) - à remplacer par un appel API
  totalEquipements: number = 100;
  enLigne: number = 82;
  alerteActive: number = 4;
  anomalieDetectee: number = 2;

  // Équipements par catégorie (proportionnels au total = 100)
  kits: number = 52;
  motocyclettes: number = 27;
  automobiles: number = 21;

  // Pourcentages des barres de progression
  kitsPourcent: number = 52;
  motocyclettesPourcent: number = 27;
  automobilesPourcent: number = 21;

  // Pourcentages pour les cercles de progression KPI
  totalEquipementsPourcent: number = 100;
  enLignePourcent: number = 82;
  alerteActivePourcent: number = 4;
  anomalieDetecteePourcent: number = 2;

  ngOnInit(): void {
    this.loadKpiData();
  }

  private loadKpiData(): void {
    // Données mock rechargées à chaque ouverture du dashboard (à remplacer par un appel API)
    this.totalEquipements = 100;
    this.enLigne = 82;
    this.alerteActive = 4;
    this.anomalieDetectee = 2;

    // Catégories : 52 + 27 + 21 = 100 équipements
    this.kits = 52;
    this.motocyclettes = 27;
    this.automobiles = 21;

    this.kitsPourcent = 52;
    this.motocyclettesPourcent = 27;
    this.automobilesPourcent = 21;

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
