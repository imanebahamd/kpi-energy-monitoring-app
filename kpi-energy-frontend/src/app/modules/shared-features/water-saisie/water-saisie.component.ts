import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WaterService, WaterData } from './water.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-water-saisie',
  templateUrl: './water-saisie.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./water-saisie.component.scss']
})
export class WaterSaisieComponent implements OnInit {
  waterForm!: FormGroup;
  message: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private waterService: WaterService) {}

  ngOnInit(): void {
    this.waterForm = this.fb.group({
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      f3bis: [null, [Validators.required, Validators.min(0)]],
      f3: [null, [Validators.required, Validators.min(0)]],
      se2: [null, [Validators.required, Validators.min(0)]],
      se3bis: [null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.waterForm.invalid) {
      this.message = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const data: WaterData = this.waterForm.value;

    this.waterService.saveWaterData(data).subscribe({
      next: (res) => {
        this.message = `Données enregistrées avec succès. Total production: ${res.totalProduction}`;
        this.isLoading = false;
        this.waterForm.markAsPristine();
      },
      error: () => {
        this.message = 'Erreur lors de l\'enregistrement des données.';
        this.isLoading = false;
      }
    });
  }
}
