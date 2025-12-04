import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth-service';

@Injectable({
    providedIn: 'root'
})
export class GuestGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): boolean {
        console.log('GuestGuard: Checking if user is guest...');

        if (this.authService.isAuthenticated()) {
            console.log('GuestGuard: User is authenticated, redirecting to inbox');
            this.router.navigate(['/inbox']);
            return false; // Prevent access to login/register
        } else {
            console.log('GuestGuard: User is guest, allowing access');
            return true; // Allow access to login/register
        }
    }
}
