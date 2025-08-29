import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';

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

  // Menu organisé en sections avec icônes
  organizedMenuItems: MenuSection[] = [
    {
      title: 'Tableau de bord',
      items: [
        { path: '/admin/dashboard', label: 'Vue d\'ensemble', icon: 'dashboard' }
      ]
    },
    {
      title: 'Saisie des données',
      items: [
        { path: '/admin/electricity-saisie', label: 'Saisie Énergie', icon: 'energy' },
        { path: '/admin/water-saisie', label: 'Saisie Production', icon: 'water' }
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
          icon: 'charts',
          children: [
            { path: '/admin/water-graphs', label: 'Production' },
            { path: '/admin/electricity-graphs', label: 'Énergie' }
          ]
        },
        { path: '/admin/reports', label: 'Rapports', icon: 'report' },
        { path: '/admin/anomalies', label: 'Anomalies', icon: 'report' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { path: '/admin/users', label: 'Utilisateurs', icon: 'users' },
        { path: '/admin/audit-log', label: 'Journal Audit', icon: 'audit' }
      ]
    }
  ];

  isExpanded: {[key: string]: boolean} = {};

  constructor(private router: Router) {
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

  // Méthode utilitaire pour le routage
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeOnMobile();
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
