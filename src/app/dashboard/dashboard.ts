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
  }
}