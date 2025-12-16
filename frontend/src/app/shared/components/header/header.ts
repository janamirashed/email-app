import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  userInitials: string = '';
  userName: string = '';
  userEmail: string = '';
  searchTerm: string = '';
  searchBy: string = 'all';
  showUserMenu: boolean = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router
  ) { }

  ngOnInit() {
    // Get user info from localStorage
    const currentUser = localStorage.getItem('currentUser') || '';
    this.userName = currentUser;

    // Try to get email from localStorage or construct it
    this.userEmail = `${currentUser}@jaryn.com`;

    // Generate initials from username
    if (currentUser) {
      const nameParts = currentUser.split(' ');
      if (nameParts.length >= 2) {
        this.userInitials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      } else {
        this.userInitials = currentUser.substring(0, 2).toUpperCase();
      }
    } else {
      this.userInitials = 'U';
      this.userName = 'User';
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.user-menu-container');
    if (!clickedInside && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }

  importanceLevel: string = '3'; // Default to Normal (3)

  onSearch() {
    let keyword = this.searchTerm;

    if (this.searchBy === 'importance') {
      keyword = this.importanceLevel;
    }

    if (keyword.trim()) {
      this.router.navigate(['/search'], {
        queryParams: {
          keyword: keyword,
          searchBy: this.searchBy
        }
      });
    }
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  logout() {
    this.authService.logout();
  }
}
