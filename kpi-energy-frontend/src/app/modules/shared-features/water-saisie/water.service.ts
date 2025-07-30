import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../../../core/services/token-storage.service';

export interface WaterData {
  year: number;
  month: number;
  f3bis: number;
  f3: number;
  se2: number;
  se3bis: number;
  totalProduction?: number;
}

export interface WaterResponse {
  totalProduction: number;
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class WaterService {
  private apiUrl = 'http://localhost:8081/api/water';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  saveWaterData(data: WaterData): Observable<WaterData> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<WaterData>(this.apiUrl, data, { headers });
  }

  getWaterData(year: number, month: number): Observable<WaterData> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<WaterData>(`${this.apiUrl}/${year}/${month}`, { headers });
  }

  getMonthlyData(year: number): Observable<WaterData[]> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<WaterData[]>(`${this.apiUrl}/monthly/${year}`, { headers });
  }

  getAnnualData(startYear: number, endYear: number): Observable<WaterData[]> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<WaterData[]>(`${this.apiUrl}/annual/${startYear}/${endYear}`, { headers });
  }

  deleteWaterData(year: number, month: number): Observable<void> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.apiUrl}/${year}/${month}`, { headers });
  }

  getWaterDataForEdit(year: number, month: number): Observable<WaterData> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<WaterData>(`${this.apiUrl}/${year}/${month}/edit`, { headers });
  }



}
