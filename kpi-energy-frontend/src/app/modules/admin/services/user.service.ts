import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiUrl = 'http://localhost:8081/api/admin/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${id}/toggle-status`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Mettez à jour toutes les autres méthodes pour inclure les headers
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }


  createUser(user: User): Observable<User> {
    const userToCreate = { ...user, id: undefined };
    return this.http.post<User>(this.apiUrl, userToCreate);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
