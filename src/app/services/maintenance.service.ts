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

  constructor() {
    // Synchronisation multi-onglets : si un autre onglet (autre technicien)
    // prend une alerte, cet onglet se met à jour immédiatement afin d'éviter
    // que deux techniciens se dirigent vers le même équipement en même temps.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === this.STORAGE_KEY && event.newValue) {
          try {
            this.maintenanceItems.set(JSON.parse(event.newValue));
          } catch {
            /* données invalides : on ignore */
          }
        }
      });
    }
  }

  private loadInitialData(): MaintenanceItem[] {
    // Nettoyage de l'ancienne clé de stockage (migration v1 -> v2)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safe_track_maintenance');
    }
    // Charger les données persistées : les prises d'alerte doivent survivre
    // à un rafraîchissement pour que tous les techniciens voient qui a pris quoi.
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          const stored = JSON.parse(raw) as MaintenanceItem[];
          if (Array.isArray(stored) && stored.length > 0) {
            return stored;
          }
        } catch {
          /* données corrompues : on retombe sur les données de démonstration */
        }
      }
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

  /**
   * Prendre une alerte / un équipement en charge (technicien ou admin).
   * La prise en charge est IMMÉDIATE : aucune validation admin n'est requise.
   * Le nom du technicien et la date de prise sont enregistrés afin que les
   * autres techniciens voient immédiatement que l'alerte est déjà prise.
   *
   * @returns true si la prise en charge a réussi,
   *          false si l'alerte est déjà prise par quelqu'un d'autre.
   */
  prendreAlerte(id: string, userName: string): boolean {
    const target = this.maintenanceItems().find(i => i.id === id);

    // Garde anti-doublon : une seule personne peut prendre une même alerte
    if (!target || target.prisPar) {
      return false;
    }

    const datePrise = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const items = this.maintenanceItems().map(item =>
      item.id === id
        ? { ...item, prisPar: userName, datePrise, statut: 'En cours' as const }
        : item
    );
    this.maintenanceItems.set(items);
    this.save(items);

    // Créer une notification informant que l'alerte est prise en charge
    const notif: NotificationItem = {
      id: 'n' + Date.now(),
      itemId: id,
      equipment: target.equipment,
      type: target.type,
      technicien: userName,
      message: `${userName} a pris l'alerte "${target.type}" sur ${target.equipment}. Intervention en cours.`,
      date: datePrise,
      read: false
    };
    this.notifications.set([...this.notifications(), notif]);

    return true;
  }

  /**
   * Valider une alerte côté admin (depuis le panneau de notifications).
   * Accepte l'identifiant d'une notification ('n...') ou d'une maintenance ('m...').
   */
  validerAlerte(id: string): void {
    if (id.startsWith('n')) {
      // Validation depuis une notification : la marquer comme traitée
      this.notifications.set(
        this.notifications().map(n => (n.id === id ? { ...n, read: true } : n))
      );
      return;
    }
    // Validation directe d'un item : l'alerte est acquittée
    const items = this.maintenanceItems().map(item =>
      item.id === id ? { ...item, alertes: 0 } : item
    );
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
