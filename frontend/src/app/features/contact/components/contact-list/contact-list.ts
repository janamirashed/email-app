import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../core/models/contact.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-list.html',
})
export class ContactListComponent {
  searchTerm: string = '';
  sortBy: 'Name' | 'Email' | 'Date Added' = 'Name';
  showAddDialog = false;
  showEditDialog = false;
  editingContact: Contact | null = null;
  newContactName = '';
  newContactEmail = '';

  // Dummy contact data
  contacts: Contact[] = [
    { id: 1, name: 'Aria Patel', email: 'aria.patel@example.com' },
    { id: 2, name: 'Ben Carter', email: 'ben.carter@example.com' },
    { id: 3, name: 'Chloe Davis', email: 'chloe.davis@example.com' },
    { id: 4, name: 'David Evans', email: 'david.evans@example.com' },
  ];

  onSort(criteria: 'Name' | 'Email' | 'Date Added') {
    this.sortBy = criteria;
    // Implement actual sorting logic here
  }

  addContact() {
    this.newContactName = '';
    this.newContactEmail = '';
    this.showAddDialog = true;
  }

  saveNewContact() {
    if (this.newContactName.trim() && this.newContactEmail.trim()) {
      const newContact: Contact = {
        id: Date.now(),
        name: this.newContactName.trim(),
        email: this.newContactEmail.trim()
      };
      this.contacts.push(newContact);
      this.showAddDialog = false;
      this.newContactName = '';
      this.newContactEmail = '';
      console.log('Created contact:', newContact);
    }
  }

  editContact(contact: Contact) {
    this.editingContact = { ...contact };
    this.newContactName = contact.name;
    this.newContactEmail = contact.email;
    this.showEditDialog = true;
  }

  saveEditContact() {
    if (this.editingContact && this.newContactName.trim() && this.newContactEmail.trim()) {
      const index = this.contacts.findIndex(c => c.id === this.editingContact!.id);
      if (index !== -1) {
        this.contacts[index].name = this.newContactName.trim();
        this.contacts[index].email = this.newContactEmail.trim();
        this.showEditDialog = false;
        this.editingContact = null;
        this.newContactName = '';
        this.newContactEmail = '';
        console.log('Updated contact');
      }
    }
  }

  deleteContact(contact: Contact) {
    if (confirm(`Delete contact ${contact.name}?`)) {
      this.contacts = this.contacts.filter(c => c.id !== contact.id);
      console.log('Deleted contact:', contact.name);
    }
  }

  cancelDialog() {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.editingContact = null;
    this.newContactName = '';
    this.newContactEmail = '';
  }
}