import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElectricityService } from './electricity.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-electricity-saisie',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './electricity-saisie.component.html',
  styleUrls: ['./electricity-saisie.component.scss']
})
export class ElectricitySaisieComponent implements OnInit {
  electricityForm!: FormGroup;
  message: string = '';
  isLoading: boolean = false;
  calculated60kvPowerFactor: number | null = null;
  calculated22kvPowerFactor: number | null = null;
  totalActiveEnergy: number | null = null;

  constructor(private fb: FormBuilder, private electricityService: ElectricityService) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCalculations();
  }

  initForm(): void {
    this.electricityForm = this.fb.group({
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],

      // 60KV Network
      network60kvActiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network60kvReactiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network60kvPeak: [null, [Validators.required, Validators.min(0)]],

      // 22KV Network
      network22kvActiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network22kvReactiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network22kvPeak: [null, [Validators.required, Validators.min(0)]]
    });
  }

  setupCalculations(): void {
    // Calculate 60KV power factor when energies change
    this.electricityForm.get('network60kvActiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
    this.electricityForm.get('network60kvReactiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());

    // Calculate 22KV power factor when energies change
    this.electricityForm.get('network22kvActiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
    this.electricityForm.get('network22kvReactiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
  }

  calculatePowerFactors(): void {
    const active60 = this.electricityForm.get('network60kvActiveEnergy')?.value;
    const reactive60 = this.electricityForm.get('network60kvReactiveEnergy')?.value;

    const active22 = this.electricityForm.get('network22kvActiveEnergy')?.value;
    const reactive22 = this.electricityForm.get('network22kvReactiveEnergy')?.value;

    if (active60 && reactive60) {
      const tanPhi = reactive60 / active60;
      this.calculated60kvPowerFactor = Math.cos(Math.atan(tanPhi));
    } else {
      this.calculated60kvPowerFactor = null;
    }

    if (active22 && reactive22) {
      const tanPhi = reactive22 / active22;
      this.calculated22kvPowerFactor = Math.cos(Math.atan(tanPhi));
    } else {
      this.calculated22kvPowerFactor = null;
    }

    // Calculate total active energy
    this.totalActiveEnergy = (active60 || 0) + (active22 || 0);
  }

  onSubmit(): void {
    if (this.electricityForm.invalid) {
      this.message = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const formData = {
      ...this.electricityForm.value,
      calculated60kvPowerFactor: this.calculated60kvPowerFactor,
      calculated22kvPowerFactor: this.calculated22kvPowerFactor
    };

    this.electricityService.saveElectricityData(formData).subscribe({
      next: (res) => {
        this.message = 'Données enregistrées avec succès!';
        this.isLoading = false;
        this.electricityForm.markAsPristine();
      },
      error: (err) => {
        this.message = 'Erreur lors de l\'enregistrement: ' + err.message;
        this.isLoading = false;
      }
    });
  }
}
