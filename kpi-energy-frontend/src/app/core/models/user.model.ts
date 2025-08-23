export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: number;
  nomComplet: string;
  email: string;
  role: UserRole;
  actif: boolean;
  telephone?: string;
  departement?: string;
  fonction?: string;
  motDePasse?: string;
}


export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
