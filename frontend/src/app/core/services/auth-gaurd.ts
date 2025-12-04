import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    console.log('AuthGuard: Checking authentication...');
    const isAuth = this.authService.isAuthenticated();
    console.log('AuthGuard: isAuthenticated result:', isAuth);
    console.log('AuthGuard: localStorage check:', {
      token: localStorage.getItem('authToken'),
      isAuthenticated: localStorage.getItem('isAuthenticated')
    });

    if (isAuth) {
      console.log('AuthGuard: Access granted');
      return true;
    } else {
      console.log('AuthGuard: Access denied, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
