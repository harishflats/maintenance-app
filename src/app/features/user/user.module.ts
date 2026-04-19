import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserComponent } from './user.component';
import { SummaryComponent } from './summary.component';
import { ContactsComponent } from './contacts.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    UserComponent,
    SummaryComponent,
    ContactsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ]
})
export class UserModule { }
