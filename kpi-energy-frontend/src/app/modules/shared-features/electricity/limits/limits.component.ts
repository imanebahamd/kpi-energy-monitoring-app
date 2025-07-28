import { Component, OnInit } from '@angular/core';
import { ElectricityService } from '../../electricity-saisie/electricity.service'; // Chemin corrigé
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http'; // Pour le typage des erreurs

interface ElectricityLimits {
  cosphi60kvMin: number;
  cosphi60kvMax: number;
  cosphi22kvMin: number;
  cosphi22kvMax: number;
}

@Component({
  selector: 'app-limits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './limits.component.html',
  styleUrls: ['./limits.component.scss']
})
export class LimitsComponent implements OnInit {
  limits: ElectricityLimits | null = null;
  isLoading = false;
  error = '';

  constructor(private electricityService: ElectricityService) {}

  ngOnInit(): void {
    this.loadLimits();
  }

  loadLimits(): void {
    this.isLoading = true;
    this.error = '';

    this.electricityService.getLimits().subscribe({
      next: (data: ElectricityLimits) => {
        this.limits = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Erreur lors du chargement des limites';
        this.isLoading = false;
        console.error(err.message);
      }
    });
  }
}
