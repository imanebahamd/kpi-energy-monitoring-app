// src/app/modules/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ADMIN_ROUTES } from './admin.routes';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule {}
