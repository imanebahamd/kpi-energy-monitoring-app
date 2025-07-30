import { Component, OnInit } from '@angular/core';
import { ElectricityService } from '../../electricity-saisie/electricity.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-monthly-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './monthly-summary.component.html',
  styleUrls: ['./monthly-summary.component.scss']
})
export class MonthlySummaryComponent implements OnInit {
  year: number | null = null;
  month: number | null = null;
  startMonth: number | null = null;
  endMonth: number | null = null;
  summary: any = null;
  periodSummaries: any[] = [];
  isLoading = false;
  error: string | null = null;
  noDataAvailable = false;
  filtersTouched = false;
  showPeriodSelection = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert: boolean = false;

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
  isAdminUser: boolean = false;

  constructor(private electricityService: ElectricityService ,
              private authService: AuthService) {}

  ngOnInit(): void {this.isAdminUser = this.authService.isAdmin();}

  onFilterChange(): void {
    this.filtersTouched = true;
  }

  togglePeriodSelection(): void {
    this.showPeriodSelection = !this.showPeriodSelection;
    if (!this.showPeriodSelection) {
      this.startMonth = null;
      this.endMonth = null;
    }
  }

  loadSummary(): void {
    if (!this.year || !this.month) {
      this.noDataAvailable = true;
      this.error = "Veuillez sélectionner une année et un mois";
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.noDataAvailable = false;
    this.summary = null;
    this.periodSummaries = [];

    this.electricityService.getMonthlySummary(this.year, this.month)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data) {
            this.summary = data;
            this.showAlertMessage(`Données pour ${this.getMonthName(this.month)} ${this.year} chargées avec succès`, 'success');
          } else {
            this.noDataAvailable = true;
            this.error = `Aucune donnée disponible pour ${this.getMonthName(this.month)} ${this.year}`;
          }
        },
        error: (err) => {
          this.error = this.getErrorMessage(err);
          this.noDataAvailable = true;
          this.showAlertMessage(this.error, 'error');
        }
      });
  }

  loadPeriodSummary(): void {
    if (!this.year || !this.startMonth || !this.endMonth || this.startMonth > this.endMonth) {
      this.noDataAvailable = true;
      this.error = "Veuillez sélectionner une année et une période valide";
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.noDataAvailable = false;
    this.summary = null;
    this.periodSummaries = [];

    const monthsToLoad = [];
    for (let month = this.startMonth; month <= this.endMonth; month++) {
      monthsToLoad.push(month);
    }

    monthsToLoad.forEach(month => {
      this.electricityService.getMonthlySummary(this.year!, month)
        .pipe(finalize(() => {
          if (month === this.endMonth) this.isLoading = false;
        }))
        .subscribe({
          next: (data) => {
            if (data) {
              this.periodSummaries.push(data);
              if (month === this.endMonth) {
                this.showAlertMessage(`Données pour la période chargées avec succès`, 'success');
              }
            } else {
              this.error = `Aucune donnée disponible pour ${this.getMonthName(month)} ${this.year}`;
              this.showAlertMessage(this.error, 'warning');
            }
          },
          error: (err) => {
            this.error = this.getErrorMessage(err);
            this.showAlertMessage(this.error, 'error');
          }
        });
    });
  }

  deleteData(year: number | null, month: number | null): void {
    // Vérification complète des paramètres
    if (!year || !month) {
      console.error('Invalid parameters for deletion');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer les données pour ${this.getMonthName(month)} ${year}?`)) {
      this.isLoading = true;
      this.electricityService.deleteMonthlyData(year, month).subscribe({
        next: () => {
          this.showAlertMessage(`Données pour ${this.getMonthName(month)} ${year} supprimées avec succès`, 'success');
          // Recharger les données
          if (this.showPeriodSelection) {
            this.loadPeriodSummary();
          } else {
            this.loadSummary();
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
      const monthName = this.month ? this.getMonthName(this.month) : 'Mois inconnu';
      return `Aucune donnée disponible pour ${monthName} ${this.year}`;
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.';
    }
  }

  getMonthName(month: number | null): string {
    if (!month) return '';
    const monthObj = this.months.find(m => m.value === month);
    return monthObj ? monthObj.name : '';
  }

  getCosphiStatus(value: number | undefined, limit: number): string {
    if (value === undefined) return 'unknown';
    if (value >= limit) return 'optimal';
    if (value >= limit - 0.1) return 'warning';
    return 'critical';
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'optimal': return 'check';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'help';
    }
  }

  getRoutePrefix(): string {
    return this.isAdminUser ? '/admin' : '/user';
  }
}
