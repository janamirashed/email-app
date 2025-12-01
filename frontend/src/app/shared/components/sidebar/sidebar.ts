import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../../core/models/folder.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css' // Assuming basic styles for fixed width/height
})
export class SidebarComponent {
  // Input to determine the currently active view/route
  @Input() activeView: 'inbox' | 'contacts' | 'filters' | string = 'inbox'; 

  // System and Custom Folders Data
  systemFolders: Folder[] = [
    { name: 'Inbox', icon: 'inbox', count: 3, type: 'system' },
    { name: 'Starred', icon: 'star', type: 'system' },
    { name: 'Sent', icon: 'send', type: 'system' },
    { name: 'Drafts', icon: 'drafts', type: 'system' },
    { name: 'Trash', icon: 'trash', type: 'system' },
  ];

  customFolders: Folder[] = [
    { name: 'Projects', icon: 'folder', type: 'custom' },
    { name: 'Personal', icon: 'folder', type: 'custom' },
  ];

  bottomViews: Folder[] = [
    { name: 'Contacts', icon: 'contacts', type: 'system' },
    { name: 'Filters & Rules', icon: 'filters', type: 'system' },
  ];

  // Dummy method to simulate routing
  navigateTo(view: string) {
    this.activeView = view;
    console.log('Navigating to:', view);
  }
}