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
  simpleSearchTerm: string = '';
  showAdvancedSearch: boolean = false;
  showUserMenu: boolean = false;

  advancedParams = {
    sender: '',
    receiver: '',
    subject: '',
    body: ''
  };
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

    // Close Advanced Search if clicked outside
    const clickedInsideSearch = target.closest('.max-w-2xl');
    if (!clickedInsideSearch && this.showAdvancedSearch) {
      this.showAdvancedSearch = false;
    }

    const clickedInside = target.closest('.user-menu-container');
    if (!clickedInside && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }

  importanceLevel: string = '3'; // Default to Normal (3)


  toggleAdvancedSearch(event: MouseEvent) {
    event.stopPropagation();
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  onSearch() {
    this.showAdvancedSearch = false;
    this.router.navigate(['/search'], {
      queryParams: {
        keyword: this.simpleSearchTerm
      }
    });
  }

  onAdvancedSearch() {
    this.showAdvancedSearch = false;

    // Filter out empty params
    const queryParams: any = {};
    if(this.advancedParams.sender) queryParams.sender = this.advancedParams.sender;
    if(this.advancedParams.receiver) queryParams.receiver = this.advancedParams.receiver;
    if(this.advancedParams.subject) queryParams.subject = this.advancedParams.subject;
    if(this.advancedParams.body) queryParams.body = this.advancedParams.body;

    this.router.navigate(['/search'], { queryParams });
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
