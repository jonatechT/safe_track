import { Injectable, signal } from '@angular/core';

/** Préférences métier stockées dans la page Paramètres — elles pilotent tout le trafic de la plateforme. */
export interface AppSettings {
  /** L'admin peut affecter plusieurs techniciens à une même alerte */
  multiTechniciens: boolean;
  /** Nombre maximal de techniciens par intervention (valeur libre définie par l'admin) */
  maxTechniciens: number;
  /** Les techniciens peuvent prendre une alerte sans attendre une affectation de l'admin */
  priseEnChargeGlobale: boolean;
  /** Le bouton d'affectation de l'admin devient une planification d'intervention de maintenance */
  planifierMaintenance: boolean;
  /** Jours avant la date d'une intervention planifiée : les techniciens affectés reçoivent une notification */
  rappelAvantIntervention: number;
  /** Natures possibles d'une intervention planifiée (une par ligne dans les paramètres) */
  naturesIntervention: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'safe_track_settings';

  readonly settings = signal<AppSettings>(this.load());

  private defaults(): AppSettings {
    return {
      multiTechniciens: false,
      maxTechniciens: 2,
      priseEnChargeGlobale: true,
      planifierMaintenance: false,
      rappelAvantIntervention: 2,
      naturesIntervention: ['Préventive', 'Corrective', 'Inspection', 'Nettoyage', 'Réparation', 'Mise à jour']
    };
  }

  private load(): AppSettings {
    if (typeof window === 'undefined') return this.defaults();
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        return { ...this.defaults(), ...parsed };
      }
    } catch {
      /* données corrompues → valeurs par défaut */
    }
    return this.defaults();
  }

  private save(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings()));
    }
  }

  /** Met à jour tout ou partie des paramètres (persisté) */
  update(patch: Partial<AppSettings>): void {
    this.settings.set({ ...this.settings(), ...patch });
    this.save();
  }

  /** Réinitialise les préférences aux valeurs par défaut */
  reset(): void {
    this.settings.set(this.defaults());
    this.save();
  }
}