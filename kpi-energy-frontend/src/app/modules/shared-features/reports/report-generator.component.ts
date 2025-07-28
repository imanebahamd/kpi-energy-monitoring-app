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
  isLoading = false;

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

  async generateReport(): Promise<void> {
    this.isLoading = true;

    try {
      const [electricityData, waterData] = await Promise.all([
        lastValueFrom(this.electricityService.getMonthlySummary(this.year, this.month)),
        lastValueFrom(this.waterService.getWaterData(this.year, this.month))
      ]);

      if (!electricityData || !waterData) {
        throw new Error('Données manquantes');
      }

      const pdfBlob = await this.pdfService.generateElectricityWaterReport(
        electricityData,
        waterData,
        this.year,
        this.month
      );

      // Téléchargement du PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_energie_eau_${this.getMonthName(this.month)}_${this.year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur génération rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      this.isLoading = false;
    }
  }
}
