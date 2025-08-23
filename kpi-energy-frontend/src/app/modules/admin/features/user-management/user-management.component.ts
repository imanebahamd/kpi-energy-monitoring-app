// src/app/modules/admin/features/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../services/user.service';
import { User } from '../../../../core/models/user.model';
import {MatDialog} from '@angular/material/dialog';
import {ChangePasswordDialogComponent} from './change-password-dialog/change-password-dialog.component';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  isEditMode = false;
  showUserForm = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Liste des rôles disponibles
  roles = ['ADMIN', 'USER'];

  // Formulaire utilisateur
  userForm = {
    nomComplet: '',
    email: '',
    role: 'USER',
    telephone: '',
    departement: '',
    fonction: '',
    motDePasse: '',
    confirmPassword: ''
  };

  constructor(private userService: AdminUserService ,
              private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Charger la liste des utilisateurs
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des utilisateurs');
      }
    });
  }

  // Initialiser l'ajout d'un utilisateur
  initAddUser(): void {
    this.currentUser = null;
    this.isEditMode = false;
    this.resetForm();
    this.showUserForm = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Initialiser la modification d'un utilisateur
  initEditUser(user: User): void {
    this.currentUser = user;
    this.isEditMode = true;
    this.userForm = {
      nomComplet: user.nomComplet,
      email: user.email,
      role: user.role,
      telephone: user.telephone || '',
      departement: user.departement || '',
      fonction: user.fonction || '',
      motDePasse: '',
      confirmPassword: ''
    };
    this.showUserForm = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Soumettre le formulaire
  submitUser(): void {
    if (this.userForm.motDePasse !== this.userForm.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.isEditMode && this.currentUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  // Créer un nouvel utilisateur
  createUser(): void {
    this.isLoading = true;
    const newUser: User = {
      nomComplet: this.userForm.nomComplet,
      email: this.userForm.email,
      role: this.userForm.role as 'ADMIN' | 'USER',
      telephone: this.userForm.telephone,
      departement: this.userForm.departement,
      fonction: this.userForm.fonction,
      motDePasse: this.userForm.motDePasse,
      actif: true,
      id: 0
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.showUserForm = false;
        this.successMessage = 'Utilisateur créé avec succès';
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, "Erreur lors de la création de l'utilisateur");
      }
    });
  }

  // Mettre à jour un utilisateur
  updateUser(): void {
    if (!this.currentUser) return;
    this.isLoading = true;

    const updatedUser: User = {
      ...this.currentUser,
      nomComplet: this.userForm.nomComplet,
      email: this.userForm.email,
      role: this.userForm.role as 'ADMIN' | 'USER',
      telephone: this.userForm.telephone,
      departement: this.userForm.departement,
      fonction: this.userForm.fonction,
      ...(this.userForm.motDePasse ? { motDePasse: this.userForm.motDePasse } : {})
    };

    this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
      next: () => {
        this.loadUsers();
        this.showUserForm = false;
        this.successMessage = 'Utilisateur mis à jour avec succès';
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, "Erreur lors de la mise à jour de l'utilisateur");
      }
    });
  }

  // Supprimer un utilisateur
  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err, "Erreur lors de la suppression de l'utilisateur");
        }
      });
    }
  }

  // Changer le statut actif/inactif
  toggleUserStatus(user: User): void {
    this.isLoading = true;
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        user.actif = updatedUser.actif;
        this.successMessage = `Utilisateur ${updatedUser.actif ? 'activé' : 'désactivé'} avec succès`;
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, "Erreur lors du changement de statut");
      }
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.userForm = {
      nomComplet: '',
      email: '',
      role: 'USER',
      telephone: '',
      departement: '',
      fonction: '',
      motDePasse: '',
      confirmPassword: ''
    };
    this.errorMessage = null;
  }

  // Annuler le formulaire
  cancelForm(): void {
    this.showUserForm = false;
    this.resetForm();
  }

// Ajoutez cette méthode à votre UserManagementComponent

  /**
   * Fonction de tracking pour optimiser les performances de la liste
   */
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

// Ajoutez aussi ces méthodes utilitaires si vous voulez améliorer l'UX

  /**
   * Ferme automatiquement les messages après un délai
   */
  private clearMessagesAfterDelay(delay: number = 5000): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
    }, delay);
  }

  /**
   * Affiche un message de succès
   */
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;
    this.clearMessagesAfterDelay();
  }

  /**
   * Affiche un message d'erreur
   */
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;
    this.clearMessagesAfterDelay();
  }



  // Gestion des erreurs
  private handleError(error: any, defaultMessage: string): void {
    console.error();
    this.errorMessage = error.error?.message || defaultMessage;
    this.isLoading = false;
    setTimeout(() => this.errorMessage = null, 5000);
  }

  openChangePasswordDialog(userId: number): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px',
      data: userId
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.showSuccessMessage('Mot de passe changé avec succès');
      }
    });
  }
}
