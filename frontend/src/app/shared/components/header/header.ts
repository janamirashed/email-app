import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  userInitials: string = 'U';
  searchTerm: string = '';
  showUserMenu = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.userInitials = currentUser.substring(0, 2).toUpperCase();
    }
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      // Navigate to a search results page or trigger search
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchTerm }
      });
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
