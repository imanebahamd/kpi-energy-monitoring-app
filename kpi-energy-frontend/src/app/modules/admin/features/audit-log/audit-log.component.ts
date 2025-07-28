import { Component } from '@angular/core';
import { AuditLogService } from './audit-log.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import { AuditLog } from '../../../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  imports: [
    DatePipe,
    NgForOf,
    MatPaginator,
    NgIf
  ],
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent {
  logs: AuditLog[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  selectedLog: AuditLog | null = null;
  showModal = false;

  constructor(private auditService: AuditLogService) {
    this.loadLogs();
  }

  loadLogs() {
    this.auditService.getLogs(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.logs = response.content;
        this.totalItems = response.totalElements;
      },
      error: (err) => console.error('Erreur lors du chargement des logs:', err)
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  showDetails(log: AuditLog) {
    this.selectedLog = log;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedLog = null;
  }

  formatJson(json: string): string {
    if (!json) return 'Aucune donnée';

    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return json;
    }
  }
}
