import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  adminPassword = '';
  isAdminUnlocked = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  unlockAdmin(): void {
  
    const today = new Date();
    const expectedPassword = `admin${today.getFullYear()}${today.getMonth() + 1}`;

    if (this.adminPassword === expectedPassword) {
      this.isAdminUnlocked = true;
    } else {
      alert('Incorrect password. Please try again.');
      this.adminPassword = '';
    }
  }

  loginAsAdmin(): void {
    this.authService.login('admin');
    this.router.navigate(['/admin']);
  }

  loginAsUser(): void {
    this.authService.login('user');
    this.router.navigate(['/user']);
  }
}
