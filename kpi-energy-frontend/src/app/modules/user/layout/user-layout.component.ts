import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../core/shared/layout/header/header.component';
import { UserSidebarComponent } from '../components/sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, UserSidebarComponent],
  template: `
    <app-header (toggleSidebar)="toggleSidebar()"></app-header>
    <app-user-sidebar
      [isMobile]="isMobile"
      [sidebarOpen]="sidebarOpen"
      >
    </app-user-sidebar>
    <main class="user-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .user-content {
      margin-left: 300px;
      padding: 2rem;
      min-height: calc(100vh - 70px);
      margin-top: 70px;
      transition: all 0.3s ease;
      background: #ffffff;
    }

    @media (max-width: 768px) {
      .user-content {
        margin-left: 0;
      }
    }
  `]
})
export class UserLayoutComponent {
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
