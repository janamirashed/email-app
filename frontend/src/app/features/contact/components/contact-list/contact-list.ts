import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../core/models/contact.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './contact-list.html',
})
export class ContactListComponent {
  searchTerm: string = '';
  sortBy: 'Name' | 'Email' | 'Date Added' = 'Name';
  
  // Dummy contact data (matches image)
  contacts: Contact[] = [
    { id: 1, name: 'Aria Patel', email: 'aria.patel@example.com'},
    { id: 2, name: 'Ben Carter', email: 'ben.carter@example.com'},
    { id: 3, name: 'Chloe Davis', email: 'chloe.davis@example.com'},
    { id: 4, name: 'David Evans', email: 'david.evans@example.com'},
  ];

  onSort(criteria: 'Name' | 'Email' | 'Date Added') {
    this.sortBy = criteria;
    // Implement actual sorting logic here
  }
}