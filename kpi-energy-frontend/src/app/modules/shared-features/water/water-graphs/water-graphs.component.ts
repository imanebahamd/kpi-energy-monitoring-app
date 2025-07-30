import { Component, OnInit } from '@angular/core';
import { WaterService } from '../../water-saisie/water.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-water-graphs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    MatSelectModule,
    MatTabsModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './water-graphs.component.html',
  styleUrls: ['./water-graphs.component.scss']
})
export class WaterGraphsComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  monthlyData: any[] = [];
  isLoading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  isAdminUser: boolean = false;

  // Graphiques
  monthlyTrendChart: any;
  monthlyComparisonChart: any;
  compositionChart: any;

  // Options
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} m³`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volume (m³)'
        }
      }
    }
  };

  constructor(
    private waterService: WaterService,
    private authService: AuthService
  ) {
    // Générer les années disponibles
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.isAdminUser = this.authService.isAdmin();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.showAlert = false;

    this.waterService.getMonthlyData(this.selectedYear).subscribe({
      next: (data) => {
        this.monthlyData = data;
        if (data.length > 0) {
          this.prepareCharts();
          this.showAlertMessage(`Données pour ${this.selectedYear} chargées avec succès`, 'success');
        } else {
          this.showAlertMessage(`Aucune donnée disponible pour ${this.selectedYear}`, 'warning');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading water data:', err);
        this.showAlertMessage('Erreur lors du chargement des données', 'error');
        this.isLoading = false;
      }
    });
  }

  prepareCharts(): void {
    this.prepareMonthlyTrendChart();
    this.prepareMonthlyComparisonChart();
    this.prepareCompositionChart();
  }

  prepareMonthlyTrendChart(): void {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    this.monthlyTrendChart = {
      labels: this.monthlyData.map(d => months[d.month - 1]),
      datasets: [
        {
          label: 'F3BIS',
          data: this.monthlyData.map(d => d.f3bis),
          borderColor: '#4bc0c0',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'F3',
          data: this.monthlyData.map(d => d.f3),
          borderColor: '#565656',
          backgroundColor: 'rgba(86, 86, 86, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'SE2',
          data: this.monthlyData.map(d => d.se2),
          borderColor: '#ff6384',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'SE3BIS',
          data: this.monthlyData.map(d => d.se3bis),
          borderColor: '#ff9f43',
          backgroundColor: 'rgba(255, 159, 67, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  prepareMonthlyComparisonChart(): void {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    this.monthlyComparisonChart = {
      labels: this.monthlyData.map(d => months[d.month - 1]),
      datasets: [
        {
          label: 'F3BIS',
          data: this.monthlyData.map(d => d.f3bis),
          backgroundColor: '#4bc0c0'
        },
        {
          label: 'F3',
          data: this.monthlyData.map(d => d.f3),
          backgroundColor: '#565656'
        },
        {
          label: 'SE2',
          data: this.monthlyData.map(d => d.se2),
          backgroundColor: '#ff6384'
        },
        {
          label: 'SE3BIS',
          data: this.monthlyData.map(d => d.se3bis),
          backgroundColor: '#ff9f43'
        }
      ]
    };
  }

  prepareCompositionChart(): void {
    const totals = {
      f3bis: this.monthlyData.reduce((sum, d) => sum + d.f3bis, 0),
      f3: this.monthlyData.reduce((sum, d) => sum + d.f3, 0),
      se2: this.monthlyData.reduce((sum, d) => sum + d.se2, 0),
      se3bis: this.monthlyData.reduce((sum, d) => sum + d.se3bis, 0)
    };

    this.compositionChart = {
      labels: ['F3BIS', 'F3', 'SE2', 'SE3BIS'],
      datasets: [
        {
          data: [totals.f3bis, totals.f3, totals.se2, totals.se3bis],
          backgroundColor: ['#4bc0c0', '#565656', '#ff6384', '#ff9f43'],
          hoverBackgroundColor: ['#36a2a2', '#454545', '#e64c6e', '#e68a39']
        }
      ]
    };
  }

  onYearChange(): void {
    this.loadData();
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  // Méthodes pour le résumé
  getTotalProduction(): number {
    return this.monthlyData.reduce((sum, current) => sum + (current.totalProduction || 0), 0);
  }

  getAverageProduction(): number {
    if (this.monthlyData.length === 0) return 0;
    return this.getTotalProduction() / this.monthlyData.length;
  }

  getMaxProduction(): number {
    if (this.monthlyData.length === 0) return 0;
    return Math.max(...this.monthlyData.map(d => d.totalProduction || 0));
  }

  getMinProduction(): number {
    if (this.monthlyData.length === 0) return 0;
    return Math.min(...this.monthlyData.map(d => d.totalProduction || 0));
  }

  getRoutePrefix(): string {
    return this.isAdminUser ? '/admin' : '/user';
  }
}
