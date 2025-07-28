import { Component } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Tableau de bord Utilisateur</h2>
      <p>Bienvenue sur votre espace de gestion des consommations</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  `],
  standalone: true
})
export class DashboardComponent {}
