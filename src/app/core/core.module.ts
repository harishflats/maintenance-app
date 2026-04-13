import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { DataService } from './services/data.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [DataService, AuthGuard]
})
export class CoreModule { }
