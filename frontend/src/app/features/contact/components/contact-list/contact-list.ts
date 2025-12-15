import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../core/models/contact.model';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../../core/services/contact.service';
import { EmailComposeService } from '../../../../core/services/email-compose.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-list.html',
})
export class ContactList implements OnInit {
  searchTerm: string = '';
  sortBy: 'name' | 'email' | 'date' = 'name';
  showAddDialog = false;
  showEditDialog = false;
  editingContact: Contact | null = null;
  newContactName = '';
  newContactEmail = '';

  // State management
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
    private composeService: EmailComposeService
  ) { }

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.listContacts(this.sortBy).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.filteredContacts = contacts;
        this.isLoading = false;
        this.applySearch();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.errorMessage = 'Failed to load contacts. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();

      }
    });
  }

  applySearch() {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = this.contacts;
      return;
    }

    const keyword = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(keyword) ||
      contact.email.toLowerCase().includes(keyword)
    );
  }

  onSearchChange() {
    this.applySearch();
  }

  onSort(criteria: 'name' | 'email' | 'date') {
    this.sortBy = criteria;
    this.loadContacts();
  }

  addContact() {
    this.newContactName = '';
    this.newContactEmail = '';
    this.showAddDialog = true;
  }

  saveNewContact() {
    if (this.newContactName.trim() && this.newContactEmail.trim()) {
      this.isLoading = true;
      this.errorMessage = '';

      const newContact: Contact = {
        id: null,
        name: this.newContactName.trim(),
        email: this.newContactEmail.trim()
      };

      this.contactService.addContact(newContact).subscribe({
        next: (contact) => {
          this.contacts.push(contact);
          this.applySearch();
          this.showAddDialog = false;
          this.newContactName = '';
          this.newContactEmail = '';
          this.isLoading = false;
          this.showSuccess('Contact added successfully');
          console.log('Created contact:', contact);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error adding contact:', error);
          this.errorMessage = error.error?.error || 'Failed to add contact. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();

        }
      });
    }
  }

  editContact(contact: Contact) {
    this.editingContact = { ...contact };
    this.newContactName = contact.name;
    this.newContactEmail = contact.email;
    this.showEditDialog = true;
  }

  // Open compose email with contact's email pre-filled
  composeEmailTo(contact: Contact, event?: Event) {
    // Prevent event bubbling if this was triggered by a click
    if (event) {
      event.stopPropagation();
    }

    this.composeService.openCompose({
      recipients: contact.email
    });
  }

  saveEditContact() {
    if (this.editingContact && this.newContactName.trim() && this.newContactEmail.trim()) {
      // Validate that contact has an ID
      if (!this.editingContact.id) {
        this.errorMessage = 'Cannot update contact: Invalid contact ID';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      const updatedContact: Contact = {
        ...this.editingContact,
        name: this.newContactName.trim(),
        email: this.newContactEmail.trim()
      };

      this.contactService.updateContact(this.editingContact.id, updatedContact).subscribe({
        next: (contact) => {
          const index = this.contacts.findIndex(c => c.id === this.editingContact!.id);
          if (index !== -1) {
            this.contacts[index] = contact;
            this.applySearch();
          }
          this.showEditDialog = false;
          this.editingContact = null;
          this.newContactName = '';
          this.newContactEmail = '';
          this.isLoading = false;
          this.showSuccess('Contact updated successfully');
          console.log('Updated contact:', contact);
          this.cdr.detectChanges();

        },
        error: (error) => {
          console.error('Error updating contact:', error);
          this.errorMessage = error.error?.error || 'Failed to update contact. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();

        }
      });
    }
  }

  deleteContact(contact: Contact) {
    // Validate that contact has an ID
    if (!contact.id) {
      this.errorMessage = 'Cannot delete contact: Invalid contact ID';
      return;
    }

    if (confirm(`Delete contact ${contact.name}?`)) {
      this.isLoading = true;
      this.errorMessage = '';

      this.contactService.deleteContact(contact.id).subscribe({
        next: () => {
          this.contacts = this.contacts.filter(c => c.id !== contact.id);
          this.applySearch();
          this.isLoading = false;
          this.showSuccess('Contact deleted successfully');
          console.log('Deleted contact:', contact.name);
          this.cdr.detectChanges();

        },
        error: (error) => {
          console.error('Error deleting contact:', error);
          this.errorMessage = error.error?.error || 'Failed to delete contact. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();

        }
      });
    }
  }

  cancelDialog() {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.editingContact = null;
    this.newContactName = '';
    this.newContactEmail = '';
    this.errorMessage = '';
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  dismissError() {
    this.errorMessage = '';
  }

  dismissSuccess() {
    this.successMessage = '';
  }
}
