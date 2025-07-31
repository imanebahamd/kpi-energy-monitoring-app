import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <div class="welcome-card">
        <div class="logo">⚡</div>
        <h1 class="welcome-title">Bienvenue sur EnergyTracker</h1>
        <p class="welcome-message">
          Votre application de gestion et suivi des KPIs énergétiques
        </p>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>Suivi en temps réel</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <span>Analyses détaillées</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔋</span>
            <span>Optimisation énergétique</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
      background: #fff;
    }

    .welcome-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
      padding: 2.5rem;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .logo {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      color: #4361ee;
    }

    .welcome-title {
      color: #2b2d42;
      font-size: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .welcome-message {
      color: #6c757d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .features {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
    }

    .feature-icon {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 600px) {
      .welcome-card {
        padding: 1.5rem;
      }

      .welcome-title {
        font-size: 1.7rem;
      }

      .features {
        flex-direction: column;
        gap: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent {}
