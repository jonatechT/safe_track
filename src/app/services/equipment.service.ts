import { Injectable } from '@angular/core';

/**
 * Modèle d'un équipement du parc.
 * Les données de localisation proviennent de la source existante (mock app.routes.ts).
 * NOTE BACKEND : temperature et tension ne sont pas encore fournies par l'API.
 * Ces champs sont prévus (null par défaut) pour accueillir les futures données capteurs.
 */
export interface Equipment {
  imei: string;
  nom: string;
  statut: string;
  localisation: string;
  lienLocalisation: string;
  miseEnLigne: string;
  type: string;
  /** Non fourni par le backend actuellement — nécessite une source capteur */
  temperature: number | null;
  /** Non fourni par le backend actuellement — nécessite une source capteur */
  tension: number | null;
}

export interface EquipmentDiagnostic {
  etat: string;
  gravite: string;
  anomalie: string | null;
}

/**
 * Diagnostic batterie fourni par le backend.
 * Les champs sont optionnels car le backend n'est pas encore connecté.
 */
export interface BatteryDiagnostic {
  etat: 'Bon' | 'Surveiller' | 'A_remplacer';
  duree_estimee_jours: number;
  duree_min_jours: number;
  duree_max_jours: number;
  priorite: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  /** Données identiques à celles affichées jusqu'ici dans le tableau du parc */
  private equipments: Equipment[] = [
     { imei: '354123456789012', nom: 'Kit solaire #SK-045', statut: 'En alerte', localisation: '12.3685°N, -1.5250°E', lienLocalisation: '12.3685,-1.5250', miseEnLigne: '14 mars 2024', type: 'Kit solaire', temperature: null, tension: null },
     { imei: '354123456789014', nom: 'Kit solaire #SK-067', statut: 'En alerte', localisation: '11.1784°N, -4.2979°E', lienLocalisation: '11.1784,-4.2979', miseEnLigne: '22 janvier 2024', type: 'Kit solaire', temperature: null, tension: null },
     { imei: '354123456789015', nom: 'Kit solaire #SK-089', statut: 'Inspection', localisation: '12.2513°N, -2.3510°E', lienLocalisation: '12.2513,-2.3510', miseEnLigne: '5 juin 2024', type: 'Kit solaire', temperature: null, tension: null },
     { imei: '354123456789016', nom: 'Kit solaire #SK-102', statut: 'Inspection', localisation: '12.3714°N, -1.5197°E', lienLocalisation: '12.3714,-1.5197', miseEnLigne: '18 septembre 2023', type: 'Kit solaire', temperature: null, tension: null },
  ];

  getAll(): Equipment[] {
    return this.equipments;
  }

  getByImei(imei: string): Equipment | undefined {
    return this.equipments.find(e => e.imei === imei);
  }

  /**
   * Diagnostic dérivé du statut réel de l'équipement (aucune donnée inventée).
   */
  getDiagnostic(equipment: Equipment): EquipmentDiagnostic {
    if (equipment.statut.includes('En alerte')) {
      return { etat: 'Anomalie détectée', gravite: 'Élevée', anomalie: 'Alerte active sur cet équipement' };
    }
    if (equipment.statut.includes('Inspection')) {
      return { etat: 'Inspection requise', gravite: 'Moyenne', anomalie: 'Contrôle à planifier' };
    }
    return { etat: 'État normal', gravite: '—', anomalie: null };
  }
}