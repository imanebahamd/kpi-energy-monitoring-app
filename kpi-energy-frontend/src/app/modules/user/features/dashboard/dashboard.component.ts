import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnomalyService, AnomalyStats } from '../../../../core/services/anomaly.service';
import { AuthService } from '../../../../core/services/auth.service';

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

        <!-- Section Alertes Anomalies pour les utilisateurs -->
        <div class="anomalies-section" *ngIf="anomalyStats">
          <div class="section-header">
            <h3 class="section-title">🛡️ Surveillance des Anomalies</h3>
            <p class="section-subtitle">Détection automatique des problèmes</p>
          </div>

          <div class="anomaly-cards">
            <div class="anomaly-card" [class.critical]="anomalyStats.critical_anomalies > 0">
              <div class="anomaly-icon">⚠️</div>
              <div class="anomaly-content">
                <h4 class="anomaly-title">Anomalies Actives</h4>
                <div class="anomaly-value">{{ anomalyStats.total_active_anomalies }}</div>
                <div class="anomaly-subtext" *ngIf="anomalyStats.critical_anomalies > 0">
                  {{ anomalyStats.critical_anomalies }} critique(s)
                </div>
              </div>
            </div>

            <div class="anomaly-card">
              <div class="anomaly-icon">🕒</div>
              <div class="anomaly-content">
                <h4 class="anomaly-title">Dernière Détection</h4>
                <div class="anomaly-value">{{ anomalyStats.last_detection | date:'short' }}</div>
                <div class="anomaly-subtext">Scan automatique quotidien</div>
              </div>
            </div>

            <a routerLink="/user/anomalies" class="anomaly-card action-card">
              <div class="anomaly-icon">📋</div>
              <div class="anomaly-content">
                <h4 class="anomaly-title">Voir les Anomalies</h4>
                <div class="anomaly-subtext">Consulter le détail</div>
              </div>
            </a>
          </div>
        </div>

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
          <div class="feature-item">
            <span class="feature-icon">🛡️</span>
            <span>Détection d'anomalies</span>
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
      max-width: 800px; /* Augmentez la largeur pour accommoder les nouvelles sections */
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

    /* Styles pour la section anomalies */
    .anomalies-section {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #4361ee;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      color: #2b2d42;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .section-subtitle {
      color: #6c757d;
      font-size: 1rem;
    }

    .anomaly-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .anomaly-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .anomaly-card.critical {
      border: 2px solid #dc3545;
    }

    .anomaly-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .anomaly-title {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: #2b2d42;
    }

    .anomaly-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #4361ee;
    }

    .anomaly-subtext {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .action-card {
      display: block;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
      text-decoration: none;
      color: inherit;
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

    @media (max-width: 768px) {
      .welcome-card {
        padding: 1.5rem;
      }

      .welcome-title {
        font-size: 1.7rem;
      }

      .anomaly-cards {
        grid-template-columns: 1fr;
      }

      .features {
        flex-direction: column;
        gap: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  anomalyStats: AnomalyStats | null = null;

  constructor(
    private anomalyService: AnomalyService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnomalyStats();
  }

  private loadAnomalyStats(): void {
    this.anomalyService.getStats().subscribe({
      next: (stats: AnomalyStats) => {
        this.anomalyStats = stats;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des statistiques d\'anomalies', err);
      }
    });
  }
}
