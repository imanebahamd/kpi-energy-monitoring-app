import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { adminGuard } from '../../core/auth/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/user-management/user-management.component').then(m => m.UserManagementComponent)
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
        path: 'electricity-limits',
        loadComponent: () => import('../shared-features/electricity/limits/limits.component').then(m => m.LimitsComponent)
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
        path: 'audit-log',
        loadComponent: () => import('./features/audit-log/audit-log.component').then(m => m.AuditLogComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
