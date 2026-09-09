import { Component } from '@angular/core';
import { BasePageComponent } from '../base-page/base-page';
import { SettingsService, AppSettings } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [BasePageComponent],
  template: `
<app-base-page
      title="Paramètres"
      subtitle="Gérez le mode nuit et la configuration des interventions sur les alertes de votre parc."
      icon="fa-solid fa-gear"
    >
      <div class="stg-content">
        @if (message) {
          <div class="stg-alert stg-alert--success" role="status">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ message }}</span>
          </div>
        }

        <!-- ===== Gestion des interventions ===== -->
        <div class="stg-card">
          <div class="stg-card-header">
            <div class="stg-card-icon"><i class="fa-solid fa-user-clock"></i></div>
            <div>
              <h3 class="stg-card-title">Gestion des interventions</h3>
              <p class="stg-card-subtitle">Personnalisez la façon dont les alertes sont prises en charge par les techniciens.</p>
            </div>
          </div>

          <div class="stg-row">
            <div class="stg-row-info">
              <span class="stg-row-title">Prise en charge multiple</span>
              <span class="stg-row-desc">Permettre à l'admin d'affecter plusieurs techniciens à une même alerte.</span>
            </div>
            <label class="stg-switch">
              <input type="checkbox" [checked]="settings.multiTechniciens" (change)="toggle('multiTechniciens', $any($event.target).checked)" />
              <span class="stg-slider"></span>
            </label>
          </div>

          @if (settings.multiTechniciens) {
            <div class="stg-row stg-row--sub">
              <div class="stg-row-info">
                <span class="stg-row-title">Nombre maximal de techniciens</span>
                <span class="stg-row-desc">Limite du nombre de techniciens pouvant être affectés à une même intervention.</span>
              </div>
              <select class="stg-select" [value]="settings.maxTechniciens" (change)="setMax($any($event.target).value)" aria-label="Nombre maximal de techniciens">
                <option [value]="2">2 techniciens</option>
                <option [value]="3">3 techniciens</option>
              </select>
            </div>
          }

          <div class="stg-sep"></div>

          <div class="stg-row">
            <div class="stg-row-info">
              <span class="stg-row-title">Prise en charge globale</span>
              <span class="stg-row-desc">Les techniciens peuvent prendre eux-mêmes une alerte sans attendre une affectation de l'admin.</span>
            </div>
            <label class="stg-switch">
              <input type="checkbox" [checked]="settings.priseEnChargeGlobale" (change)="toggle('priseEnChargeGlobale', $any($event.target).checked)" />
              <span class="stg-slider"></span>
            </label>
          </div>

          <div class="stg-sep"></div>

          <div class="stg-row">
            <div class="stg-row-info">
              <span class="stg-row-title">Planifier une maintenance</span>
              <span class="stg-row-desc">Le bouton d'affectation de l'admin devient une planification d'intervention de maintenance.</span>
            </div>
            <label class="stg-switch">
              <input type="checkbox" [checked]="settings.planifierMaintenance" (change)="toggle('planifierMaintenance', $any($event.target).checked)" />
              <span class="stg-slider"></span>
            </label>
          </div>

          <div class="stg-sep"></div>

          <div class="stg-row">
            <div class="stg-row-info">
              <span class="stg-row-title">Inspection par les techniciens</span>
              <span class="stg-row-desc">Les techniciens peuvent inspecter les alertes avant la prise en charge (bouton « Inspecter »).</span>
            </div>
            <label class="stg-switch">
              <input type="checkbox" [checked]="settings.inspectionTechniciens" (change)="toggle('inspectionTechniciens', $any($event.target).checked)" />
              <span class="stg-slider"></span>
            </label>
          </div>
        </div>

        <!-- ===== Apparence ===== -->
        <div class="stg-card">
          <div class="stg-card-header">
            <div class="stg-card-icon stg-card-icon--purple"><i class="fa-solid fa-palette"></i></div>
            <div>
              <h3 class="stg-card-title">Apparence</h3>
              <p class="stg-card-subtitle">Personnalisez l'interface de l'application.</p>
            </div>
          </div>
          <div class="stg-row">
            <div class="stg-row-info">
              <span class="stg-row-title">Mode nuit</span>
              <span class="stg-row-desc">Bascule toute l'interface en thème sombre (synchronisé avec le bouton du header).</span>
            </div>
            <label class="stg-switch">
              <input type="checkbox" [checked]="isDark" (change)="toggleTheme()" />
              <span class="stg-slider"></span>
            </label>
          </div>
        </div>

        <!-- ===== À propos ===== -->
        <div class="stg-card">
          <div class="stg-card-header">
            <div class="stg-card-icon stg-card-icon--purple"><i class="fa-solid fa-circle-info"></i></div>
            <div>
              <h3 class="stg-card-title">À propos</h3>
              <p class="stg-card-subtitle">Informations sur l'application.</p>
            </div>
          </div>
          <div class="stg-row">
            <div class="stg-row-info">
              <span class="stg-row-title">SAFE Track</span>
              <span class="stg-row-desc">Plateforme de suivi et de télémaintenance des équipements — version {{ appVersion }}.</span>
            </div>
          </div>
        </div>
      </div>
    </app-base-page>
  `,
  styles: [
    `
.stg-content { display: flex; flex-direction: column; gap: 20px; width: 100%; }

    .stg-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
    }
    .stg-alert--success { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .stg-alert i { font-size: 14px; }

    .stg-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px 22px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04);
    }

    .stg-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .stg-card-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #EFF6FF;
      color: #2563EB;
      font-size: 17px;
      flex-shrink: 0;
    }
    .stg-card-icon--purple { background: #F3E8FF; color: #7C3AED; }
    .stg-card-icon--red { background: #FEF2F2; color: #DC2626; }
    .stg-card-title { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; }
    .stg-card-subtitle { margin: 2px 0 0; font-size: 12px; color: #64748B; }

    .stg-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 0; }
    .stg-row--sub { padding-left: 16px; }
    .stg-sep { height: 1px; background: #F1F5F9; margin: 8px 0; }
    .stg-row-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .stg-row-title { font-size: 13px; font-weight: 600; color: #0F172A; }
    .stg-row-desc { font-size: 12px; color: #64748B; }

    .stg-switch { position: relative; display: inline-block; width: 46px; height: 26px; flex-shrink: 0; }
    .stg-switch input { opacity: 0; width: 0; height: 0; }
    .stg-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: #CBD5E1;
      border-radius: 26px;
      transition: background 0.2s ease;
    }
    .stg-slider::before {
      content: '';
      position: absolute;
      height: 20px;
      width: 20px;
      left: 3px;
      top: 3px;
      background: #FFFFFF;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
    }
    .stg-switch input:checked + .stg-slider { background: #2563EB; }
    .stg-switch input:checked + .stg-slider::before { transform: translateX(20px); }

    .stg-select {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #0F172A;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .stg-select:focus { border-color: #2563EB; }

    @media (max-width: 640px) {
      .stg-row { flex-direction: column; align-items: flex-start; }
    }
    `
  ]
})
export class SettingsPageComponent {
  protected message = '';
  protected appVersion = '1.0.0';

  constructor(
    protected settingsService: SettingsService,
    private themeService: ThemeService
  ) {}

  protected get settings(): AppSettings {
    return this.settingsService.settings();
  }

  protected get isDark(): boolean {
    return this.themeService.isDark();
  }

  protected toggle(key: keyof AppSettings, value: boolean): void {
    this.settingsService.update({ [key]: value } as Partial<AppSettings>);
  }

  protected setMax(value: string): void {
    this.settingsService.update({ maxTechniciens: Number(value) });
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }
}