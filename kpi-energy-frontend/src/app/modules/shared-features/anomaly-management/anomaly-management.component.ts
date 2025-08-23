import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnomalyService, Anomaly, AnomalyStats } from '../../../core/services/anomaly.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-anomaly-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="anomaly-management">
      <div class="header">
        <h1>Gestion des Anomalies</h1>
        <p>Surveillance et résolution des problèmes détectés</p>
      </div>

      <div class="actions">
        <button (click)="loadAnomalies()" class="btn btn-primary">
          🔄 Actualiser
        </button>
        <button (click)="triggerScan()" class="btn btn-secondary">
          🔍 Scanner maintenant
        </button>
      </div>

      <div class="stats" *ngIf="stats">
        <div class="stat-card">
          <h3>Anomalies Actives</h3>
          <span class="stat-value">{{ stats.total_active_anomalies }}</span>
        </div>
        <div class="stat-card critical">
          <h3>Anomalies Critiques</h3>
          <span class="stat-value">{{ stats.critical_anomalies }}</span>
        </div>
      </div>

      <div class="filters">
        <label>
          <input type="checkbox" [(ngModel)]="showResolved" (change)="loadAnomalies()">
          Afficher les anomalies résolues
        </label>
      </div>

      <div class="anomalies-list">
        <div *ngFor="let anomaly of anomalies" class="anomaly-item" [class.resolved]="anomaly.resolved">
          <div class="anomaly-header">
            <span class="badge" [class]="getSeverityClass(anomaly.severityScore)">
              {{ anomaly.anomalyType }}
            </span>
            <span class="date">{{ anomaly.detectedAt | date:'medium' }}</span>
          </div>

          <div class="anomaly-content">
            <h4>{{ getAnomalyTitle(anomaly) }}</h4>
            <p>{{ anomaly.description }}</p>
            <div class="anomaly-meta">
              <span>Score: {{ anomaly.severityScore | number:'1.2-2' }}</span>
              <span>Source: {{ anomaly.sourceType }}</span>
            </div>
          </div>

          <div class="anomaly-actions" *ngIf="!anomaly.resolved && authService.isAdmin()">
            <button (click)="resolveAnomaly(anomaly.id)" class="btn btn-success">
              ✅ Marquer comme résolu
            </button>
          </div>

          <div class="resolution-info" *ngIf="anomaly.resolved">
            <p>Résolu par {{ anomaly.resolvedBy }} le {{ anomaly.resolvedAt | date:'medium' }}</p>
          </div>
        </div>

        <div *ngIf="anomalies.length === 0" class="no-anomalies">
          <p>🎉 Aucune anomalie détectée</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./anomaly-management.component.css']
})
export class AnomalyManagementComponent implements OnInit {
  anomalies: Anomaly[] = [];
  stats: AnomalyStats | null = null;
  showResolved = false;
  isLoading = false;

  constructor(
    private anomalyService: AnomalyService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnomalies();
    this.loadStats();
  }

  loadAnomalies(): void {
    this.isLoading = true;
    this.anomalyService.getAnomalies(this.showResolved).subscribe({
      next: (data: Anomaly[]) => {
        this.anomalies = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des anomalies', err);
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.anomalyService.getStats().subscribe({
      next: (data: AnomalyStats) => this.stats = data,
      error: (err: any) => console.error('Erreur lors du chargement des stats', err)
    });
  }

  triggerScan(): void {
    this.anomalyService.triggerScan().subscribe({
      next: (response: string) => {
        alert('Scan déclenché avec succès');
        setTimeout(() => this.loadAnomalies(), 2000);
      },
      error: (err: any) => alert('Erreur lors du scan')
    });
  }

  resolveAnomaly(id: number): void {
    const resolvedBy = this.authService.getCurrentUser()?.nomComplet || 'Admin';
    this.anomalyService.resolveAnomaly(id, resolvedBy, 'Résolu manuellement').subscribe({
      next: () => this.loadAnomalies(),
      error: (err: any) => alert('Erreur lors de la résolution')
    });
  }

  getSeverityClass(score: number): string {
    if (score >= 0.8) return 'critical';
    if (score >= 0.5) return 'warning';
    return 'info';
  }

  getAnomalyTitle(anomaly: Anomaly): string {
    return `Anomalie ${anomaly.sourceType} - ${anomaly.year}-${anomaly.month}`;
  }
}
