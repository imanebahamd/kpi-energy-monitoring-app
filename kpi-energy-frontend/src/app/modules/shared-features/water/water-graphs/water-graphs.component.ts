import { Component, OnInit } from '@angular/core';
import { WaterService } from '../../water-saisie/water.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-water-graphs',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, DropdownModule, TabViewModule],
  templateUrl: './water-graphs.component.html',
  styleUrls: ['./water-graphs.component.scss']
})
export class WaterGraphsComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  monthlyData: any[] = [];

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
            return `${context.dataset.label}: ${context.raw.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private waterService: WaterService) {
    // Générer les années disponibles
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.waterService.getMonthlyData(this.selectedYear).subscribe({
      next: (data) => {
        this.monthlyData = data;
        this.prepareCharts();
      },
      error: (err) => console.error('Error loading water data:', err)
    });
  }

  prepareCharts(): void {
    this.prepareMonthlyTrendChart();
    this.prepareMonthlyComparisonChart();
    this.prepareCompositionChart();
  }

  prepareMonthlyTrendChart(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.monthlyTrendChart = {
      labels: this.monthlyData.map(d => months[d.month - 1]),
      datasets: [
        {
          label: 'F3BIS',
          data: this.monthlyData.map(d => d.f3bis),
          borderColor: '#4bc0c0',
          tension: 0.4,
          fill: false
        },
        {
          label: 'F3',
          data: this.monthlyData.map(d => d.f3),
          borderColor: '#565656',
          tension: 0.4,
          fill: false
        },
        {
          label: 'SE2',
          data: this.monthlyData.map(d => d.se2),
          borderColor: '#ff6384',
          tension: 0.4,
          fill: false
        },
        {
          label: 'SE3BIS',
          data: this.monthlyData.map(d => d.se3bis),
          borderColor: '#ff9f43',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }

  prepareMonthlyComparisonChart(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    // Calculer les totaux pour l'année
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
          hoverBackgroundColor: ['#4bc0c0', '#565656', '#ff6384', '#ff9f43']
        }
      ]
    };
  }

  onYearChange(): void {
    this.loadData();
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
}
