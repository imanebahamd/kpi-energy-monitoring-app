import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface MenuItem {
  path?: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  alwaysExpanded?: boolean;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
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
  @Output() closeSidebar = new EventEmitter<void>();

  // Menu organisé en sections avec icônes
  organizedMenuItems: MenuSection[] = [
    {
      title: 'Tableau de bord',
      items: [
        { path: '/user/dashboard', label: 'Vue d\'ensemble', icon: 'dashboard' }
      ]
    },
    {
      title: 'Saisie des données',
      items: [
        { path: '/user/electricity-saisie', label: 'Saisie Énergie', icon: 'energy' },
        { path: '/user/water-saisie', label: 'Saisie Production', icon: 'water' }
      ]
    },
    {
      title: 'Analyses & Rapports',
      items: [
        {
          label: 'Tableaux Synthétiques',
          icon: 'tables',
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
          icon: 'charts',
          children: [
            { path: '/user/water-graphs', label: 'Production' },
            { path: '/user/electricity-graphs', label: 'Énergie' }
          ]
        },
        { path: '/user/reports', label: 'Rapports', icon: 'report' },
        { path: '/user/anomalies', label: 'Anomalies', icon: 'report' }
      ]
    }
  ];

  isExpanded: {[key: string]: boolean} = {};

  constructor(public authService: AuthService, private router: Router) {
    // Initialiser les sections avec des éléments expanded par défaut
    this.initializeExpandedSections();
  }

  private initializeExpandedSections(): void {
    // Auto-expand les sections qui contiennent la route active
    const currentPath = this.router.url;

    this.organizedMenuItems.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          // Vérifier si un sous-élément correspond à la route actuelle
          const hasActiveChild = this.hasActiveChild(item.children, currentPath);
          if (hasActiveChild) {
            this.isExpanded[item.label] = true;
          }

          // Vérifier les enfants imbriqués
          item.children.forEach(child => {
            if (child.children) {
              const hasActiveGrandChild = this.hasActiveChild(child.children, currentPath);
              if (hasActiveGrandChild) {
                this.isExpanded[item.label] = true;
                this.isExpanded[child.label] = true;
              }
            }
          });
        }
      });
    });

    // Expand les sections "Tableaux Synthétiques" et "Visualisation" par défaut
    this.isExpanded['Tableaux Synthétiques'] = true;
    this.isExpanded['Visualisation'] = true;
  }

  private hasActiveChild(children: MenuItem[], currentPath: string): boolean {
    return children.some(child => {
      if (child.path === currentPath) {
        return true;
      }
      if (child.children) {
        return this.hasActiveChild(child.children, currentPath);
      }
      return false;
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

  // Méthode pour vérifier si un élément est actif
  isItemActive(item: MenuItem): boolean {
    if (!item.path) return false;
    return this.router.url === item.path;
  }

  // Méthode pour vérifier si un groupe contient un élément actif
  hasActiveDescendant(item: MenuItem): boolean {
    if (item.path && this.router.url === item.path) {
      return true;
    }

    if (item.children) {
      return item.children.some(child => this.hasActiveDescendant(child));
    }

    return false;
  }
}
