import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ElectricityService } from './electricity.service';
import {Router, RouterLink, RouterModule} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {CommonModule, DecimalPipe, NgClass} from '@angular/common';
import { AnomalyService } from '../../../core/services/anomaly.service';

@Component({
  selector: 'app-electricity-saisie',
  templateUrl: './electricity-saisie.component.html',
  imports: [
    ReactiveFormsModule,
    NgClass,
    DecimalPipe,
    RouterLink,
    CommonModule,
    RouterModule
  ],
  styleUrls: ['./electricity-saisie.component.scss']
})
export class ElectricitySaisieComponent implements OnInit {
  electricityForm: FormGroup;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert = false;
  isLoading = false;
  calculated60kvPowerFactor: number | null = null;
  calculated22kvPowerFactor: number | null = null;
  totalActiveEnergy: number | null = null;

  months = [
    {value: 1, name: 'Janvier'}, {value: 2, name: 'Février'},
    {value: 3, name: 'Mars'}, {value: 4, name: 'Avril'},
    {value: 5, name: 'Mai'}, {value: 6, name: 'Juin'},
    {value: 7, name: 'Juillet'}, {value: 8, name: 'Août'},
    {value: 9, name: 'Septembre'}, {value: 10, name: 'Octobre'},
    {value: 11, name: 'Novembre'}, {value: 12, name: 'Décembre'}
  ];

  constructor(
    private fb: FormBuilder,
    private electricityService: ElectricityService,
    private router: Router,
    private authService: AuthService,
    private anomalyService: AnomalyService
  ) {
    this.electricityForm = this.fb.group({
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      network60kvActiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network60kvReactiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network60kvPeak: [null, [Validators.required, Validators.min(0)]],
      network22kvActiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network22kvReactiveEnergy: [null, [Validators.required, Validators.min(0)]],
      network22kvPeak: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.setupCalculations();
  }

  setupCalculations(): void {
    this.electricityForm.valueChanges.subscribe(() => {
      this.calculatePowerFactors();
    });
  }

  calculatePowerFactors(): void {
    const active60 = this.electricityForm.get('network60kvActiveEnergy')?.value;
    const reactive60 = this.electricityForm.get('network60kvReactiveEnergy')?.value;
    const active22 = this.electricityForm.get('network22kvActiveEnergy')?.value;
    const reactive22 = this.electricityForm.get('network22kvReactiveEnergy')?.value;

    // Calcul 60KV
    if (active60 && reactive60) {
      const tanPhi = reactive60 / active60;
      this.calculated60kvPowerFactor = Math.cos(Math.atan(tanPhi));
    } else {
      this.calculated60kvPowerFactor = null;
    }

    // Calcul 22KV
    if (active22 && reactive22) {
      const tanPhi = reactive22 / active22;
      this.calculated22kvPowerFactor = Math.cos(Math.atan(tanPhi));
    } else {
      this.calculated22kvPowerFactor = null;
    }

    // Calcul total
    this.totalActiveEnergy = (active60 || 0) + (active22 || 0);
  }

  resetNetwork60kv(): void {
    this.electricityForm.patchValue({
      network60kvActiveEnergy: null,
      network60kvReactiveEnergy: null,
      network60kvPeak: null
    });
    this.showAlertMessage('Données 60KV réinitialisées', 'success');
  }

  resetNetwork22kv(): void {
    this.electricityForm.patchValue({
      network22kvActiveEnergy: null,
      network22kvReactiveEnergy: null,
      network22kvPeak: null
    });
    this.showAlertMessage('Données 22KV réinitialisées', 'success');
  }

  resetAll(): void {
    this.electricityForm.reset({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    });
    this.showAlertMessage('Formulaire réinitialisé', 'success');
  }


  validateDataWithAI(): void {
    if (this.electricityForm.valid) {
      const formData = this.electricityForm.value;
      const validationData = {
        data_type: 'electricity',
        ...formData
      };

      this.anomalyService.validateData(validationData).subscribe({
        next: (response: { is_anomaly: boolean; message: string }) => { // Ajoutez le type
          if (response.is_anomaly) {
            this.showAlertMessage(`⚠️ ${response.message}`, 'warning');
          }
        },
        error: (err: any) => console.error('Erreur validation AI', err) // Ajoutez le type
      });
    }
  }



  onSubmit(): void {
    this.validateDataWithAI();

    if (this.electricityForm.invalid) {
      this.showAlertMessage('Veuillez corriger les erreurs', 'error');
      return;
    }

    if (this.electricityForm.invalid) {
      this.showAlertMessage('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    this.isLoading = true;
    this.showAlertMessage('Enregistrement en cours...', 'info');

    const formData = this.electricityForm.value;
    this.electricityService.saveElectricityData(formData).subscribe({
      next: () => {
        this.showAlertMessage('Données enregistrées avec succès', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this.showAlertMessage('Erreur lors de l\'enregistrement', 'error');
        this.isLoading = false;
      }
    });
  }

  showAlertMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 5000);
  }

  // Getters pour les classes CSS
  get powerFactor60Class(): string {
    if (!this.calculated60kvPowerFactor) return 'neutral';
    return this.calculated60kvPowerFactor >= 0.9 ? 'excellent' : 'warning';
  }

  get powerFactor22Class(): string {
    if (!this.calculated22kvPowerFactor) return 'neutral';
    return this.calculated22kvPowerFactor >= 0.8 ? 'good' : 'warning';
  }

  get totalEnergyClass(): string {
    if (!this.totalActiveEnergy) return 'neutral';
    return this.totalActiveEnergy > 100000 ? 'high' : 'good';
  }

  getRoutePrefix(): string {
    return this.authService.isAdmin() ? '/admin' : '/user';
  }
}
