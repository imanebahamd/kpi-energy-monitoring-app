import { Component, OnInit } from '@angular/core';
import { ElectricityService } from '../../electricity-saisie/electricity.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

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
  summary: any = null;
  isLoading = false;
  error: string | null = null;
  noDataAvailable = false;
  filtersTouched = false;

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

  constructor(private electricityService: ElectricityService) {}

  ngOnInit(): void {
    // Initialisation sans valeurs par défaut
  }

  onFilterChange(): void {
    this.filtersTouched = true;
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

    this.electricityService.getMonthlySummary(this.year, this.month)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data) {
            this.summary = data;
          } else {
            this.noDataAvailable = true;
            this.error = `Aucune donnée disponible pour ${this.getMonthName(this.month)} ${this.year}`;
          }
        },
        error: (err) => {
          this.error = this.getErrorMessage(err);
          this.noDataAvailable = true;
        }
      });
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
}
