import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form: FormGroup;
  token = '';
  message = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialisation du formulaire dans le constructeur
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });

    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) this.router.navigate(['/login']);
  }

  // Fonction de validation des mots de passe
  checkPasswords(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { notSame: true };
  }

  onSubmit() {
    if (this.form.invalid || !this.token) return;

    this.isLoading = true;
    this.message = '';
    const newPassword = this.form.get('newPassword')?.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response: any) => {
        this.message = response.message || 'Mot de passe réinitialisé avec succès!';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.message = err.message || 'Erreur lors de la réinitialisation';
        this.isLoading = false;
      }
    });
  }
}
