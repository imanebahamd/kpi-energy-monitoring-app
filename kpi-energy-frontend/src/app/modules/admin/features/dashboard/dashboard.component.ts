// src/app/modules/admin/features/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../../components/sidebar/admin-sidebar.component';
import {RouterLink} from '@angular/router';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  adminFeatures = [

  ];
}
