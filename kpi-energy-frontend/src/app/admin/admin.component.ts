import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Espace Administrateur</h1>
    <p>Gestion des utilisateurs et configurations</p>
  `,
  styles: []
})
export class AdminComponent {}
