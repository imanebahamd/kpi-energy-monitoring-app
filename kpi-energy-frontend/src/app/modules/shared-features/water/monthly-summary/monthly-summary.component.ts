// monthly-summary.component.ts
import { Component, OnInit } from '@angular/core';
import { WaterService } from '../../water-saisie/water.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-water-monthly-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-summary.component.html',
  styleUrls: ['./monthly-summary.component.scss']
})
export class MonthlySummaryComponent implements OnInit {
  year: number = new Date().getFullYear();
  monthlyData: any[] = [];

  constructor(private waterService: WaterService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.waterService.getMonthlyData(this.year).subscribe({
      next: (res) => {
        this.monthlyData = res;
      },
      error: (err) => console.error(err)
    });
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }
}
