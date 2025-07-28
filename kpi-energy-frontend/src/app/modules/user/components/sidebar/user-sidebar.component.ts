// src/app/modules/user/components/sidebar/user-sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  group?: string;
}

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss']
})
export class UserSidebarComponent {
  menuItems: MenuItem[] = [
    { path: '/user/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },

    // Section Électricité
    {
      path: '/user/electricity-saisie',
      icon: 'bi-lightning-charge-fill',
      label: 'Saisie Électricité',
      group: 'Électricité'
    },
    {
      path: '/user/electricity-monthly',
      icon: 'bi-calendar-month',
      label: 'Synthèse Mensuelle',
      group: 'Électricité'
    },
    {
      path: '/user/electricity-annual',
      icon: 'bi-calendar-year',
      label: 'Synthèse Annuelle',
      group: 'Électricité'
    },
    {
      path: '/user/electricity-graphs',
      icon: 'bi-graph-up',
      label: 'Visualisation Graphique',
      group: 'Électricité'
    },

    // Section Eau
    {
      path: '/user/water-saisie',
      icon: 'bi-droplet-fill',
      label: 'Saisie Eau',
      group: 'Eau'
    },
    {
      path: '/user/water-monthly',
      icon: 'bi-calendar-month',
      label: 'Synthèse Mensuelle',
      group: 'Eau'
    },
    {
      path: '/user/water-annual',
      icon: 'bi-calendar-year',
      label: 'Synthèse Annuelle',
      group: 'Eau'
    },
    {
      path: '/user/water-graphs',
      icon: 'bi-graph-up',
      label: 'Visualisation Graphique',
      group: 'Eau'
    },

    // Rapports
    {
      path: '/user/reports',
      icon: 'bi-file-earmark-pdf-fill',
      label: 'Générer Rapports'
    }
  ];

  currentGroup: string | null = null;

  constructor(private authService: AuthService) {}

  get user() {
    return this.authService.getCurrentUser();
  }

  toggleGroup(group: string): void {
    this.currentGroup = this.currentGroup === group ? null : group;
  }

  isGroupExpanded(group: string): boolean {
    return this.currentGroup === group;
  }
}
