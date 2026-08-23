import { Injectable, signal } from '@angular/core';

export interface MaintenanceItem {
  id: string;
  equipment: string;
  type: string;
  datePrevue: string;
  technicien: string;
  statut: 'Planifiée' | 'En attente' | 'En cours' | 'Terminée';
  alertes: number;
  prisPar?: string;
  datePrise?: string;
  rapport?: RapportIntervention;
}

export interface NotificationItem {
  id: string;
  itemId: string;
  equipment: string;
  type: string;
  technicien: string;
  message: string;
  date: string;
  read: boolean;
}

export interface RapportIntervention {
  contenu: string;
  dateRedaction: string;
  redacteur: string;
  piecesRemplacees?: string;
  dureeIntervention?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private readonly STORAGE_KEY = 'safe_track_maintenance_v2';

  readonly maintenanceItems = signal<MaintenanceItem[]>(this.loadInitialData());
  readonly notifications = signal<NotificationItem[]>([]);

  private loadInitialData(): MaintenanceItem[] {
    // Supprimer les anciennes clés de stockage pour forcer le chargement des nouvelles données
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safe_track_maintenance');
      localStorage.removeItem('safe_track_maintenance_v2');
    }
    const items: MaintenanceItem[] = [
      { id: 'm1', equipment: 'Kit solaire #SK-045', type: 'Charge trop lente', datePrevue: '15 août 2026', technicien: 'M. Ouedraogo', statut: 'Planifiée', alertes: 1 },
      { id: 'm2', equipment: 'Engin minier #EM-012', type: 'Panne batterie', datePrevue: '18 août 2026', technicien: 'M. Traore', statut: 'En cours', alertes: 2, prisPar: 'M. Traore', datePrise: 'Il y a 2 h' },
      { id: 'm3', equipment: 'Groupe électrogène #GE-008', type: 'Problème de câblage', datePrevue: '12 août 2026', technicien: 'M. Ouedraogo', statut: 'Terminée', alertes: 0, prisPar: 'M. Ouedraogo', datePrise: 'Il y a 3 jours' }
    ];
    this.save(items);
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
          statut: 'En attente' as const
        };
      }
      return item;
    });
    this.maintenanceItems.set(items);
    this.save(items);

    // Créer une notification pour l'admin
    const item = this.maintenanceItems().find(i => i.id === id);
    if (item) {
      const notif: NotificationItem = {
        id: 'n' + Date.now(),
        itemId: id,
        equipment: item.equipment,
        type: item.type,
        technicien: userName,
        message: `${userName} a pris l'alerte "${item.type}" sur ${item.equipment}. En attente de validation.`,
        date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      this.notifications.set([...this.notifications(), notif]);
    }
  }

  /** Valider une alerte prise par un technicien (admin uniquement) */
  validerAlerte(id: string): void {
    const items = this.maintenanceItems().map(item => {
      if (item.id === id && item.statut === 'En attente') {
        return { ...item, statut: 'En cours' as const };
      }
      return item;
    });
    this.maintenanceItems.set(items);
    this.save(items);

    // Marquer les notifications liées à cet item comme lues
    const updatedNotifs = this.notifications().map(n =>
      n.itemId === id ? { ...n, read: true } : n
    );
    this.notifications.set(updatedNotifs);
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

  /** Ajouter un rapport d'intervention pour une maintenance */
  redigerRapport(id: string, rapport: RapportIntervention): void {
    const items = this.maintenanceItems().map(item => {
      if (item.id === id) {
        return {
          ...item,
          rapport: {
            ...rapport,
            dateRedaction: new Date().toLocaleDateString('fr-FR'),
            redacteur: rapport.redacteur || 'Technicien'
          }
        };
      }
      return item;
    });
    this.maintenanceItems.set(items);
    this.save(items);
  }

  /** Récupérer le rapport d'une intervention */
  getRapport(id: string): RapportIntervention | undefined {
    return this.maintenanceItems().find(i => i.id === id)?.rapport;
  }

  /** Réinitialiser les données mock */
  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.maintenanceItems.set(this.loadInitialData());
  }
}
