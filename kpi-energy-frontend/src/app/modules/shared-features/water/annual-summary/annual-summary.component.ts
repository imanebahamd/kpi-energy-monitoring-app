import { Component, OnInit } from '@angular/core';
import { WaterService } from '../../water-saisie/water.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-water-annual-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annual-summary.component.html',
  styleUrls: ['./annual-summary.component.scss']
})
export class AnnualSummaryComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  annualData: any[] = [];
  years: number[] = [];

  constructor(private waterService: WaterService) {
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
    // On utilise getMonthlyData pour récupérer toutes les données mensuelles de l'année
    this.waterService.getMonthlyData(this.selectedYear).subscribe({
      next: (res) => {
        // Agréger les données pour avoir le total annuel
        this.annualData = [this.aggregateYearlyData(res)];
      },
      error: (err) => console.error(err)
    });
  }

  aggregateYearlyData(data: any[]): any {
    return {
      year: this.selectedYear,
      f3bis: data.reduce((sum, item) => sum + item.f3bis, 0),
      f3: data.reduce((sum, item) => sum + item.f3, 0),
      se2: data.reduce((sum, item) => sum + item.se2, 0),
      se3bis: data.reduce((sum, item) => sum + item.se3bis, 0),
      totalProduction: data.reduce((sum, item) => sum + (item.totalProduction || 0), 0)
    };
  }
}
