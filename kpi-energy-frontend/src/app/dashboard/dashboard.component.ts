import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Tableau de bord</h1>
    <p>Bienvenue sur votre tableau de bord</p>
  `,
  styles: []
})
export class DashboardComponent {}
