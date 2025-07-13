import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Injection des services
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // État du composant
  isLoading = false;
  errorMessage: string | null = null;

  // Formulaire réactif
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Soumission du formulaire
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!)
      .pipe(
        tap({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.isLoading = false;
            this.handleError(err);
          }
        }),
        catchError(err => {
          this.isLoading = false;
          this.handleError(err);
          return of(null);
        })
      )
      .subscribe();
  }

  // Gestion des erreurs
  private handleError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    }
  }

  // Helpers pour accéder facilement aux champs du formulaire
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
