import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/user.model';
import {catchError, tap, throwError,Observable  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) { }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      catchError(error => {
        let errorMsg = 'Échec de la connexion';
        if (error.status === 403 && error.error === 'Compte désactivé') {
          errorMsg = 'Votre compte a été désactivé. Contactez l\'administrateur.';
        }
        return throwError(() => new Error(errorMsg));
      }),
      tap((response: LoginResponse) => {
        this.saveAuthData(response);
        const userRole = response.role.replace('ROLE_', '');

        // Redirection basée sur le rôle
        if (userRole === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'USER') {
          this.router.navigate(['/user/dashboard']);
        }
      })
    );
  }

  saveAuthData(res: LoginResponse) {
    this.tokenStorage.saveToken(res.accessToken);
    this.tokenStorage.saveUser({
      id: res.id,
      email: res.email,
      role: res.role.replace('ROLE_', '') as 'ADMIN' | 'USER',
      nomComplet: res.nomComplet,
      actif: true
    });
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }


  isAdmin(): boolean {
    const user = this.tokenStorage.getUser();
    return user?.role === 'ADMIN'; // Comparaison directe sans "ROLE_"
  }

  getCurrentUser(): User | null {
    return this.tokenStorage.getUser();
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.apiUrl}/password/forgot`,
      { email }
    ).pipe(
      catchError(error => {
        let errorMsg = 'Erreur lors de la demande de réinitialisation';
        if (error.error?.error) {
          errorMsg = error.error.error;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/password/reset`, { token, newPassword })
      .pipe(
        catchError(error => {
          let errorMsg = 'Erreur lors de la réinitialisation';
          if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          }
          return throwError(() => new Error(errorMsg));
        })
      );
  }
}

interface LoginResponse {
  accessToken: string;
  id: number;
  email: string;
  role: string;
  nomComplet: string;
}



interface ForgotPasswordResponse {
  message?: string;
  error?: string;
}
