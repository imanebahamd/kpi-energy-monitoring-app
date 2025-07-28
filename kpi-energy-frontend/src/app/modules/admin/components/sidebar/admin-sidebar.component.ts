// src/app/modules/admin/components/sidebar/admin-sidebar.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  group?: string; // Optionnel: pour grouper les éléments visuellement
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  templateUrl: './admin-sidebar.component.html',
  imports: [
    RouterLink,
    CommonModule
  ],
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  menuItems: MenuItem[] = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/users', icon: 'bi-people-fill', label: 'Gestion Utilisateurs' },

    // Section Électricité
    {
      path: '/admin/electricity-saisie',
      icon: 'bi-lightning-charge',
      label: 'Saisie Électricité',
      group: 'Électricité'
    },
    {
      path: '/admin/electricity-monthly',
      icon: 'bi-calendar-month',
      label: 'Tableau Mensuel',
      group: 'Électricité'
    },
    {
      path: '/admin/electricity-annual',
      icon: 'bi-calendar-year',
      label: 'Tableau Annuel',
      group: 'Électricité'
    },
    {
      path: '/admin/electricity-graphs',
      icon: 'bi-graph-up',
      label: 'Visualisation Graphique',
      group: 'Électricité'
    },

    // Section Eau
    {
      path: '/admin/water-saisie',
      icon: 'bi-droplet',
      label: 'Saisie Eau',
      group: 'Eau'
    },



    {
      path: '/admin/water-monthly',
      icon: 'bi-calendar-month',
      label: 'Tableau Mensuel Eau',
      group: 'Eau'
    },
    {
      path: '/admin/water-annual',
      icon: 'bi-calendar-year',
      label: 'Tableau Annuel Eau',
      group: 'Eau'
    },
    {
      path: '/admin/water-graphs',
      icon: 'bi-graph-up',
      label: 'Graphiques Eau',
      group: 'Eau'
    },
    {
      path: '/admin/reports',
      icon: 'bi-file-earmark-pdf',
      label: 'Générer Rapports',
      group: 'Administration'
    },
    {
      path: '/admin/audit-log',
      icon: 'bi-clipboard2-data',
      label: 'Journal d\'Audit',
      group: 'Administration'
    },

  ];


}
