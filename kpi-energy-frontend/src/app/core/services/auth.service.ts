import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { User } from '../../shared/models/user.model';

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
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  saveAuthData(res: LoginResponse) {
    this.tokenStorage.saveToken(res.accessToken);
    this.tokenStorage.saveUser({
      id: res.id,
      email: res.email,
      role: res.role,
      nomComplet: res.nomComplet
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
    return user?.role === 'ADMIN';
  }

  getCurrentUser(): User | null {
    return this.tokenStorage.getUser();
  }
}

interface LoginResponse {
  accessToken: string;
  id: number;
  email: string;
  role: string;
  nomComplet: string;
}
