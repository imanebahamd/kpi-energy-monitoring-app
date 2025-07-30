import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElectricityService } from './electricity.service';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-electricity-saisie',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './electricity-saisie.component.html',
  styleUrls: ['./electricity-saisie.component.scss']
})
export class ElectricitySaisieComponent implements OnInit {
  electricityForm!: FormGroup;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert: boolean = false;
  isLoading: boolean = false;
  calculated60kvPowerFactor: number | null = null;
  calculated22kvPowerFactor: number | null = null;
  totalActiveEnergy: number | null = null;
  months = [
    {value: 1, name: 'Janvier'},
    {value: 2, name: 'Février'},
    {value: 3, name: 'Mars'},
    {value: 4, name: 'Avril'},
    {value: 5, name: 'Mai'},
    {value: 6, name: 'Juin'},
    {value: 7, name: 'Juillet'},
    {value: 8, name: 'Août'},
    {value: 9, name: 'Septembre'},
    {value: 10, name: 'Octobre'},
    {value: 11, name: 'Novembre'},
    {value: 12, name: 'Décembre'}
  ];
  // Animation states
  isFormVisible: boolean = false;
  isAdminUser: boolean = false;
  networkAnimationState: { [key: string]: boolean } = {
    '60kv': false,
    '22kv': false,
    'total': false
  };

  // Messages de validation personnalisés
  validationMessages = {
    success: {
      save: '✅ Données enregistrées avec succès !',
      reset60: '🔄 Réseau 60KV réinitialisé avec succès',
      reset22: '🔄 Réseau 22KV réinitialisé avec succès',
      resetAll: '🗑️ Formulaire réinitialisé complètement'
    },
    error: {
      save: '❌ Erreur lors de l\'enregistrement des données',
      duplicate: '⚠️ Ces données existent déjà pour ce mois',
      network: '🔌 Erreur de connexion au serveur',
      validation: '📝 Veuillez corriger les erreurs dans le formulaire'
    },
    warning: {
      powerFactor60: '⚡ Facteur de puissance 60KV inférieur à 0.9',
      powerFactor22: '⚡ Facteur de puissance 22KV inférieur à 0.8',
      highConsumption: '📊 Consommation élevée détectée'
    },
    info: {
      calculating: '🔢 Calcul du facteur de puissance en cours...',
      loading: '⏳ Chargement des données...'
    }
  };

  constructor(
    private fb: FormBuilder,
    private electricityService: ElectricityService,
    private route: ActivatedRoute ,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCalculations();
    this.startAnimations();
    this.isAdminUser = this.authService.isAdmin();

    // Utilisez this.route qui est maintenant disponible
    this.route.queryParams.subscribe(params => {
      if (params['year'] && params['month']) {
        this.isLoading = true;
        this.showDynamicAlert(this.validationMessages.info.loading, 'info');

        this.electricityService.getMonthlyDataForEdit(+params['year'], +params['month']).subscribe({
          next: (data) => {
            this.electricityForm.patchValue(data);
            this.calculatePowerFactors();
            this.isLoading = false;
            this.showDynamicAlert(`Données de ${this.getMonthName(+params['month'])} ${params['year']} chargées pour modification`, 'success');
          },
          error: (err) => {
            this.isLoading = false;
            this.showDynamicAlert(this.validationMessages.error.network, 'error');
          }
        });
      }
    });
  }

  startAnimations(): void {
    setTimeout(() => this.isFormVisible = true, 100);
    setTimeout(() => this.networkAnimationState['60kv'] = true, 300);
    setTimeout(() => this.networkAnimationState['22kv'] = true, 500);
    setTimeout(() => this.networkAnimationState['total'] = true, 700);
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
    this.electricityForm.get('network60kvActiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
    this.electricityForm.get('network60kvReactiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
    this.electricityForm.get('network22kvActiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
    this.electricityForm.get('network22kvReactiveEnergy')?.valueChanges.subscribe(() => this.calculatePowerFactors());
  }

  calculatePowerFactors(): void {
    const active60 = this.electricityForm.get('network60kvActiveEnergy')?.value;
    const reactive60 = this.electricityForm.get('network60kvReactiveEnergy')?.value;
    const active22 = this.electricityForm.get('network22kvActiveEnergy')?.value;
    const reactive22 = this.electricityForm.get('network22kvReactiveEnergy')?.value;

    // Calcul 60KV
    if (active60 !== null && active60 !== undefined && reactive60 !== null && reactive60 !== undefined && active60 > 0) {
      const tanPhi = reactive60 / active60;
      this.calculated60kvPowerFactor = Math.cos(Math.atan(tanPhi));

      if (this.calculated60kvPowerFactor < 0.9) {
        this.showDynamicAlert(this.validationMessages.warning.powerFactor60, 'warning', 5000);
      }
    } else {
      this.calculated60kvPowerFactor = null;
    }

    // Calcul 22KV
    if (active22 !== null && active22 !== undefined && reactive22 !== null && reactive22 !== undefined && active22 > 0) {
      const tanPhi = reactive22 / active22;
      this.calculated22kvPowerFactor = Math.cos(Math.atan(tanPhi));

      if (this.calculated22kvPowerFactor < 0.8) {
        this.showDynamicAlert(this.validationMessages.warning.powerFactor22, 'warning', 5000);
      }
    } else {
      this.calculated22kvPowerFactor = null;
    }

    // Calcul total
    this.totalActiveEnergy = (active60 || 0) + (active22 || 0);

    if (this.totalActiveEnergy && this.totalActiveEnergy > 100000) {
      this.showDynamicAlert(this.validationMessages.warning.highConsumption, 'warning', 5000);
    }
  }

  resetNetwork60kv(): void {
    this.electricityForm.patchValue({
      network60kvActiveEnergy: null,
      network60kvReactiveEnergy: null,
      network60kvPeak: null
    });
    this.showDynamicAlert(this.validationMessages.success.reset60, 'success', 5000);
  }

  resetNetwork22kv(): void {
    this.electricityForm.patchValue({
      network22kvActiveEnergy: null,
      network22kvReactiveEnergy: null,
      network22kvPeak: null
    });
    this.showDynamicAlert(this.validationMessages.success.reset22, 'success', 5000);
  }

  resetAll(): void {
    this.electricityForm.reset({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    });
    this.showDynamicAlert(this.validationMessages.success.resetAll, 'success', 5000);
  }

  onSubmit(): void {
    if (this.electricityForm.invalid) {
      this.showDynamicAlert(this.validationMessages.error.validation, 'error', 5000);
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.showDynamicAlert(this.validationMessages.info.loading, 'info', 3000);

    const formData = {
      ...this.electricityForm.value,
      calculated60kvPowerFactor: this.calculated60kvPowerFactor,
      calculated22kvPowerFactor: this.calculated22kvPowerFactor,
      totalActiveEnergy: this.totalActiveEnergy
    };

    this.electricityService.saveElectricityData(formData).subscribe({
      next: () => {
        this.showDynamicAlert(this.validationMessages.success.save, 'success', 7000);
        this.isLoading = false;
        this.electricityForm.markAsPristine();
      },
      error: (err) => {
        let errorMessage = this.validationMessages.error.save;

        switch(err.status) {
          case 409:
            errorMessage = this.validationMessages.error.duplicate;
            break;
          case 500:
            errorMessage = this.validationMessages.error.network;
            break;
          default:
            errorMessage = this.validationMessages.error.save;
        }

        this.showDynamicAlert(errorMessage, 'error', 7000);
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.electricityForm.controls).forEach(field => {
      const control = this.electricityForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private showDynamicAlert(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number = 5000): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, duration);
  }

  // Getters pour les classes CSS dynamiques
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
    if (this.totalActiveEnergy > 100000) return 'high';
    if (this.totalActiveEnergy > 50000) return 'medium';
    return 'low';
  }

  getMonthName(month: number | null): string {
    if (!month) return '';
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || '';
  }

  getRoutePrefix(): string {
    return this.isAdminUser ? '/admin' : '/user';
  }

}
