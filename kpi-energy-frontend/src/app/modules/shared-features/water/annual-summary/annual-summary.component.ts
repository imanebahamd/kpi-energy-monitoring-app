import { Component, OnInit } from '@angular/core';
import { WaterService, WaterData } from '../../water-saisie/water.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-water-annual-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './annual-summary.component.html',
  styleUrls: ['./annual-summary.component.scss']
})
export class AnnualSummaryComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  monthlyData: WaterData[] = [];
  years: number[] = [];
  isLoading: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  noDataAvailable: boolean = false;

  months = [
    { value: 1, name: 'Janvier' },
    { value: 2, name: 'Février' },
    { value: 3, name: 'Mars' },
    { value: 4, name: 'Avril' },
    { value: 5, name: 'Mai' },
    { value: 6, name: 'Juin' },
    { value: 7, name: 'Juillet' },
    { value: 8, name: 'Août' },
    { value: 9, name: 'Septembre' },
    { value: 10, name: 'Octobre' },
    { value: 11, name: 'Novembre' },
    { value: 12, name: 'Décembre' }
  ];

  constructor(
    private waterService: WaterService,
    private authService: AuthService
  ) {
    // Générer les 10 dernières années
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.showAlert = false;
    this.noDataAvailable = false;

    this.waterService.getMonthlyData(this.selectedYear).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.monthlyData = res;
          this.showAlertMessage(`Données pour ${this.selectedYear} chargées avec succès`, 'success');
        } else {
          this.monthlyData = [];
          this.noDataAvailable = true;
          this.showAlertMessage(`Aucune donnée disponible pour l'année ${this.selectedYear}`, 'warning');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.monthlyData = [];
        this.noDataAvailable = true;
        this.showAlertMessage('Erreur lors du chargement des données', 'error');
        this.isLoading = false;
      }
    });
  }

  calculateYearlyTotal(): WaterData {
    return this.monthlyData.reduce((acc, curr) => {
      return {
        ...acc,
        f3bis: (acc.f3bis || 0) + (curr.f3bis || 0),
        f3: (acc.f3 || 0) + (curr.f3 || 0),
        se2: (acc.se2 || 0) + (curr.se2 || 0),
        se3bis: (acc.se3bis || 0) + (curr.se3bis || 0),
        totalProduction: (acc.totalProduction || 0) + (curr.totalProduction || 0)
      };
    }, {
      year: this.selectedYear,
      month: 0,
      f3bis: 0,
      f3: 0,
      se2: 0,
      se3bis: 0,
      totalProduction: 0
    });
  }

  getMonthName(month: number): string {
    const monthObj = this.months.find(m => m.value === month);
    return monthObj ? monthObj.name : '';
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
