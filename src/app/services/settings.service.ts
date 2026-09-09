import { Injectable, signal } from '@angular/core';

/** Préférences métier stockées dans la page Paramètres */
export interface AppSettings {
  /** L'admin peut affecter plusieurs techniciens à une même alerte */
  multiTechniciens: boolean;
  /** Nombre maximal de techniciens par intervention (si multi activé) */
  maxTechniciens: number;
  /** Les techniciens peuvent prendre une alerte sans affectation admin préalable */
  priseEnChargeGlobale: boolean;
  /** Le bouton d'affectation agit comme une planification de maintenance */
  planifierMaintenance: boolean;
  /** Les techniciens inspectent d'abord les alertes avant de les prendre */
  inspectionTechniciens: boolean;
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
      inspectionTechniciens: false
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