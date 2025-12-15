import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Check if the error is a 401 Unauthorized
            if (error.status === 401) {
                // Skip auto-logout for login and register endpoints
                const isAuthEndpoint = req.url.includes('/login') ||
                    req.url.includes('/register') ||
                    req.url.includes('/verify');

                if (!isAuthEndpoint) {
                    console.warn('401 Unauthorized - Logging out user');
                    // Clear authentication data and redirect to login
                    authService.logout();
                }
            }

            // Re-throw the error so it can still be handled by the calling code
            return throwError(() => error);
        })
    );
};
