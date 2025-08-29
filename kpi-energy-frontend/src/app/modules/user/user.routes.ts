// src/app/modules/user/user.routes.ts (correction des paths)
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { UserLayoutComponent } from './layout/user-layout.component';
import { userGuard } from '../../core/auth/guards/user.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [authGuard, userGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'electricity-saisie',
        loadComponent: () => import('../shared-features/electricity-saisie/electricity-saisie.component').then(m => m.ElectricitySaisieComponent)
      },
      {
        path: 'water-saisie',
        loadComponent: () => import('../shared-features/water-saisie/water-saisie.component').then(m => m.WaterSaisieComponent)
      },
      {
        path: 'electricity-monthly',
        loadComponent: () => import('../shared-features/electricity/monthly-summary/monthly-summary.component').then(m => m.MonthlySummaryComponent)
      },
      {
        path: 'electricity-annual',
        loadComponent: () => import('../shared-features/electricity/annual-summary/annual-summary.component').then(m => m.AnnualSummaryComponent)
      },
      {
        path: 'electricity-graphs',
        loadComponent: () => import('../shared-features/electricity/graphs/electricity-graphs.component').then(m => m.ElectricityGraphsComponent)
      },
      {
        path: 'water-monthly',
        loadComponent: () => import('../shared-features/water/monthly-summary/monthly-summary.component').then(m => m.MonthlySummaryComponent)
      },
      {
        path: 'water-annual',
        loadComponent: () => import('../shared-features/water/annual-summary/annual-summary.component').then(m => m.AnnualSummaryComponent)
      },
      {
        path: 'water-graphs',
        loadComponent: () => import('../shared-features/water/water-graphs/water-graphs.component').then(m => m.WaterGraphsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('../shared-features/reports/report-generator.component').then(m => m.ReportGeneratorComponent)
      },
      {
        path: 'anomalies',
        loadComponent: () => import('../shared-features/anomaly-management/anomaly-management.component').then(m => m.AnomalyManagementComponent)
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
