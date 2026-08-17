import { Injectable, signal } from '@angular/core';

export interface MaintenanceItem {
  id: string;
  equipment: string;
  type: string;
  datePrevue: string;
  technicien: string;
  statut: 'Planifiée' | 'En cours' | 'Terminée';
  alertes: number;
  prisPar?: string;
  datePrise?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private readonly STORAGE_KEY = 'safe_track_maintenance';

  readonly maintenanceItems = signal<MaintenanceItem[]>(this.loadInitialData());

  private loadInitialData(): MaintenanceItem[] {
    let items: MaintenanceItem[] = [];
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        items = JSON.parse(raw);
      }
    }
    // Si aucune donnée en localStorage, on initialise avec des données mock
    if (items.length === 0) {
      items = [
        { id: 'm1', equipment: 'Kit solaire #SK-045', type: 'Nettoyage panneaux', datePrevue: '12 mai 2024', technicien: 'M. Ouedraogo', statut: 'Planifiée', alertes: 1 },
        { id: 'm2', equipment: 'Engin minier #EM-012', type: 'Remplacement batterie', datePrevue: '15 mai 2024', technicien: 'M. Traore', statut: 'En cours', alertes: 2, prisPar: 'M. Traore', datePrise: 'Il y a 2 h' },
        { id: 'm3', equipment: 'Véhicule #V-007', type: 'Vidange moteur', datePrevue: '18 mai 2024', technicien: 'M. Sanogo', statut: 'Planifiée', alertes: 0 }
      ];
      this.save(items);
    }
    return items;
  }

  private save(items: MaintenanceItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    }
  }

  getItems(): MaintenanceItem[] {
    return this.maintenanceItems();
  }

  /** Planifier une nouvelle maintenance (admin uniquement) */
  planifierMaintenance(item: Omit<MaintenanceItem, 'id'>): void {
    const newItem: MaintenanceItem = {
      ...item,
      id: 'm' + Date.now()
    };
    const items = [...this.maintenanceItems(), newItem];
    this.maintenanceItems.set(items);
    this.save(items);
  }

  /** Prendre une alerte / un équipement en charge (admin + user) */
  prendreAlerte(id: string, userName: string): void {
    const items = this.maintenanceItems().map(item => {
      if (item.id === id) {
        return {
          ...item,
          prisPar: userName,
          datePrise: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          statut: 'En cours' as const
        };
      }
      return item;
    });
    this.maintenanceItems.set(items);
    this.save(items);
  }

  /** Marquer une maintenance comme terminée */
  terminerMaintenance(id: string): void {
    const items = this.maintenanceItems().map(item => {
      if (item.id === id) {
        return { ...item, statut: 'Terminée' as const };
      }
      return item;
    });
    this.maintenanceItems.set(items);
    this.save(items);
  }

  /** Réinitialiser les données mock */
  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.maintenanceItems.set(this.loadInitialData());
  }
}