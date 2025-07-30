import { Component } from '@angular/core';
import { ElectricityService } from '../electricity-saisie/electricity.service';
import { WaterService } from '../water-saisie/water.service';
import { PdfService } from '../../../core/services/pdf.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss']
})
export class ReportGeneratorComponent {
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  startMonth: number = 1;
  endMonth: number = 12;
  isLoading = false;
  reportType: 'monthly' | 'yearly' | 'period' = 'monthly';

  constructor(
    private electricityService: ElectricityService,
    private waterService: WaterService,
    private pdfService: PdfService
  ) {}

  getMonthName(month: number): string {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return monthNames[month - 1];
  }

  getMonthNames(): string[] {
    return Array.from({length: 12}, (_, i) => this.getMonthName(i + 1));
  }

  async generateReport(): Promise<void> {
    this.isLoading = true;

    try {
      let pdfBlob: Blob;

      switch (this.reportType) {
        case 'monthly':
          pdfBlob = await this.generateMonthlyReport();
          break;
        case 'yearly':
          pdfBlob = await this.generateYearlyReport();
          break;
        case 'period':
          pdfBlob = await this.generatePeriodReport();
          break;
        default:
          throw new Error('Type de rapport non supporté');
      }

      // Téléchargement du PDF
      this.downloadPdf(pdfBlob);

    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur génération rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      this.isLoading = false;
    }
  }

  private async generateMonthlyReport(): Promise<Blob> {
    const [electricityData, waterData] = await Promise.all([
      lastValueFrom(this.electricityService.getMonthlySummary(this.year, this.month)),
      lastValueFrom(this.waterService.getWaterData(this.year, this.month))
    ]);

    if (!electricityData || !waterData) {
      throw new Error('Données manquantes pour le mois sélectionné');
    }

    return this.pdfService.generateMonthlyReport(
      electricityData,
      waterData,
      this.year,
      this.month
    );
  }

  private async generateYearlyReport(): Promise<Blob> {
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const [electricityData, waterData] = await Promise.all([
        lastValueFrom(this.electricityService.getMonthlySummary(this.year, month)),
        lastValueFrom(this.waterService.getWaterData(this.year, month))
      ]);

      if (electricityData && waterData) {
        monthlyData.push({
          month,
          electricityData,
          waterData
        });
      }
    }

    if (monthlyData.length === 0) {
      throw new Error('Aucune donnée disponible pour cette année');
    }

    return this.pdfService.generateYearlyReport(monthlyData, this.year);
  }

  private async generatePeriodReport(): Promise<Blob> {
    if (this.startMonth > this.endMonth) {
      throw new Error('Le mois de début doit être antérieur au mois de fin');
    }

    const periodData = [];

    for (let month = this.startMonth; month <= this.endMonth; month++) {
      const [electricityData, waterData] = await Promise.all([
        lastValueFrom(this.electricityService.getMonthlySummary(this.year, month)),
        lastValueFrom(this.waterService.getWaterData(this.year, month))
      ]);

      if (electricityData && waterData) {
        periodData.push({
          month,
          electricityData,
          waterData
        });
      }
    }

    if (periodData.length === 0) {
      throw new Error('Aucune donnée disponible pour cette période');
    }

    return this.pdfService.generatePeriodReport(
      periodData,
      this.year,
      this.startMonth,
      this.endMonth
    );
  }

  private downloadPdf(pdfBlob: Blob): void {
    let fileName = '';

    switch (this.reportType) {
      case 'monthly':
        fileName = `rapport_mensuel_${this.getMonthName(this.month)}_${this.year}.pdf`;
        break;
      case 'yearly':
        fileName = `rapport_annuel_${this.year}.pdf`;
        break;
      case 'period':
        fileName = `rapport_periode_${this.getMonthName(this.startMonth)}_a_${this.getMonthName(this.endMonth)}_${this.year}.pdf`;
        break;
    }

    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
