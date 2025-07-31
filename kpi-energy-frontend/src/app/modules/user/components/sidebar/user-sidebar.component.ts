import { Component ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface MenuItem {
  path?: string;
  label: string;
  children?: MenuItem[];
  alwaysExpanded?: boolean;
}

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss']
})
export class UserSidebarComponent {
  @Input() isMobile: boolean = false;
  @Input() sidebarOpen: boolean = false;
  menuItems: MenuItem[] = [
    { path: '/user/dashboard', label: 'Vue d\'ensemble' },
    { path: '/user/electricity-saisie', label: 'Saisie Énergie' },
    { path: '/user/water-saisie', label: 'Saisie Production' },
    {
      label: 'Tableaux Synthétiques',
      alwaysExpanded: true,
      children: [
        {
          label: 'Production',
          children: [
            { path: '/user/water-monthly', label: 'Synthèse Mensuelle' },
            { path: '/user/water-annual', label: 'Synthèse Annuelle' }
          ]
        },
        {
          label: 'Énergie',
          children: [
            { path: '/user/electricity-monthly', label: 'Synthèse Mensuelle' },
            { path: '/user/electricity-annual', label: 'Synthèse Annuelle' }
          ]
        }
      ]
    },
    {
      label: 'Visualisation',
      alwaysExpanded: true,
      children: [
        { path: '/user/water-graphs', label: 'Production' },
        { path: '/user/electricity-graphs', label: 'Énergie' }
      ]
    },
    { path: '/user/reports', label: 'Rapports' }
  ];

  isExpanded: {[key: string]: boolean} = {};

  constructor(public authService: AuthService) {
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
}
