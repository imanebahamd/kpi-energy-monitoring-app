import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WaterService, WaterData } from './water.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-water-saisie',
  templateUrl: './water-saisie.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    RouterModule,
    NgClass
  ],
  styleUrls: ['./water-saisie.component.scss']
})
export class WaterSaisieComponent implements OnInit {
  waterForm!: FormGroup;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert: boolean = false;
  isLoading: boolean = false;
  isFormVisible: boolean = false;

  months = [
    { value: 1, name: 'Janvier' },
    { value: 2, name: 'Février' },
    { value: 3, name: 'Mars' },
    { value: 4, name: 'Avril' },
    { value: 5, name: 'Mai' },
    { value: 6, name: 'Juin' },
    { value: 7, name: 'Juillet' },
    { value: 8, name: 'Août' },
    { value: 9, name: 'Septembre' },
    { value: 10, name: 'Octobre' },
    { value: 11, name: 'Novembre' },
    { value: 12, name: 'Décembre' }
  ];

  validationMessages = {
    success: {
      save: '✅ Données enregistrées avec succès !',
      reset: '🔄 Formulaire réinitialisé avec succès'
    },
    error: {
      save: '❌ Erreur lors de l\'enregistrement des données',
      validation: '📝 Veuillez corriger les erreurs dans le formulaire',
      network: '🔌 Erreur de connexion au serveur'
    },
    info: {
      loading: '⏳ Chargement des données...'
    }
  };

  constructor(private fb: FormBuilder, private waterService: WaterService , private authService: AuthService,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initForm();
    setTimeout(() => this.isFormVisible = true, 100);

    // Vérifier les paramètres de route pour le pré-remplissage
    this.route.queryParams.subscribe(params => {
      if (params['year'] && params['month']) {
        this.loadDataForEdit(+params['year'], +params['month']);
      }
    });
  }

  initForm(): void {
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
      this.showDynamicAlert(this.validationMessages.error.validation, 'error', 5000);
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.showDynamicAlert(this.validationMessages.info.loading, 'info', 3000);

    const data: WaterData = this.waterForm.value;
    const year = data.year;
    const month = data.month;

    // Vérifier si on est en mode édition
    this.waterService.getWaterDataForEdit(year, month).subscribe({
      next: (existingData) => {
        // Mode mise à jour
        this.waterService.saveWaterData(data).subscribe({
          next: (res) => {
            this.showDynamicAlert('Données mises à jour avec succès', 'success', 7000);
            this.isLoading = false;
            this.waterForm.markAsPristine();
          },
          error: (err) => {
            this.handleSaveError(err);
          }
        });
      },
      error: (err) => {
        // Mode création
        this.waterService.saveWaterData(data).subscribe({
          next: (res) => {
            this.showDynamicAlert(this.validationMessages.success.save, 'success', 7000);
            this.isLoading = false;
            this.waterForm.markAsPristine();
          },
          error: (err) => {
            this.handleSaveError(err);
          }
        });
      }
    });
  }

  private handleSaveError(err: any): void {
    let errorMessage = this.validationMessages.error.save;
    if (err.status === 500) {
      errorMessage = this.validationMessages.error.network;
    }
    this.showDynamicAlert(errorMessage, 'error', 7000);
    this.isLoading = false;
  }

  resetForm(): void {
    this.waterForm.reset({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    });
    this.showDynamicAlert(this.validationMessages.success.reset, 'success', 5000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.waterForm.controls).forEach(field => {
      const control = this.waterForm.get(field);
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

  getMonthName(month: number | null): string {
    if (!month) return '';
    return this.months.find(m => m.value === month)?.name || '';
  }

  getRoutePrefix(): string {
    return this.authService.isAdmin() ? '/admin' : '/user';
  }

  loadDataForEdit(year: number, month: number): void {
    this.isLoading = true;
    this.showDynamicAlert(this.validationMessages.info.loading, 'info', 3000);

    this.waterService.getWaterDataForEdit(year, month).subscribe({
      next: (data) => {
        this.waterForm.patchValue({
          year: data.year,
          month: data.month,
          f3bis: data.f3bis,
          f3: data.f3,
          se2: data.se2,
          se3bis: data.se3bis
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.showDynamicAlert(
          err.status === 404
            ? `Aucune donnée trouvée pour ${this.getMonthName(month)} ${year}`
            : 'Erreur lors du chargement des données',
          'error'
        );
        this.isLoading = false;
      }
    });
  }
}
