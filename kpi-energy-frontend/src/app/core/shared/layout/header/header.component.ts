import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  currentUser: User | null = null;
  currentPageTitle: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
    this.setPageTitle(this.router.url);

    this.router.events.subscribe(() => {
      this.setPageTitle(this.router.url);
    });
  }

  private setPageTitle(url: string): void {
    const pageTitles: {[key: string]: string} = {
      '/admin/dashboard': 'Tableau de bord',
      '/admin/electricity-saisie': 'Saisie électrique',
      '/admin/water-saisie': 'Saisie eau',
      '/admin/electricity-monthly': 'Synthèse mensuelle électrique',
      '/admin/electricity-annual': 'Synthèse annuelle électrique',
      '/admin/water-monthly': 'Synthèse mensuelle eau',
      '/admin/water-annual': 'Synthèse annuelle eau',
      '/admin/electricity-graphs': 'Visualisation électrique',
      '/admin/water-graphs': 'Visualisation eau',
      '/admin/reports': 'Génération de rapports',
      '/admin/users': 'Gestion des utilisateurs',
      '/admin/audit-log': 'Journal d\'audit'
    };

    this.currentPageTitle = pageTitles[url] || '';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
