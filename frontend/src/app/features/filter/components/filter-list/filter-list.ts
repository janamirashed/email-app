import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterRule } from '../../../../core/models/filter.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-list.html',
})
export class FilterListComponent {
  // Dummy data for existing rules
  existingRules: FilterRule[] = [
    { id: 1, name: 'Work Project Emails', condition: 'From: design@company.com', action: 'Move to: Projects' },
    { id: 2, name: 'Newsletter Subscriptions', condition: "Subject contains: 'Newsletter'", action: 'Mark as read' },
    { id: 3, name: 'Important Invoices', condition: 'Has attachment: .pdf', action: 'Star & Move to: Finances' },
  ];

  // Form inputs for new filter
  newFilterConditionField: string = 'Subject';
  newFilterConditionOperator: string = 'contains';
  newFilterConditionValue: string = '';

  newFilterAction: string = 'Move to folder';
  newFilterActionValue: string = '';

  showCreateDialog = false;

  openCreateDialog() {
    this.newFilterConditionField = 'Subject';
    this.newFilterConditionOperator = 'contains';
    this.newFilterConditionValue = '';
    this.newFilterAction = 'Move to folder';
    this.newFilterActionValue = '';
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  saveFilter() {
    if (this.newFilterConditionValue.trim()) {
      const newFilter: FilterRule = {
        id: Date.now(),
        name: `${this.newFilterConditionField} ${this.newFilterConditionOperator} ${this.newFilterConditionValue}`,
        condition: `${this.newFilterConditionField} ${this.newFilterConditionOperator}: ${this.newFilterConditionValue}`,
        action: this.newFilterAction === 'Move to folder'
          ? `Move to: ${this.newFilterActionValue}`
          : this.newFilterAction
      };
      this.existingRules.push(newFilter);
      this.closeCreateDialog();
      console.log('Created filter:', newFilter);
    }
  }

  editFilter(filter: FilterRule) {
    console.log('Edit filter:', filter);
    // TODO: Implement edit dialog
  }

  deleteFilter(filter: FilterRule) {
    if (confirm(`Delete filter "${filter.name}"?`)) {
      this.existingRules = this.existingRules.filter(f => f.id !== filter.id);
      console.log('Deleted filter:', filter.name);
    }
  }
}