import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';

interface MenuItem {
  path?: string;
  label: string;
  children?: MenuItem[];
  alwaysExpanded?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  templateUrl: './admin-sidebar.component.html',
  imports: [RouterLink, CommonModule, RouterLinkActive],
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  @Output() closeSidebar = new EventEmitter<void>();
  @Input() isMobile: boolean = false;
  @Input() sidebarOpen: boolean = false;

  menuItems: MenuItem[] = [
    { path: '/admin/dashboard', label: 'Vue d\'ensemble' },
    { path: '/admin/electricity-saisie', label: 'Saisie Énergie' },
    { path: '/admin/water-saisie', label: 'Saisie Production' },
    {
      label: 'Tableaux Synthétiques',
      alwaysExpanded: true,
      children: [
        {
          label: 'Production',
          children: [
            { path: '/admin/water-monthly', label: 'Synthèse Mensuelle' },
            { path: '/admin/water-annual', label: 'Synthèse Annuelle' }
          ]
        },
        {
          label: 'Énergie',
          children: [
            { path: '/admin/electricity-monthly', label: 'Synthèse Mensuelle' },
            { path: '/admin/electricity-annual', label: 'Synthèse Annuelle' }
          ]
        }
      ]
    },
    {
      label: 'Visualisation',
      alwaysExpanded: true,
      children: [
        { path: '/admin/water-graphs', label: 'Production' },
        { path: '/admin/electricity-graphs', label: 'Énergie' }
      ]
    },
    { path: '/admin/reports', label: 'Rapports' },
    { path: '/admin/users', label: 'Utilisateurs' },
    { path: '/admin/audit-log', label: 'Journal Audit' }
  ];

  isExpanded: {[key: string]: boolean} = {};

  constructor(private router: Router) {
    // Initialiser les sections alwaysExpanded comme ouvertes
    this.menuItems.forEach(item => {
      if (item.alwaysExpanded) {
        this.isExpanded[item.label] = true;
      }
    });
  }

  toggleExpand(label: string): void {
    this.isExpanded[label] = !this.isExpanded[label];
  }

  closeOnMobile(): void {
    if (this.isMobile) {
      this.closeSidebar.emit();
    }
  }
}
