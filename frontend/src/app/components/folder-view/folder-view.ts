import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderListComponent } from '../../features/folder/components/folder-list/folder-list';

@Component({
  selector: 'app-folder-view',
  standalone: true,
  imports: [CommonModule,FolderListComponent],
  templateUrl: './folder-view.html'
})
export class FolderViewComponent {}
