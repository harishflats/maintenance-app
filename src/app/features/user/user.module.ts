import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserComponent } from './user.component';
import { SummaryComponent } from './summary.component';
import { ContactsComponent } from './contacts.component';
import { RouterModule } from '@angular/router';
import { RupeePipe } from './rupee.pipe';

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
    RupeePipe
  ]
})
export class UserModule { }
