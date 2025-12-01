import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterRule } from '../../../../core/models/filter.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-filter-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './filter-list.html',
})
export class FilterListComponent {
  // Dummy data for existing rules (matches image)
  existingRules: FilterRule[] = [
    { id: 1, name: 'Work Project Emails', condition: 'From: design@company.com', action: 'Move to: Projects' },
    { id: 2, name: 'Newsletter Subscriptions', condition: 'Subject contains: \'Newsletter\'', action: 'Mark as read' },
    { id: 3, name: 'Important Invoices', condition: 'Has attachment: .pdf', action: 'Star & Move to: Finances' },
  ];
  
  // Dummy data for new filter inputs
  newFilterConditionField: string = 'Subject';
  newFilterConditionOperator: string = 'contains';
  newFilterConditionValue: string = '';
  
  newFilterAction: string = 'Move to folder';
  newFilterActionValue: string = '';
}