import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
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

        if (this.username.length < 3) {
            this.errorMessage = 'Username must be at least 3 characters long';
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
            this.errorMessage = 'Username can only contain letters, numbers, and underscores';
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

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.password)) {
            this.errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
            return;
        }

        this.isLoading = true;
        this.api.register(new User(this.username, this.password)).subscribe({
            next: (response) => {
                console.log('Registration successful:', response);
                this.isLoading = false;
                this.router.navigate(['/login']);
            },
            error: (error) => {
                console.error('Registration failed:', error);
                console.log('Error status:', error.status);
                this.isLoading = false;

                // Handle specific HTTP status codes
                if (error.status === 409) {
                    this.errorMessage = 'Username already exists. Please choose a different username.';
                } else if (error.status === 400) {
                    this.errorMessage = error.error?.message || 'Invalid registration data. Please check your input.';
                } else if (error.status === 500) {
                    this.errorMessage = 'Server error. Please try again later.';
                } else {
                    this.errorMessage =
                        error.error?.message ||
                        error.error?.error ||
                        error.message ||
                        (typeof error.error === 'string' ? error.error : null) ||
                        'Registration failed. Please try again.';
                }
                console.log('Final error message:', this.errorMessage);

                // Force UI update
                this.cdr.detectChanges();
            }
        });
    }
}
