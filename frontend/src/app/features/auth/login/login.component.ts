import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  private api = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  onSubmit() {
    this.errorMessage = '';

    // Validate username
    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    // Validate password
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.isLoading = true;
    console.log('Starting login...');
    this.api.login(new User(this.username, this.password)).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        console.log('Response token:', response.token);
        this.isLoading = false;

        // Store authentication token/data
        if (response.Token) {
          console.log('Storing token in localStorage');
          console.log(response.Token);
          localStorage.setItem('authToken', response.Token);
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', this.username);

        console.log('Auth state stored, navigating to inbox...');
        console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));

        this.router.navigate(['/inbox']).then(success => {
          console.log('Navigation result:', success);
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Login failed:', error);
        console.log('Error status:', error.status);
        this.isLoading = false;

        // Handle specific HTTP status codes
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else if (error.status === 404) {
          this.errorMessage = 'User not found. Please check your username.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage =
            error.error?.message ||
            error.error?.error ||
            error.message ||
            (typeof error.error === 'string' ? error.error : null) ||
            'Login failed. Please check your credentials.';
        }
        console.log('Final error message:', this.errorMessage);

        // Force UI update
        this.cdr.detectChanges();
      }
    });
  }
}
