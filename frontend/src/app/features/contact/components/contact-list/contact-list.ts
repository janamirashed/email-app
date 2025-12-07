import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../../core/models/contact.model';
import { ContactService } from '../../../../core/services/contact.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-list.html',
})
export class ContactList implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm: string = '';
  sortBy: 'name' | 'email' | 'date' = 'name';
  isLoading = false;

  // For add/edit dialog
  showDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  currentContact: Contact = { id: '', name: '', email: '' };

  // Validation errors
  formErrors = { name: '', email: '' };

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.isLoading = true;
    this.contactService.listContacts(this.sortBy).subscribe({
      next: (response) => {
        this.contacts = response.contacts || [];
        this.filteredContacts = [...this.contacts];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading = false;
      }
    });
  }

  // Search functionality
  onSearchChange() {
    if (this.searchTerm.trim() === '') {
      this.filteredContacts = [...this.contacts];
      return;
    }

    this.contactService.searchContacts(this.searchTerm, 'all', this.sortBy).subscribe({
      next: (response) => {
        this.filteredContacts = response.results || [];
      },
      error: (error) => {
        console.error('Error searching contacts:', error);
      }
    });
  }

  // Sorting
  onSort(criteria: 'name' | 'email' | 'date') {
    this.sortBy = criteria;
    if (this.searchTerm.trim() === '') {
      this.loadContacts();
    } else {
      this.onSearchChange();
    }
  }

  // Open dialog for adding contact
  openAddDialog() {
    this.dialogMode = 'add';
    this.currentContact = { id: '', name: '', email: '' };
    this.formErrors = { name: '', email: '' };
    this.showDialog = true;
  }

  // Open dialog for editing contact
  openEditDialog(contact: Contact) {
    this.dialogMode = 'edit';
    this.currentContact = { ...contact };
    this.formErrors = { name: '', email: '' };
    this.showDialog = true;
  }

  // Close dialog
  closeDialog() {
    this.showDialog = false;
    this.currentContact = { id: '', name: '', email: '' };
    this.formErrors = { name: '', email: '' };
  }

  // Validate form
  validateForm(): boolean {
    let isValid = true;
    this.formErrors = { name: '', email: '' };

    if (!this.currentContact.name.trim()) {
      this.formErrors.name = 'Name is required';
      isValid = false;
    }

    if (!this.currentContact.email.trim()) {
      this.formErrors.email = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.currentContact.email)) {
      this.formErrors.email = 'Invalid email format';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Save contact (add or edit)
  saveContact() {
    if (!this.validateForm()) {
      return;
    }

    if (this.dialogMode === 'add') {
      this.contactService.addContact(this.currentContact).subscribe({
        next: (response) => {
          console.log('Contact added successfully');
          this.closeDialog();
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error adding contact:', error);
          alert('Failed to add contact. Please try again.');
        }
      });
    } else {
      this.contactService.updateContact(this.currentContact.id, this.currentContact).subscribe({
        next: (response) => {
          console.log('Contact updated successfully');
          this.closeDialog();
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error updating contact:', error);
          alert('Failed to update contact. Please try again.');
        }
      });
    }
  }

  // Delete contact
  deleteContact(contact: Contact, event: Event) {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contactService.deleteContact(contact.id).subscribe({
        next: () => {
          console.log('Contact deleted successfully');
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
          alert('Failed to delete contact. Please try again.');
        }
      });
    }
  }
}
