import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { TokenStorageService } from '../../../core/services/token-storage.service';

interface ElectricitySummary {
  year: number;
  month: number;
  network60kvPeak: number;
  network60kvPowerFactor: number;
  network60kvConsumption: number;
  network22kvPeak: number;
  network22kvPowerFactor: number;
  network22kvConsumption: number;
  cosphiLimit60kv: number;
  cosphiLimit22kv: number;
}

@Injectable({
  providedIn: 'root'
})
export class ElectricityService {
  private apiUrl = 'http://localhost:8081/api/electricity';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  saveElectricityData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getElectricityData(year: number, month: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${year}/${month}`, { headers: this.getHeaders() });
  }

  getMonthlySummary(year: number, month: number): Observable<ElectricitySummary> {
    return this.http.get<ElectricitySummary>(`${this.apiUrl}/summary/${year}/${month}`, { headers: this.getHeaders() }).pipe(
      map(summary => ({
        ...summary,
        cosphiLimit60kv: 0.9,
        cosphiLimit22kv: 0.8
      }))
    );
  }

  getAnnualSummary(year: number): Observable<ElectricitySummary[]> {
    return this.http.get<ElectricitySummary[]>(`${this.apiUrl}/annual-summary/${year}`, { headers: this.getHeaders() }).pipe(
      map(summaries => summaries.map(summary => ({
        ...summary,
        cosphiLimit60kv: 0.9,
        cosphiLimit22kv: 0.8
      })))
    );
  }

  getLimits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/limits`, { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
