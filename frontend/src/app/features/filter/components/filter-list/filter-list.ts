import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../core/models/filter.model';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../../../core/services/filter.service';
import { FolderService } from '../../../../core/services/folder.service';

@Component({
  selector: 'app-filter-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-list.html',
})
export class FilterListComponent implements OnInit {
  existingRules: Filter[] = [];
  folders: any[] = []; // Using any[] to handle potential object structure from API

  // Form inputs for new/edit filter
  newFilterName: string = '';
  newFilterConditionField: string = 'subject';
  newFilterConditionOperator: string = 'contains';
  newFilterConditionValue: string = '';

  newFilterAction: string = 'move';
  newFilterActionValue: string = '';

  showCreateDialog = false;
  showEditDialog = false;
  editingFilter: Filter | null = null;

  constructor(
    private filterService: FilterService,
    private folderService: FolderService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadFilters();
    this.loadFolders();
  }

  loadFolders() {
    this.folderService.getAllFolders().subscribe({
      next: (response) => {
        let allFolders: any[] = [];
        // Handle different response structures
        if (Array.isArray(response)) {
          allFolders = response;
        } else if (response && response.folders) {
          allFolders = response.folders;
        } else if (response && response.data) {
          allFolders = response.data;
        }

        // Filter out system folders
        const systemFolders = ['inbox', 'sent', 'trash', 'drafts', 'contacts'];
        this.folders = allFolders.filter(folder =>
          !systemFolders.includes(folder.name.toLowerCase())
        );

        console.log('Loaded folders:', this.folders);
      },
      error: (error) => {
        console.error('Failed to load folders:', error);
      }
    });
  }

  loadFilters() {
    this.filterService.getFilters().subscribe({
      next: (filters) => {
        this.existingRules = filters;
        console.log('Loaded filters:', filters);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load filters:', error);
      }
    });
  }

  openCreateDialog() {
    this.newFilterName = '';
    this.newFilterConditionField = 'subject';
    this.newFilterConditionOperator = 'contains';
    this.newFilterConditionValue = '';
    this.newFilterAction = 'move';
    this.newFilterActionValue = '';
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  saveFilter() {
    if (this.newFilterConditionValue.trim()) {
      const newFilter: Filter = {
        name: this.newFilterName,
        property: this.newFilterConditionField,
        matcher: this.newFilterConditionOperator,
        value: this.newFilterConditionValue,
        action: this.newFilterAction,
        newFolder: this.newFilterAction === 'move' ? this.newFilterActionValue : undefined
      };

      this.filterService.addFilter(newFilter).subscribe({
        next: (savedFilter) => {
          this.existingRules.push(savedFilter);
          this.closeCreateDialog();
          this.cdr.detectChanges();
          console.log('Created filter:', savedFilter);
        },
        error: (error) => {
          console.error('Failed to create filter:', error);
          alert('Failed to create filter: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  editFilter(filter: Filter) {
    this.editingFilter = filter;

    // Populate form with filter data
    this.newFilterName = filter.name || '';
    this.newFilterConditionField = filter.property;
    this.newFilterConditionOperator = filter.matcher;
    this.newFilterConditionValue = filter.value;
    this.newFilterAction = filter.action;
    this.newFilterActionValue = filter.newFolder || '';

    this.showEditDialog = true;
  }

  closeEditDialog() {
    this.showEditDialog = false;
    this.editingFilter = null;
  }

  updateFilter() {
    if (this.editingFilter && this.newFilterConditionValue.trim()) {
      const updatedFilter: Filter = {
        name: this.newFilterName,
        property: this.newFilterConditionField,
        matcher: this.newFilterConditionOperator,
        value: this.newFilterConditionValue,
        action: this.newFilterAction,
        newFolder: this.newFilterAction === 'move' ? this.newFilterActionValue : undefined
      };

      this.filterService.updateFilter(this.editingFilter.id!, updatedFilter).subscribe({
        next: (result) => {
          const index = this.existingRules.findIndex(f => f.id === this.editingFilter!.id);
          if (index !== -1) {
            this.existingRules[index] = { ...updatedFilter, id: this.editingFilter!.id };
          }
          console.log('Updated filter:', result);
          this.closeEditDialog();
          this.cdr.detectChanges();

        },
        error: (error) => {
          console.error('Failed to update filter:', error);
          alert('Failed to update filter: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  deleteFilter(filter: Filter) {
    if (confirm(`Delete filter for "${filter.property} ${filter.matcher} ${filter.value}"?`)) {
      this.filterService.deleteFilter(filter.id!).subscribe({
        next: () => {
          this.existingRules = this.existingRules.filter(f => f.id !== filter.id);
          console.log('Deleted filter:', filter.id);
          this.cdr.detectChanges();

        },
        error: (error) => {
          console.error('Failed to delete filter:', error);
          alert('Failed to delete filter: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  // Helper method to display filter in a readable format
  getFilterName(filter: Filter): string {
    return `${filter.name}`;
  }

  getFilterCondition(filter: Filter): string {
    return `${filter.property} ${filter.matcher}: ${filter.value}`;
  }

  getFilterAction(filter: Filter): string {
    if (filter.action === 'move' && filter.newFolder) {
      return `Move to: ${filter.newFolder}`;
    }
    return filter.action;
  }
}
