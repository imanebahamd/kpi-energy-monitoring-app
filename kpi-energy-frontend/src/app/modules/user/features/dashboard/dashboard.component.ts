import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AnomalyService, AnomalyStats } from '../../../../core/services/anomaly.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ElectricityService } from '../../../shared-features/electricity-saisie/electricity.service';
import { WaterService } from '../../../shared-features/water-saisie/water.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('electricityChart') electricityChart?: BaseChartDirective;
  @ViewChild('waterChart') waterChart?: BaseChartDirective;

  selectedYear: number = 2022;
  years: number[] = [];
  electricityData: any[] = [];
  waterData: any[] = [];
  isLoading = true;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert = false;
  anomalyStats: AnomalyStats | null = null;

  // Configuration des graphiques électriques
  public consumptionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => `${context.dataset.label}: ${Number(context.parsed.y).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} kWh`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return Number(value).toLocaleString('fr-FR') + ' kWh';
          }
        }
      }
    }
  };

  // Configuration des graphiques eau
  public waterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => `${context.dataset.label}: ${Number(context.parsed.y).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} m³`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return Number(value).toLocaleString('fr-FR') + ' m³';
          }
        }
      }
    }
  };

  public consumptionChartData: ChartConfiguration['data'] = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [
      {
        label: 'Réseau 60KV',
        data: [],
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        borderColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Réseau 22KV',
        data: [],
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderColor: 'rgba(138, 43, 226, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };

  public waterChartData: ChartConfiguration['data'] = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    datasets: [
      {
        label: 'Production Eau Totale',
        data: [],
        backgroundColor: 'rgba(32, 178, 170, 0.1)',
        borderColor: 'rgba(32, 178, 170, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };

  constructor(
    private electricityService: ElectricityService,
    private waterService: WaterService,
    public authService: AuthService,
    private anomalyService: AnomalyService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeYears();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadAnomalyStats();
  }

  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let year = currentYear; year >= 2014; year--) {
      this.years.push(year);
    }
  }

  onYearChange(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.showAlert = false;
    this.resetChartData();

    let electricityLoaded = false;
    let waterLoaded = false;

    const checkLoadingComplete = () => {
      if (electricityLoaded && waterLoaded) {
        this.isLoading = false;
        this.updateChartsDisplay();
      }
    };

    // Charger les données électriques
    this.electricityService.getAnnualSummary(this.selectedYear).subscribe({
      next: (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.electricityData = data;
          this.updateElectricityChart();
          this.showAlertMessage(`Données électriques ${this.selectedYear} chargées avec succès`, 'success');
        } else {
          this.electricityData = [];
          this.showAlertMessage(`Aucune donnée électrique disponible pour ${this.selectedYear}`, 'warning');
        }
        electricityLoaded = true;
        checkLoadingComplete();
      },
      error: (err) => {
        console.error('Erreur données électriques:', err);
        this.electricityData = [];
        this.showAlertMessage('Erreur lors du chargement des données électriques', 'error');
        electricityLoaded = true;
        checkLoadingComplete();
      }
    });

    // Charger les données eau
    this.waterService.getMonthlyData(this.selectedYear).subscribe({
      next: (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.waterData = data;
          this.updateWaterChart();
          if (!this.showAlert) {
            this.showAlertMessage(`Données eau ${this.selectedYear} chargées avec succès`, 'success');
          }
        } else {
          this.waterData = [];
          this.showAlertMessage(`Aucune donnée eau disponible pour ${this.selectedYear}`, 'warning');
        }
        waterLoaded = true;
        checkLoadingComplete();
      },
      error: (err) => {
        console.error('Erreur données eau:', err);
        this.waterData = [];
        this.showAlertMessage('Erreur lors du chargement des données eau', 'error');
        waterLoaded = true;
        checkLoadingComplete();
      }
    });
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

  private resetChartData(): void {
    this.consumptionChartData.datasets[0].data = Array(12).fill(0);
    this.consumptionChartData.datasets[1].data = Array(12).fill(0);
    this.waterChartData.datasets[0].data = Array(12).fill(0);
  }

  private updateElectricityChart(): void {
    const newData = Array(12).fill(0);
    const newData22 = Array(12).fill(0);

    if (this.electricityData && this.electricityData.length > 0) {
      this.electricityData.forEach((item: any) => {
        if (item.month && item.month >= 1 && item.month <= 12) {
          const monthIndex = item.month - 1;
          newData[monthIndex] = Number(item.network60kvConsumption) || 0;
          newData22[monthIndex] = Number(item.network22kvConsumption) || 0;
        }
      });
    }

    this.consumptionChartData.datasets[0].data = [...newData];
    this.consumptionChartData.datasets[1].data = [...newData22];
  }

  private updateWaterChart(): void {
    const newData = Array(12).fill(0);

    if (this.waterData && this.waterData.length > 0) {
      this.waterData.forEach((item: any) => {
        if (item.month && item.month >= 1 && item.month <= 12) {
          const monthIndex = item.month - 1;
          newData[monthIndex] = Number(item.totalProduction) || 0;
        }
      });
    }

    this.waterChartData.datasets[0].data = [...newData];
  }

  private updateChartsDisplay(): void {
    setTimeout(() => {
      if (this.electricityChart?.chart) {
        this.electricityChart.chart.update();
      }
      if (this.waterChart?.chart) {
        this.waterChart.chart.update();
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 5000);
  }

  // Méthodes de calcul pour les KPIs
  getTotalConsumption(): number {
    if (!this.electricityData || this.electricityData.length === 0) return 0;
    return this.electricityData.reduce((sum: number, item: any) =>
      sum + (Number(item.network60kvConsumption) || 0) + (Number(item.network22kvConsumption) || 0), 0);
  }

  getTotalWaterProduction(): number {
    if (!this.waterData || this.waterData.length === 0) return 0;
    return this.waterData.reduce((sum: number, item: any) =>
      sum + (Number(item.totalProduction) || 0), 0);
  }

  getAveragePowerFactor(): number {
    if (!this.electricityData || this.electricityData.length === 0) return 0;
    const validItems = this.electricityData.filter((item: any) =>
      item.network60kvPowerFactor && Number(item.network60kvPowerFactor) > 0);
    return validItems.length > 0
      ? validItems.reduce((sum: number, item: any) =>
      sum + Number(item.network60kvPowerFactor), 0) / validItems.length
      : 0;
  }

  // Méthodes utilitaires
  hasElectricityData(): boolean {
    return this.electricityData && this.electricityData.length > 0;
  }

  hasWaterData(): boolean {
    return this.waterData && this.waterData.length > 0;
  }

  formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  }

  // Méthodes utilitaires pour la section anomalies
  isScanDue(lastDetection: string | null): boolean {
    if (!lastDetection) return false;
    const lastScanDate = new Date(lastDetection);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastScanDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1;
  }

  getAnomalyTypes(anomaliesByType: { [key: string]: number } | undefined): string[] {
    if (!anomaliesByType) return [];
    return Object.keys(anomaliesByType);
  }

  getBarHeight(value: number, anomaliesByType: { [key: string]: number } | undefined): string {
    if (!anomaliesByType) return '10%';
    const values = Object.values(anomaliesByType);
    const maxValue = Math.max(...values, 1);
    const percentage = (value / maxValue) * 100;
    return `${Math.max(percentage, 10)}%`;
  }

  formatAnomalyType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'consumption_spike': 'Pic de consommation',
      'unusual_pattern': 'Modèle inhabituel',
      'data_gap': 'Données manquantes',
      'value_outlier': 'Valeur aberrante',
      'seasonal_deviation': 'Écart saisonnier',
      'high_consumption': 'Consommation élevée',
      'low_consumption': 'Consommation faible',
      'irregular_pattern': 'Modèle irrégulier'
    };
    return typeMap[type] || type;
  }
}
