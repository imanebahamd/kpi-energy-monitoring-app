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
    <app-header (toggleSidebar)="toggleSidebar()"></app-header>
    <app-admin-sidebar
      [class.show]="sidebarOpen"
      (closeSidebar)="closeSidebar()"
      [isMobile]="isMobile">
    </app-admin-sidebar>
    <main class="admin-content" [class.sidebar-open]="!isMobile">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .admin-content {
      margin-left: 300px;
      padding: 2rem;
      min-height: calc(100vh - 70px);
      margin-top: 70px;
      transition: all 0.3s ease;
      background: #ffffff; /* Remplacé $white par la valeur hexadécimale */
    }

    @media (max-width: 768px) {
      .admin-content {
        margin-left: 0;
      }

      .admin-content.sidebar-open {
        margin-left: 0;
      }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen: boolean = false;
  isMobile: boolean = false;

  constructor() {
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }
}
