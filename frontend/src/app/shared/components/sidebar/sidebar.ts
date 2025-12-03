// app/shared/components/sidebar/sidebar.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink in template
import { Observable, filter } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmailComposeService } from '../../../core/services/email-compose.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule ], 
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  
  // 1. Removed activeView property - not needed with routerLinkActive

  systemFolders = [
    { name: 'Inbox', icon: 'inbox', count: 12, path: 'inbox' },
    { name: 'Starred', icon: 'star', count: 3, path: 'starred' },
    { name: 'Sent', icon: 'send', count: null, path: 'sent' },
    { name: 'Drafts', icon: 'drafts', count: 2, path: 'drafts' },
    { name: 'Trash', icon: 'trash', count: 5, path: 'trash' }
  ];

  customFolders = [
    // Note: If custom folders have unique paths, update this model.
    { name: 'Work', icon: 'folder', path: 'work' }, 
    { name: 'Personal', icon: 'folder', path: 'personal' } 
  ];

  bottomViews = [
    // Renamed icon to path for clarity when used in routerLink
    { name: 'Contacts', path: 'contacts' }, 
    { name: 'Filters & Rules', path: 'filters' } 
  ];

  constructor(private router: Router , private composeService: EmailComposeService) {}

  // 2. Removed ngOnInit and router.events subscription - not needed for simple active state management

  ngOnInit() {
    // You can use ngOnInit for other setup, but not required for basic routing
  }

  // 3. Removed navigateTo method - navigation is handled directly by routerLink in HTML

   

  openCompose() {
    this.composeService.openCompose();
  }
}