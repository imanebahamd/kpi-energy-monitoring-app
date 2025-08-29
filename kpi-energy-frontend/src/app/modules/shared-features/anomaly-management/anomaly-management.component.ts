import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnomalyService, Anomaly, AnomalyStats } from '../../../core/services/anomaly.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-anomaly-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anomaly-management.component.html',
  styleUrls: ['./anomaly-management.component.scss']
})
export class AnomalyManagementComponent implements OnInit {
  anomalies: Anomaly[] = [];
  filteredAnomalies: Anomaly[] = [];
  stats: AnomalyStats | null = null;
  showOnlyResolved = false;
  isLoading = false;
  alertMessage = '';
  alertType = '';
  showAlert = false;

  // Variables pour la pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Filtres avancés
  filters = {
    type: '',
    severite: '',
    source: '',
    dateDebut: '',
    dateFin: ''
  };

  // Options pour les filtres
  typesAnomalie = [
    { value: '', label: 'Tous les types' },
    { value: 'ERREUR_SAISIE', label: 'Erreur de saisie' },
    { value: 'PIC_CONSOMMATION', label: 'Pic de consommation' },
    { value: 'FUITE_EAU', label: 'Fuite d\'eau' },
    { value: 'PROBLEME_PRODUCTION', label: 'Problème de production' },
    { value: 'FACTEUR_PUISSANCE', label: 'Facteur de puissance bas' }
  ];

  niveauxSeverite = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'faible', label: 'Faible' },
    { value: 'moyen', label: 'Moyen' },
    { value: 'eleve', label: 'Élevé' },
    { value: 'critique', label: 'Critique' }
  ];

  sourcesDonnees = [
    { value: '', label: 'Toutes les sources' },
    { value: 'ELECTRICITY', label: 'Énergie électrique' },
    { value: 'WATER', label: 'Production eau' }
  ];

  resolvingAnomalies: { [id: number]: boolean } = {};

  constructor(
    private anomalyService: AnomalyService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnomalies();
    this.loadStats();
  }

  // Getter pour les anomalies paginées
  get paginatedAnomalies(): Anomaly[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAnomalies.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Getter pour le nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.filteredAnomalies.length / this.itemsPerPage);
  }

  loadAnomalies(): void {
    this.isLoading = true;
    // Charger TOUTES les anomalies (résolues et non résolues)
    this.anomalyService.getAnomalies(true).subscribe({
      next: (data: Anomaly[]) => {
        this.anomalies = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des anomalies', err);
        this.showAlertMessage('Erreur lors du chargement des anomalies', 'error');
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.anomalyService.getStats().subscribe({
      next: (data: AnomalyStats) => this.stats = data,
      error: (err: any) => {
        console.error('Erreur lors du chargement des stats', err);
        this.showAlertMessage('Erreur lors du chargement des statistiques', 'error');
      }
    });
  }

  triggerScan(): void {
    this.isLoading = true;
    this.anomalyService.triggerScan().subscribe({
      next: (response: string) => {
        this.showAlertMessage('Scan déclenché avec succès. Les résultats seront disponibles dans quelques instants.', 'success');
        setTimeout(() => {
          this.loadAnomalies();
          this.loadStats();
        }, 3000);
      },
      error: (err: any) => {
        this.showAlertMessage('Erreur lors du scan: ' + (err.error?.message || 'Veuillez réessayer'), 'error');
        this.isLoading = false;
      }
    });
  }

  resolveAnomaly(id: number): void {
    this.resolvingAnomalies[id] = true;

    const resolvedBy = this.authService.getCurrentUser()?.nomComplet || 'Administrateur';

    this.anomalyService.resolveAnomaly(id, resolvedBy, 'Résolu manuellement').subscribe({
      next: (response: any) => {
        this.showAlertMessage('Anomalie marquée comme résolue avec succès', 'success');

        // Recharger les données depuis le serveur pour être sûr d'avoir les bonnes dates
        this.loadAnomalies();
        this.loadStats();

        this.resolvingAnomalies[id] = false;
      },
      error: (err: any) => {
        this.showAlertMessage('Erreur lors de la résolution: ' + (err.error?.message || 'Veuillez réessayer'), 'error');
        this.resolvingAnomalies[id] = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredAnomalies = this.anomalies.filter(anomaly => {
      // Filtre principal: afficher seulement les résolues ou toutes selon l'option
      if (this.showOnlyResolved && !anomaly.resolved) {
        return false;
      }

      // Appliquer les autres filtres
      if (this.filters.type && anomaly.anomalyType !== this.filters.type) {
        return false;
      }

      if (this.filters.severite) {
        const severite = this.getSeveriteNiveau(anomaly.severityScore);
        if (severite !== this.filters.severite) {
          return false;
        }
      }

      if (this.filters.source && anomaly.sourceType !== this.filters.source) {
        return false;
      }

      if (this.filters.dateDebut && anomaly.detectedAt && anomaly.detectedAt !== 'Aucune') {
        const detectedDate = new Date(anomaly.detectedAt);
        const startDate = new Date(this.filters.dateDebut);

        if (detectedDate < startDate) {
          return false;
        }
      }

      if (this.filters.dateFin && anomaly.detectedAt && anomaly.detectedAt !== 'Aucune') {
        const detectedDate = new Date(anomaly.detectedAt);
        const endDate = new Date(this.filters.dateFin);
        endDate.setHours(23, 59, 59);

        if (detectedDate > endDate) {
          return false;
        }
      }

      return true;
    });

    // Réinitialiser à la première page après application des filtres
    this.currentPage = 1;
  }

  toggleResolvedFilter(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      type: '',
      severite: '',
      source: '',
      dateDebut: '',
      dateFin: ''
    };
    this.showOnlyResolved = false;
    this.applyFilters();
  }

  // Méthodes de pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Retourner à la première page quand on change le nombre d'éléments par page
  }

  getSeverityClass(score: number): string {
    if (score >= 0.8) return 'critique';
    if (score >= 0.5) return 'eleve';
    if (score >= 0.3) return 'moyen';
    return 'faible';
  }

  getSeveriteNiveau(score: number): string {
    if (score >= 0.8) return 'critique';
    if (score >= 0.5) return 'eleve';
    if (score >= 0.3) return 'moyen';
    return 'faible';
  }

  getSeveriteLabel(score: number): string {
    if (score >= 0.8) return 'Critique';
    if (score >= 0.5) return 'Élevé';
    if (score >= 0.3) return 'Moyen';
    return 'Faible';
  }

  getAnomalyTitle(anomaly: Anomaly): string {
    const sourceLabel = anomaly.sourceType === 'ELECTRICITY' ? 'Énergie électrique' : 'Production eau';
    return `Anomalie ${sourceLabel} - ${anomaly.year}-${anomaly.month.toString().padStart(2, '0')}`;
  }

  getTypeAnomalieLabel(type: string): string {
    const mapping: {[key: string]: string} = {
      'DATA_ENTRY_ERROR': 'Erreur de saisie',
      'CONSUMPTION_SPIKE': 'Pic de consommation',
      'WATER_LEAK': 'Fuite d\'eau',
      'LOW_POWER_FACTOR': 'Facteur de puissance bas',
      'PRODUCTION_ISSUE': 'Problème de production',
      'GENERAL_ANOMALY': 'Anomalie générale'
    };
    return mapping[type] || type;
  }

  getSourceLabel(source: string): string {
    return source === 'ELECTRICITY' ? 'Énergie électrique' : 'Production eau';
  }

  formatDate(dateInput: any): string {
    if (!dateInput || dateInput === 'Aucune' || dateInput === 'null') {
      return 'Non spécifié';
    }

    let date: Date;

    if (Array.isArray(dateInput)) {
      // format Jackson [yyyy,MM,dd,HH,mm,ss]
      date = new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0,
        dateInput[5] || 0
      );
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return 'Date invalide';

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
