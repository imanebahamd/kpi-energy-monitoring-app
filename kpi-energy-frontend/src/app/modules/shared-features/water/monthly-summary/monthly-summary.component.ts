import { Component, OnInit } from '@angular/core';
import { WaterService, WaterData } from '../../water-saisie/water.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-water-monthly-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './monthly-summary.component.html',
  styleUrls: ['./monthly-summary.component.scss']
})
export class MonthlySummaryComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = null;
  startMonth: number | null = null;
  endMonth: number | null = null;
  periodData: WaterData[] = [];
  singleMonthData: WaterData | null = null;
  isLoading = false;
  error: string | null = null;
  noDataAvailable = false;
  filtersTouched = false;
  showPeriodSelection = false;
  showMonthSelection = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert: boolean = false;
  isAdminUser: boolean = false;

  years: number[] = [];
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
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 10; i--) {
      this.years.push(i);
    }
  }

  ngOnInit(): void {
    this.isAdminUser = this.authService.isAdmin();

    this.route.queryParams.subscribe(params => {
      if (params['year']) {
        this.selectedYear = +params['year'];
        if (params['month']) {
          this.selectedMonth = +params['month'];
          this.loadSingleMonthData();
        } else if (params['startMonth'] && params['endMonth']) {
          this.startMonth = +params['startMonth'];
          this.endMonth = +params['endMonth'];
          this.loadPeriodData();
        }
      }
    });
  }

  onFilterChange(): void {
    this.filtersTouched = true;
  }

  toggleMonthSelection(): void {
    this.showMonthSelection = !this.showMonthSelection;
    if (this.showMonthSelection) {
      this.showPeriodSelection = false;
    }
    if (!this.showMonthSelection) {
      this.selectedMonth = null;
    }
  }

  togglePeriodSelection(): void {
    this.showPeriodSelection = !this.showPeriodSelection;
    if (this.showPeriodSelection) {
      this.showMonthSelection = false;
    }
    if (!this.showPeriodSelection) {
      this.startMonth = null;
      this.endMonth = null;
    }
  }

  loadSingleMonthData(): void {
    if (!this.selectedYear || !this.selectedMonth) return;

    this.isLoading = true;
    this.error = null;
    this.noDataAvailable = false;
    this.periodData = [];

    this.waterService.getWaterData(this.selectedYear, this.selectedMonth)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data) {
            this.singleMonthData = data;
            this.showAlertMessage(
              `Données pour ${this.getMonthName(this.selectedMonth)} ${this.selectedYear} chargées avec succès`,
              'success'
            );
          } else {
            this.noDataAvailable = true;
            this.error = `Aucune donnée disponible pour ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}`;
          }
        },
        error: (err) => {
          this.error = this.getErrorMessage(err);
          this.noDataAvailable = true;
          this.showAlertMessage(this.error, 'error');
        }
      });
  }

  loadPeriodData(): void {
    if (!this.selectedYear || !this.startMonth || !this.endMonth || this.startMonth > this.endMonth) {
      this.noDataAvailable = true;
      this.error = "Veuillez sélectionner une année et une période valide";
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.noDataAvailable = false;
    this.singleMonthData = null;

    this.waterService.getMonthlyData(this.selectedYear)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.periodData = data.filter(item =>
              item.month >= this.startMonth! && item.month <= this.endMonth!
            );
            if (this.periodData.length > 0) {
              this.showAlertMessage(
                `Données pour la période ${this.getMonthName(this.startMonth)} à ${this.getMonthName(this.endMonth)} ${this.selectedYear} chargées avec succès`,
                'success'
              );
            } else {
              this.noDataAvailable = true;
              this.error = `Aucune donnée disponible pour la période sélectionnée`;
            }
          } else {
            this.noDataAvailable = true;
            this.error = `Aucune donnée disponible pour ${this.selectedYear}`;
          }
        },
        error: (err) => {
          this.error = this.getErrorMessage(err);
          this.noDataAvailable = true;
          this.showAlertMessage(this.error, 'error');
        }
      });
  }

  deleteData(year: number, month: number): void {
    if (!year || !month) {
      console.error('Paramètres invalides pour la suppression');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer les données pour ${this.getMonthName(month)} ${year}?`)) {
      this.isLoading = true;
      this.waterService.deleteWaterData(year, month).subscribe({
        next: () => {
          this.showAlertMessage(`Données pour ${this.getMonthName(month)} ${year} supprimées avec succès`, 'success');
          if (this.showPeriodSelection) {
            this.loadPeriodData();
          } else if (this.showMonthSelection) {
            this.loadSingleMonthData();
          }
        },
        error: (err) => {
          this.showAlertMessage(`Erreur lors de la suppression: ${err.message}`, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return `Aucune donnée disponible pour cette période`;
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.';
    }
  }

  getMonthName(month: number | null): string {
    if (month === null) return '';
    const monthObj = this.months.find(m => m.value === month);
    return monthObj ? monthObj.name : '';
  }

  calculateTotal(data: WaterData[]): WaterData {
    return data.reduce((acc, curr) => {
      return {
        ...acc,
        f3bis: (acc.f3bis || 0) + (curr.f3bis || 0),
        f3: (acc.f3 || 0) + (curr.f3 || 0),
        se2: (acc.se2 || 0) + (curr.se2 || 0),
        se3bis: (acc.se3bis || 0) + (curr.se3bis || 0),
        totalProduction: (acc.totalProduction || 0) + (curr.totalProduction || 0)
      };
    }, {
      month: 0,
      year: this.selectedYear,
      f3bis: 0,
      f3: 0,
      se2: 0,
      se3bis: 0,
      totalProduction: 0
    });
  }

  getRoutePrefix(): string {
    return this.isAdminUser ? '/admin' : '/user';
  }
}
