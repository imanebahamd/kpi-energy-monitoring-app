import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message = '';
  messageType: 'success' | 'error' | '' = '';
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
    this.messageType = '';
    const email = this.form.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response: { message?: string }) => {
        this.message = response.message || 'Email envoyé avec succès';
        this.messageType = 'success';
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.message = err.message || 'Erreur lors de la demande de réinitialisation';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }
}
