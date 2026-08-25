import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pending-page">
      <div class="pending-card">
        <div class="pending-icon">
          <i class="fa-solid fa-hourglass-half"></i>
        </div>
        <h1 class="pending-title">Compte en attente de validation</h1>
        <p class="pending-message">
          Votre inscription a bien été enregistrée. Un administrateur doit valider
          votre compte avant que vous puissiez accéder à votre tableau de bord.
        </p>
        <div class="pending-steps">
          <div class="pending-step done">
            <i class="fa-solid fa-circle-check"></i> Inscription enregistrée
          </div>
          <div class="pending-step current">
            <i class="fa-solid fa-hourglass-half"></i> Validation par l'administrateur
          </div>
          <div class="pending-step">
            <i class="fa-solid fa-lock"></i> Accès au tableau de bord
          </div>
        </div>
        <a routerLink="/login" class="pending-btn">
          <i class="fa-solid fa-arrow-left"></i> Retour à la connexion
        </a>
      </div>
    </div>
  `,
  styles: [`
    .pending-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #F0F7FF, #DBEAFE);
      padding: 24px;
    }
    .pending-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 12px 40px rgba(30, 58, 138, 0.12);
    }
    .pending-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FBBF24, #D97706);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
    }
    .pending-title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 12px;
    }
    .pending-message {
      font-size: 14px;
      line-height: 1.6;
      color: #64748B;
      margin: 0 0 28px;
    }
    .pending-steps {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 28px;
      text-align: left;
    }
    .pending-step {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
    }
    .pending-step i { font-size: 14px; }
    .pending-step.done {
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }
    .pending-step.current {
      background: #FFFBEB;
      color: #B45309;
      border: 1px solid #FCD34D;
    }
    .pending-step:not(.done):not(.current) {
      background: #F1F5F9;
      color: #94A3B8;
      border: 1px solid #E2E8F0;
    }
    .pending-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      background: #2563EB;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .pending-btn:hover {
      background: #1D4ED8;
      transform: translateY(-1px);
    }
  `]
})
export class PendingComponent {}