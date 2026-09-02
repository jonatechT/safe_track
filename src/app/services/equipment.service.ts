import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BATTERY_API_CONFIG } from '../config/battery-api.config';
import { mockBatteryCurrentDiagnostic, mockBatteryHistory } from './batterie-mock-data';

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
 * Diagnostic batterie courant fourni par le backend :
 *   GET /api/batterie/{device_id}/actuel
 *
 * Aucune valeur n'est inventée côté frontend : le backend est l'unique source.
 * Les champs mesurés restent nullables tant qu'ils ne sont pas fournis.
 * La tension brute (`voltage_v`) est affichée telle quelle — aucune conversion
 * (ex. voltage / 4) n'est effectuée dans le frontend.
 */
export interface BatteryCurrentDiagnostic {
  device_id: string;
  /** Date/heure de la dernière analyse (ISO 8601). */
  date_heure: string;
  /** Tension brute du pack (V). */
  voltage_v: number | null;
  /** Courant de charge/décharge (A). */
  current_a: number | null;
  /** Température de la batterie (°C). */
  temperature_c: number | null;
  /** Profondeur de décharge (%). */
  dod_percent: number | null;
  /** État de santé / SOH (%). */
  soh_pourcent: number | null;
  /** Capacité restante (Ah). */
  capacite_restante_ah: number | null;
  /** Durée de vie estimée restante (jours). */
  duree_estimee_jours: number | null;
  /** Valeur fournie par le backend : 'Bon' | 'Surveiller' | 'À remplacer' (ou 'A_remplacer'). */
  etat: string | null;
  /** Message de maintenance fourni par le backend. */
  message: string | null;
}

/**
 * Point d'historique batterie fourni par le backend :
 *   GET /api/batterie/{device_id}/historique
 */
export interface BatteryHistoryEntry {
  date_heure: string;
  soh: number | null;
  capacite: number | null;
  rul_jours: number | null;
  temperature: number | null;
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  /**
   * Message d'erreur du dernier appel API batterie (null si aucun incident).
   * Consommé par les pages pour distinguer « backend indisponible » d'une
   * simple absence de données.
   */
  readonly batteryApiError = signal<string | null>(null);

  constructor(private http: HttpClient) {}

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

  /**
   * Diagnostic batterie courant — GET /api/batterie/{device_id}/actuel.
   *
   * Renvoie null si aucune donnée (404 / données absentes) ou en cas d'erreur
   * API / backend indisponible (le détail est alors exposé via `batteryApiError`).
   */
  getBatteryCurrentDiagnostic(deviceId: string): Observable<BatteryCurrentDiagnostic | null> {
    if (BATTERY_API_CONFIG.useMock) {
      return of(mockBatteryCurrentDiagnostic(deviceId));
    }
    this.batteryApiError.set(null);
    return this.http
      .get<BatteryCurrentDiagnostic>(`${BATTERY_API_CONFIG.baseUrl}/${encodeURIComponent(deviceId)}/actuel`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleBatteryError(error);
          return of(null);
        })
      );
  }

  /**
   * Historique batterie — GET /api/batterie/{device_id}/historique.
   *
   * Renvoie [] si aucune donnée (404) ou en cas d'erreur API / backend
   * indisponible (le détail est alors exposé via `batteryApiError`).
   */
  getBatteryHistory(deviceId: string): Observable<BatteryHistoryEntry[]> {
    if (BATTERY_API_CONFIG.useMock) {
      return of(mockBatteryHistory(deviceId));
    }
    this.batteryApiError.set(null);
    return this.http
      .get<BatteryHistoryEntry[]>(`${BATTERY_API_CONFIG.baseUrl}/${encodeURIComponent(deviceId)}/historique`)
      .pipe(
        map(list => (Array.isArray(list) ? list : [])),
        catchError((error: HttpErrorResponse) => {
          this.handleBatteryError(error);
          return of([]);
        })
      );
  }

  /** Traduit une erreur d'appel API batterie en message utilisable par les pages. */
  private handleBatteryError(error: HttpErrorResponse): void {
    // 404 = pas encore de données pour cet équipement : ce n'est pas une erreur bloquante.
    if (error.status === 404) {
      return;
    }
    if (error.status === 0) {
      this.batteryApiError.set(
        'Backend batterie indisponible. Vérifiez que le service de diagnostic est démarré, puis réessayez.'
      );
      return;
    }
    this.batteryApiError.set(`Erreur API batterie (HTTP ${error.status}).`);
  }
}