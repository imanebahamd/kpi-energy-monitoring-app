// src/app/modules/user/layout/user-layout.component.ts
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
    <app-header></app-header>
    <app-user-sidebar></app-user-sidebar>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      min-height: 100vh;
      flex-direction: column;
    }

    app-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1100;
    }

    .content {
      margin-left: 250px;
      margin-top: 80px;
      padding: 30px;
      flex: 1;
      background: #f5f7fa;
      min-height: calc(100vh - 80px);
    }

    @media (max-width: 768px) {
      .content {
        margin-left: 0;
      }
    }
  `]
})
export class UserLayoutComponent {}
