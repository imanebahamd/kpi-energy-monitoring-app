export interface AuditLog {
  id: number;
  action: string;
  tableName: string;
  recordId: number;
  oldValues: string;
  newValues: string;
  actionTimestamp: string;
  user: {
    id: number;
    nomComplet: string;
    email: string;
  };
  ipAddress?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
