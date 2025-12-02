import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../../core/models/folder.model';
import { EmailComposeService } from '../../../core/services/email-compose.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css' // Assuming basic styles for fixed width/height
})
export class SidebarComponent {
  // Input to determine the currently active view/route
  @Input() activeView: 'inbox' | 'contacts' | 'filters-rules' | string = 'inbox'; 
  
  // OUTPUT: A new EventEmitter to send the requested view change to the parent
  @Output() viewChange = new EventEmitter<string>();

  constructor(private composeService : EmailComposeService){}
  
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
    { name: 'Filters & Rules', icon: 'filters-rules', type: 'system' }, // Renamed to match AppComponent's check
  ];

  // Modified method: It now emits the view name instead of setting local state
  navigateTo(view: string) {
    // We update the local Input, but more importantly, we notify the parent.
    this.viewChange.emit(view);
    console.log('Emitting navigation request to:', view);
  }

  openCompose() {
    this.composeService.openCompose();
  }
}