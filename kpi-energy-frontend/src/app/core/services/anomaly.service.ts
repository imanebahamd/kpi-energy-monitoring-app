import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

export interface Anomaly {
  id: number;
  sourceType: string;
  sourceId: number;
  year: number;
  month: number;
  description: string;
  anomalyType: string;
  severityScore: number;
  detectedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AnomalyStats {
  total_active_anomalies: number;
  critical_anomalies: number;
  last_detection: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnomalyService {
  private apiUrl = 'http://localhost:8081/api/anomalies';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAnomalies(resolved: boolean = false): Observable<Anomaly[]> {
    return this.http.get<Anomaly[]>(`${this.apiUrl}?resolved=${resolved}`, {
      headers: this.getHeaders()
    });
  }

  getCriticalAnomalies(): Observable<Anomaly[]> {
    return this.http.get<Anomaly[]>(`${this.apiUrl}/critical`, {
      headers: this.getHeaders()
    });
  }

  getStats(): Observable<AnomalyStats> {
    return this.http.get<AnomalyStats>(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  resolveAnomaly(id: number, resolvedBy: string, notes: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${id}/resolve`,
      { resolvedBy, notes },
      { headers: this.getHeaders() }
    );
  }

  triggerScan(): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/scan-now`,
      {},
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  validateData(data: any): Observable<{is_anomaly: boolean, message: string}> {
    return this.http.post<{is_anomaly: boolean, message: string}>(
      `${this.apiUrl}/validate-data`,
      data,
      { headers: this.getHeaders() }
    );
  }
}
