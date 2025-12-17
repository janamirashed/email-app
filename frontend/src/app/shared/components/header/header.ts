import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { SidebarService } from '../../../core/services/sidebar.service';
import {FolderService} from '../../../core/services/folder.service';
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
  showAdvancedSearch: boolean = false;
  showUserMenu: boolean = false;

  availableFolders: any[] = [];

  advancedParams = {
    sender: '',
    receiver: '',
    subject: '',
    body: '',
    folder: 'all',
    priority: '',
    hasAttachment: false,
    dateWithin: '',
    dateReference: ''
  };

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private folderService: FolderService,
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

    this.loadFolders();
  }

  loadFolders() {
    this.folderService.getAllFolders().subscribe({
      next: (response: any) => {
        if (response && response.folders) {
          this.availableFolders = response.folders.filter((f: any) => f.type === 'CUSTOM');
        }
      },
      error: (err: any) => console.error('Failed to load folders', err)
    });
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

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
    //move text of main search bar to "include words" field
    if (this.showAdvancedSearch && this.searchTerm) {
      this.advancedParams.body = this.searchTerm;
    }
  }

  onSearch() {
    this.showAdvancedSearch = false;
    this.router.navigate(['/search'], {
      queryParams: {
        keyword: this.searchTerm
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
    if(this.advancedParams.body) {
      queryParams.body = this.advancedParams.body;
    } else if (this.searchTerm) {
      queryParams.body = this.searchTerm;
    }
    if(this.advancedParams.folder && this.advancedParams.folder !== 'all') {
      queryParams.folder = this.advancedParams.folder;
    }
    if(this.advancedParams.priority) {
      queryParams.priority = this.advancedParams.priority;
    }
    if(this.advancedParams.hasAttachment) {
      queryParams.hasAttachment = 'true';
    }
    if (this.advancedParams.dateWithin && this.advancedParams.dateReference) {
      const range = this.calculateDateRange(this.advancedParams.dateWithin, this.advancedParams.dateReference);
      if (range) {
        queryParams.startDate = range.start;
        queryParams.endDate = range.end;
      }
    }

    this.router.navigate(['/search'], { queryParams });
  }

  onCreateFilter() {
    this.showAdvancedSearch = false;

    // PREPARE PARAMS FOR FILTER PAGE
    const queryParams: any = {};

    if (this.advancedParams.sender) queryParams.from = this.advancedParams.sender;
    if (this.advancedParams.receiver) queryParams.receiver = this.advancedParams.receiver;
    if (this.advancedParams.subject) queryParams.subject = this.advancedParams.subject;
    if (this.advancedParams.body) {
      queryParams.body = this.advancedParams.body;
    } else if (this.searchTerm) {
      queryParams.body = this.searchTerm;
    }
    if (this.advancedParams.priority) queryParams.priority = this.advancedParams.priority;
    if (this.advancedParams.hasAttachment) queryParams.hasAttachment = 'true';
    queryParams.create = 'true';

    this.router.navigate(['/filters'], { queryParams }).catch(err => {
      if (err.name !== 'NavigationCancel' && err.message !== 'Transition was skipped') {
        console.error('Navigation error:', err);
      }
    });
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


  private calculateDateRange(interval: string, refDate: string): { start: string, end: string } | null {
    if (!interval || !refDate) return null;

    const date = new Date(refDate);
    const rangeMap: any = {
      '1d': 1, '3d': 3, '1w': 7, '2w': 14, '1m': 30, '6m': 180, '1y': 365
    };

    const days = rangeMap[interval] || 0;
    if (days === 0) return null;
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - days);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + days);

    return {
      start: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      end: endDate.toISOString().split('T')[0]
    };
  }
}
