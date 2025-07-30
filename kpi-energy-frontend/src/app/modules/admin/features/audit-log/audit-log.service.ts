import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  action: string;
  tableName: string;
  recordId: number;
  oldValues: string;
  newValues: string;
  actionTimestamp: string;
  user: {
    id: number;
    nomComplet: string;
    email: string;
  };
  ipAddress?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = 'http://localhost:8081/api/admin/audit';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getLogs(page: number = 0, size: number = 10): Observable<PageResponse<AuditLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<AuditLog>>(this.apiUrl, {
      params,
      headers: this.getHeaders()
    });
  }

  searchLogs(
    action?: string,
    tableName?: string,
    userEmail?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<AuditLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (action) params = params.set('action', action);
    if (tableName) params = params.set('tableName', tableName);
    if (userEmail) params = params.set('userEmail', userEmail);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<PageResponse<AuditLog>>(`${this.apiUrl}/search`, {
      params,
      headers: this.getHeaders()
    });
  }
}
