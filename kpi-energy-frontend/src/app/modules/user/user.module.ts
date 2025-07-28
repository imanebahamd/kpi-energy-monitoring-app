// src/app/modules/user/user.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { USER_ROUTES } from './user.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(USER_ROUTES),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UserModule {}
