import { Component, OnInit } from '@angular/core';
import { ElectricityService } from '../../electricity-saisie/electricity.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-annual-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './annual-summary.component.html',
  styleUrls: ['./annual-summary.component.scss']
})
export class AnnualSummaryComponent implements OnInit {
  year: number = new Date().getFullYear();
  summaries: any[] = [];
  isLoading = false;
  error: string | null = null;
  noDataAvailable = false;

  // Calculated values
  total60kvConsumption = 0;
  total22kvConsumption = 0;
  averagePowerFactor60kv = 0;
  averagePowerFactor22kv = 0;

  constructor(private electricityService: ElectricityService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.error = null;
    this.noDataAvailable = false;
    this.summaries = [];

    this.electricityService.getAnnualSummary(this.year).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.summaries = data;
          this.calculateTotals();
          this.noDataAvailable = false;
        } else {
          this.noDataAvailable = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.isLoading = false;
        this.noDataAvailable = true;
      }
    });
  }

  private calculateTotals(): void {
    this.total60kvConsumption = this.summaries.reduce((sum, item) => sum + (item.network60kvConsumption || 0), 0);
    this.total22kvConsumption = this.summaries.reduce((sum, item) => sum + (item.network22kvConsumption || 0), 0);

    const valid60kv = this.summaries.filter(item => item.network60kvPowerFactor);
    this.averagePowerFactor60kv = valid60kv.length > 0
      ? valid60kv.reduce((sum, item) => sum + item.network60kvPowerFactor, 0) / valid60kv.length
      : 0;

    const valid22kv = this.summaries.filter(item => item.network22kvPowerFactor);
    this.averagePowerFactor22kv = valid22kv.length > 0
      ? valid22kv.reduce((sum, item) => sum + item.network22kvPowerFactor, 0) / valid22kv.length
      : 0;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return `Aucune donnée disponible pour l'année ${this.year}`;
    }
    return error.error?.message || 'Erreur lors du chargement des données';
  }

  getMonthName(month: number): string {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month - 1] || '';
  }

  getCosphiStatus60kv(value: number): string {
    return value >= 0.9 ? 'text-success' : 'text-danger';
  }

  getCosphiStatus22kv(value: number): string {
    return value >= 0.8 ? 'text-success' : 'text-danger';
  }
}
