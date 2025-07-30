import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ElectricityService } from '../../electricity-saisie/electricity.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import {BaseChartDirective, NgChartsModule} from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import {
  Chart,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-electricity-graphs',
  standalone: true,
  imports: [NgChartsModule, CommonModule, FormsModule, NgChartsModule, RouterModule],
  templateUrl: './electricity-graphs.component.html',
  styleUrls: ['./electricity-graphs.component.scss']
})
export class ElectricityGraphsComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  year: number = new Date().getFullYear();
  chartType: ChartType = 'line';
  graphType: 'consumption' | 'powerFactor' = 'consumption';
  isLoading = false;
  error = '';
  noDataAvailable = false;
  months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  // Alert system
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert: boolean = false;
  isAdminUser: boolean = false;

  // Messages de validation
  validationMessages = {
    success: {
      dataLoaded: '✅ Données chargées avec succès'
    },
    error: {
      loadError: '❌ Erreur lors du chargement des données',
      noData: '⚠️ Aucune donnée disponible pour cette période'
    },
    info: {
      loading: '⏳ Chargement des données en cours...'
    }
  };

  // Options pour les graphiques de consommation
  public consumptionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Consommation (kWh)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y?.toFixed(2)} kWh`
        }
      },
      legend: { position: 'top' }
    }
  };

  // Options pour les graphiques de facteur de puissance
  public powerFactorChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Facteur de puissance'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y?.toFixed(3)}`
        }
      },
      legend: { position: 'top' }
    }
  };

  // Données pour les graphiques
  public consumptionChartData = {
    labels: this.months,
    datasets: [
      {
        label: 'Consommation 60KV',
        data: Array(12).fill(0),
        borderColor: '#3e95cd',
        backgroundColor: '#3e95cd80',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Consommation 22KV',
        data: Array(12).fill(0),
        borderColor: '#8e5ea2',
        backgroundColor: '#8e5ea280',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  };

  public powerFactorChartData = {
    labels: this.months,
    datasets: [
      {
        label: 'Facteur de puissance 60KV',
        data: Array(12).fill(0),
        borderColor: '#3cba9f',
        backgroundColor: '#3cba9f80',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Facteur de puissance 22KV',
        data: Array(12).fill(0),
        borderColor: '#e8c3b9',
        backgroundColor: '#e8c3b980',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  };

  constructor(private electricityService: ElectricityService,private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdminUser = this.authService.isAdmin();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private destroyChart(): void {
    if (this.chart?.chart) {
      this.chart.chart.destroy();
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';
    this.noDataAvailable = false;
    this.showDynamicAlert(this.validationMessages.info.loading, 'info');
    this.destroyChart();

    this.electricityService.getAnnualSummary(this.year).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.updateChartData(data);
          this.showDynamicAlert(this.validationMessages.success.dataLoaded, 'success');
          this.noDataAvailable = false;
        } else {
          this.noDataAvailable = true;
          this.showDynamicAlert(this.validationMessages.error.noData, 'error');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement des données';
        this.showDynamicAlert(this.validationMessages.error.loadError, 'error');
        this.isLoading = false;
        this.noDataAvailable = true;
      }
    });
  }

  private updateChartData(summaries: any[]): void {
    const consumptionData = JSON.parse(JSON.stringify(this.consumptionChartData));
    const powerFactorData = JSON.parse(JSON.stringify(this.powerFactorChartData));

    summaries.forEach(summary => {
      const monthIndex = summary.month - 1;
      // Mise à jour des données de consommation
      consumptionData.datasets[0].data[monthIndex] = summary.network60kvConsumption || 0;
      consumptionData.datasets[1].data[monthIndex] = summary.network22kvConsumption || 0;

      // Mise à jour des données de facteur de puissance
      powerFactorData.datasets[0].data[monthIndex] = summary.network60kvPowerFactor || 0;
      powerFactorData.datasets[1].data[monthIndex] = summary.network22kvPowerFactor || 0;
    });

    this.consumptionChartData = consumptionData;
    this.powerFactorChartData = powerFactorData;

    setTimeout(() => {
      this.chart?.update();
    }, 0);
  }

  changeChartType(type: ChartType): void {
    if (this.chartType !== type) {
      this.chartType = type;
      this.loadData();
    }
  }

  changeGraphType(type: 'consumption' | 'powerFactor'): void {
    if (this.graphType !== type) {
      this.graphType = type;
      this.loadData();
    }
  }

  get currentChartData() {
    return this.graphType === 'consumption'
      ? this.consumptionChartData
      : this.powerFactorChartData;
  }

  get currentChartOptions() {
    return this.graphType === 'consumption'
      ? this.consumptionChartOptions
      : this.powerFactorChartOptions;
  }

  private showDynamicAlert(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number = 5000): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, duration);
  }
  getRoutePrefix(): string {
    return this.isAdminUser ? '/admin' : '/user';
  }
}
