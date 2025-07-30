import { Component, OnInit } from '@angular/core';
import { AuditLogService } from './audit-log.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    MatPaginator,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule
  ],
  providers: [provideNativeDateAdapter()]
})
export class AuditLogComponent implements OnInit {
  displayedColumns: string[] = ['timestamp', 'user', 'action', 'table'];
  logs: any[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  actionTypes = ['CREATE', 'UPDATE', 'DELETE'];
  tableNames = ['Données Électriques', 'Données Eau (Production)'];

  searchForm = new FormGroup({
    action: new FormControl(''),
    tableName: new FormControl(''),
    userEmail: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null)
  });

  constructor(private auditService: AuditLogService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    const { action, tableName, userEmail, startDate, endDate } = this.searchForm.value;

    let technicalTableName = tableName;
    if (tableName === 'Données Électriques') {
      technicalTableName = 'electricity_data';
    } else if (tableName === 'Données Eau (Production)') {
      technicalTableName = 'water_data';
    }

    this.auditService.searchLogs(
      action || undefined,
      technicalTableName || undefined,
      userEmail || undefined,
      startDate?.toISOString() || undefined,
      endDate?.toISOString() || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.logs = response.content;
        this.totalItems = response.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des logs:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadLogs();
  }

  onReset() {
    this.searchForm.reset();
    this.currentPage = 0;
    this.loadLogs();
  }

  getActionLabel(action: string): string {
    const actions: {[key: string]: string} = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression'
    };
    return actions[action] || action;
  }

  getTableLabel(tableName: string): string {
    const tables: {[key: string]: string} = {
      'electricity_data': 'Données Électriques',
      'water_data': 'Données Eau '
    };
    return tables[tableName] || tableName;
  }
}
