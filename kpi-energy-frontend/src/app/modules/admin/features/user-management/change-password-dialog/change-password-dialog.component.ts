// change-password-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { AdminUserService } from '../../../services/user.service';
import { finalize } from 'rxjs/operators';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  imports: [

    FormsModule,


    NgIf,
  ],
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
  data = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private userService: AdminUserService,
    @Inject(MAT_DIALOG_DATA) public userId: number
  ) {}

  submit() {
    if (this.data.newPassword !== this.data.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.userService.changePassword(this.userId, this.data)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Mot de passe changé avec succès';
          setTimeout(() => this.dialogRef.close(true), 1500);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors du changement de mot de passe';
        }
      });
  }

  close() {
    this.dialogRef.close(false);
  }
}
