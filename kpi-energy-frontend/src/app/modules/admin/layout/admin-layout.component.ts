// src/app/modules/admin/layout/admin-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../core/shared/layout/header/header.component';
import { AdminSidebarComponent } from '../components/sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, AdminSidebarComponent],
  template: `
    <app-header></app-header>
    <div class="admin-container">
      <app-admin-sidebar></app-admin-sidebar>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: calc(100vh - 80px);
      margin-top: 80px;
    }
    .admin-content {
      flex: 1;
      padding: 2rem;
      margin-left: 250px;
    }
  `]
})
export class AdminLayoutComponent {}
