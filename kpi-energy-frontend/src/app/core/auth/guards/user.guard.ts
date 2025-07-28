// src/app/core/auth/guards/user.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  if (!user || user.role !== 'USER') {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};
