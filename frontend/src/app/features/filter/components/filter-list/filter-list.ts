import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter } from '../../../../core/models/filter.model';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../../../core/services/filter.service';
import { FolderService } from '../../../../core/services/folder.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ActivatedRoute, Router } from '@angular/router';

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

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
  conditions: FilterCondition[] = [];

  newFilterName: string = '';
  newFilterAction: string = 'move';
  newFilterActionValue: string = '';
  newFilterForwardTo: string = '';

  showCreateDialog = false;
  showEditDialog = false;
  editingFilter: Filter | null = null;

  constructor(
    private filterService: FilterService,
    private folderService: FolderService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadFilters();
    this.loadFolders();
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.openCreateDialogFromSearch(params);
      }
    });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
  addCondition() {
    this.conditions.push({ field: 'subject', operator: 'contains', value: '' });
    // Force all text conditions to use 'contains' when multiple exist
    const textConditions = this.conditions.filter(c =>
      c.field !== 'priority' && c.field !== 'hasAttachment'
    );
    if (textConditions.length > 1) {
      textConditions.forEach(c => c.operator = 'contains');
    }
  }

  onFieldChange(condition: FilterCondition) {
    condition.value = '';
  }

  getTextConditionsCount(): number {
    return this.conditions.filter(c =>
      c.field !== 'priority' && c.field !== 'hasAttachment'
    ).length;
  }

  hasPriorityCondition(): boolean {
    return this.conditions.some(c => c.field === 'priority');
  }

  hasAttachmentCondition(): boolean {
    return this.conditions.some(c => c.field === 'hasAttachment');
  }

  getPriorityCondition(): FilterCondition {
    let condition = this.conditions.find(c => c.field === 'priority');
    if (!condition) {
      condition = { field: 'priority', operator: 'equals', value: '3' };
      this.conditions.push(condition);
    }
    return condition;
  }

  getAttachmentCondition(): FilterCondition {
    let condition = this.conditions.find(c => c.field === 'hasAttachment');
    if (!condition) {
      condition = { field: 'hasAttachment', operator: 'equals', value: 'true' };
      this.conditions.push(condition);
    }
    return condition;
  }

  togglePriorityCondition(event: any) {
    const checked = event.target.checked;
    if (checked) {
      if (!this.hasPriorityCondition()) {
        this.conditions.push({ field: 'priority', operator: 'equals', value: '3' });
      }
    } else {
      this.conditions = this.conditions.filter(c => c.field !== 'priority');
    }
  }

  toggleAttachmentCondition(event: any) {
    if (this.hasAttachmentCondition()) {
      this.conditions = this.conditions.filter(c => c.field !== 'hasAttachment');
    } else {
      this.conditions.push({ field: 'hasAttachment', operator: 'equals', value: 'true' });
    }
  }

  removeCondition(index: number) {
    if (this.conditions.length > 1) {
      this.conditions.splice(index, 1);
    }
  }
  isValid(): boolean {
    const hasValidConditions = this.conditions.some(c => c.value && c.value.trim() !== '');
    const hasValidAction =
      (this.newFilterAction === 'move' && this.newFilterActionValue && this.newFilterActionValue.trim() !== '') ||
      (this.newFilterAction === 'forward' && this.newFilterForwardTo && this.newFilterForwardTo.trim() !== '') ||
      (this.newFilterAction !== 'move' && this.newFilterAction !== 'forward');
    const hasValidName = !!(this.newFilterName && this.newFilterName.trim() !== '');

    return hasValidConditions && hasValidAction && hasValidName;
  }
  openCreateDialogFromSearch(params: any) {
    this.newFilterName = '';
    this.newFilterAction = 'move';
    this.newFilterActionValue = '';
    this.newFilterForwardTo = '';
    this.conditions = [];

    if (params['from']) {
      this.conditions.push({ field: 'from', operator: 'contains', value: params['from'] });
      if (!this.newFilterName) this.newFilterName = 'From: ' + params['from'];
    }
    if (params['receiver']) {
      this.conditions.push({ field: 'to', operator: 'contains', value: params['receiver'] });
      if (!this.newFilterName) this.newFilterName = 'To: ' + params['receiver'];
    }
    if (params['subject']) {
      this.conditions.push({ field: 'subject', operator: 'contains', value: params['subject'] });
      if (!this.newFilterName) this.newFilterName += (this.newFilterName ? ' + ' : '') + 'Subject: ' + params['subject'];
    }
    if (params['body']) {
      this.conditions.push({ field: 'body', operator: 'contains', value: params['body'] });
    }
    if (params['priority']) {
      this.conditions.push({ field: 'priority', operator: 'equals', value: params['priority'] });
    }
    if (params['hasAttachment']) {
      this.conditions.push({ field: 'hasAttachment', operator: 'equals', value: 'true' });
    }
    if (this.conditions.length === 0) {
      this.addCondition();
    }


    setTimeout(() => {
      this.showCreateDialog = true;
      this.router.navigate([], {
        queryParams: { create: null, from: null, receiver: null, subject: null, body: null },
        queryParamsHandling: 'merge'
      });
    }, 0);
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
    this.conditions = [];
    this.addCondition(); // Start with 1
    this.newFilterAction = 'move';
    this.newFilterActionValue = '';
    this.newFilterForwardTo = '';
    this.showCreateDialog = true;
  }


  closeCreateDialog() {
    this.showCreateDialog = false;
    this.resetForm();
  }
  closeEditDialog() { this.showEditDialog = false; this.resetForm(); }

  private resetForm() {
    this.newFilterName = '';
    this.newFilterAction = 'move';
    this.newFilterActionValue = '';
    this.newFilterForwardTo = '';
    this.conditions = [];
    this.editingFilter = null;
  }


  saveFilter() {
    const validConditions = this.conditions.filter(c => c.value.trim() !== '');
    if (validConditions.length === 0) return;

    let filterToSave: Filter;

    if (validConditions.length === 1) {
      const c = validConditions[0];
      filterToSave = {
        name: this.newFilterName || `${c.field} ${c.operator} ${c.value}`,
        property: c.field,
        matcher: c.operator,
        value: c.value,
        action: this.newFilterAction,
        newFolder: this.newFilterAction === 'move' ? this.newFilterActionValue : undefined,
        forwardedTo: this.newFilterAction === 'forward' ? this.newFilterForwardTo.split(',').map(e => e.trim()) : undefined
      };
    } else {
      //complex
      // Format: "from:bob;subject:hi"
      const packedValue = validConditions
        .map(c => `${c.field}:${c.value}`)
        .join(';');

      filterToSave = {
        name: this.newFilterName || 'Complex Rule',
        property: 'composite',
        matcher: 'complex', //backend to split by ';'
        value: packedValue,
        action: this.newFilterAction,
        newFolder: this.newFilterAction === 'move' ? this.newFilterActionValue : undefined,
        forwardedTo: this.newFilterAction === 'forward' ? this.newFilterForwardTo.split(',').map(e => e.trim()) : undefined
      };
    }

    this.filterService.addFilter(filterToSave).subscribe({
      next: (savedFilter) => {
        this.existingRules.push(savedFilter);
        this.closeCreateDialog();
        this.cdr.detectChanges();
        console.log(savedFilter);
      },
      error: (error) => alert('Failed: ' + error.message)
    });
  }

  editFilter(filter: Filter) {
    this.editingFilter = filter;
    this.newFilterName = filter.name || '';
    this.newFilterAction = filter.action;
    this.newFilterActionValue = filter.newFolder || '';
    this.newFilterForwardTo = filter.forwardedTo ? filter.forwardedTo.join(', ') : '';

    this.conditions = [];

    if (filter.property === 'composite' && filter.matcher === 'complex') {
      // unpack: "from:bob;subject:hi"
      const parts = filter.value.split(';');
      parts.forEach(part => {
        const [key, val] = part.split(':');
        if (key && val) {
          this.conditions.push({ field: key, operator: 'contains', value: val });
        }
      });
    } else {
      //standard single rule
      this.conditions.push({
        field: filter.property,
        operator: filter.matcher,
        value: filter.value
      });
    }

    this.showEditDialog = true;
  }

  updateFilter() {
    const validConditions = this.conditions.filter(c => c.value.trim() !== '');
    if (validConditions.length === 0) return;

    let filterToSave: Filter;

    if (validConditions.length === 1) {
      const c = validConditions[0];
      filterToSave = {
        name: this.newFilterName,
        property: c.field,
        matcher: c.operator,
        value: c.value,
        action: this.newFilterAction,
        newFolder: this.newFilterAction === 'move' ? this.newFilterActionValue : undefined,
        forwardedTo: this.newFilterAction === 'forward' ? this.newFilterForwardTo.split(',').map(e => e.trim()) : undefined
      };
    } else {
      const packedValue = validConditions.map(c => `${c.field}:${c.value}`).join(';');
      filterToSave = {
        name: this.newFilterName,
        property: 'composite',
        matcher: 'complex',
        value: packedValue,
        action: this.newFilterAction,
        newFolder: this.newFilterAction === 'move' ? this.newFilterActionValue : undefined,
        forwardedTo: this.newFilterAction === 'forward' ? this.newFilterForwardTo.split(',').map(e => e.trim()) : undefined
      };
    }

    this.filterService.updateFilter(this.editingFilter!.id!, filterToSave).subscribe({
      next: (result) => {
        const index = this.existingRules.findIndex(f => f.id === this.editingFilter!.id);
        if (index !== -1) {
          this.existingRules[index] = { ...filterToSave, id: this.editingFilter!.id };
        }
        console.log(filterToSave)
        this.closeEditDialog();
        this.cdr.detectChanges();
      },
      error: (error) => alert('Failed: ' + error.message)
    });
  }

  async deleteFilter(filter: Filter) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Filter',
      message: `Delete filter for "${filter.property} ${filter.matcher} ${filter.value}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'warning'
    });

    if (confirmed) {
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

  getFilterCondition(filter: Filter) {
    if (filter.property === 'composite') {
      return filter.value.split(';').join(' AND ');
    }
    return `${filter.property} ${filter.matcher} ${filter.value}`;
  }

  getFilterAction(filter: Filter): string {
    if (filter.action === 'move' && filter.newFolder) {
      return `Move to: ${filter.newFolder}`;
    }
    if (filter.action === 'forward' && filter.forwardedTo) {
      return `Forward to: ${filter.forwardedTo.join(', ')}`;
    }
    return filter.action;
  }
}
