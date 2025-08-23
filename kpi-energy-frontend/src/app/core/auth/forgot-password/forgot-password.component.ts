import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.message = '';
    const email = this.form.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response: { message?: string }) => {
        this.message = response.message || 'Email envoyé avec succès';
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.message = err.message || 'Erreur lors de la demande de réinitialisation';
        this.isLoading = false;
      }
    });
  }
}
