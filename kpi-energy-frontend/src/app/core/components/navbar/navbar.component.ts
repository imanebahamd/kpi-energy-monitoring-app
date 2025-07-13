import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav>
      <a routerLink="/dashboard">Dashboard</a>
      <a routerLink="/admin">Admin</a>
    </nav>
  `,
  styles: [`
    nav {
      background: #333;
      padding: 1rem;
    }
    a {
      color: white;
      margin-right: 1rem;
      text-decoration: none;
    }
  `]
})
export class NavbarComponent {}
