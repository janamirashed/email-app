import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../../core/models/contact.model';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ContactService } from '../../../../core/services/contact.service';
import { EmailComposeService } from '../../../../core/services/email-compose.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-list.html',
})
export class ContactList implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchIn: string = 'all';
  sortBy: 'name' | 'date' = 'name';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  showAddDialog = false;
  showEditDialog = false;
  editingContact: Contact | null = null;
  newContactName = '';
  newContactEmails: string[] = [''];

  // State management
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private contactService: ContactService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private composeService: EmailComposeService,
    private emailService: EmailService
  ) { }

  ngOnInit() {
    this.loadContacts();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(keyword => {
      this.executeSearch(keyword);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts() {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.listContacts(this.sortBy).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.filteredContacts = contacts;
        this.isLoading = false;
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

  executeSearch(keyword: string) {
    if (!keyword.trim()) {
      this.loadContacts();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.searchContacts(keyword, this.searchIn, this.sortBy).subscribe({
      next: (results) => {
        this.contacts = results;
        this.filteredContacts = results;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching contacts:', error);
        this.errorMessage = 'Search failed. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refreshData() {
    if (this.searchTerm.trim()) {
      this.executeSearch(this.searchTerm);
    } else {
      this.loadContacts();
    }
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  onSort(criteria: 'name' | 'date') {
    this.sortBy = criteria;
    this.refreshData();
  }

  addContact() {
    this.newContactName = '';
    this.newContactEmails = [''];
    this.showAddDialog = true;
  }

  addEmailField() {
    this.newContactEmails.push('');
  }

  removeEmailField(index: number) {
    if (this.newContactEmails.length > 1) {
      this.newContactEmails.splice(index, 1);
    }
  }

  // Track by function for ngFor with primitive arrays
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  saveNewContact() {
    // const validEmails = this.newContactEmails.map(e => e.trim()).filter(e => this.emailService.isValidEmail(e));

    if (!this.newContactEmails.length) {
      this.errorMessage = 'At least one email is required';
      this.cdr.detectChanges();
      return;
    }

    const validEmails = this.emailService.ensureValidEmails(this.newContactEmails);
    if (!validEmails) {
      this.errorMessage = 'Invalid email format';
      this.cdr.detectChanges();
      return;
    }

    if (!this.newContactName.trim()) {
      this.errorMessage = 'Name is required';
      this.cdr.detectChanges();
      return;
    }


    this.isLoading = true;
    this.errorMessage = '';

    const newContact: Contact = {
      id: null,
      name: this.newContactName.trim(),
      email: this.newContactEmails
    };

    this.contactService.addContact(newContact).subscribe({
      next: (contact) => {
        this.showAddDialog = false;
        this.newContactName = '';
        this.newContactEmails = [''];
        this.isLoading = false;
        this.showSuccess('Contact added successfully');
        this.refreshData();
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

  editContact(contact: Contact) {

    if (!contact.email.length) {
      this.errorMessage = 'At least one email is required';
      this.cdr.detectChanges();
      return;
    }

    const validEmails = this.emailService.ensureValidEmails(contact.email);
    if (!validEmails) {
      this.errorMessage = 'Invalid email format';
      this.cdr.detectChanges();
      return;
    }

    if (!contact.name.trim()) {
      this.errorMessage = 'Name is required';
      this.cdr.detectChanges();
      return;
    }


    this.editingContact = { ...contact };
    this.newContactName = contact.name;
    this.newContactEmails = contact.email && contact.email.length > 0 ? [...contact.email] : [''];


    this.showEditDialog = true;
  }

  showEmailSelectionDialog = false;
  selectedContactForEmail: Contact | null = null;

  // Open compose email with contact's email pre-filled
  composeEmailTo(contact: Contact, event?: Event) {
    // Prevent event bubbling if this was triggered by a click
    if (event) {
      event.stopPropagation();
    }

    if (contact.email && contact.email.length > 1) {
      this.selectedContactForEmail = contact;
      this.showEmailSelectionDialog = true;
    } else if (contact.email && contact.email.length === 1) {
      this.composeService.openCompose({
        recipients: contact.email[0]
      });
    }
  }

  selectEmail(email: string) {
    this.showEmailSelectionDialog = false;
    this.selectedContactForEmail = null;
    this.composeService.openCompose({
      recipients: email
    });
  }

  cancelEmailSelection() {
    this.showEmailSelectionDialog = false;
    this.selectedContactForEmail = null;
  }

  saveEditContact() {
    const validEmails = this.newContactEmails.map(e => e.trim()).filter(e => e.length > 0);

    if (this.editingContact && this.newContactName.trim() && validEmails.length > 0) {
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
        email: validEmails
      };

      this.contactService.updateContact(this.editingContact.id, updatedContact).subscribe({
        next: (contact) => {
          this.showEditDialog = false;
          this.editingContact = null;
          this.newContactName = '';
          this.newContactEmails = [''];
          this.isLoading = false;
          this.showSuccess('Contact updated successfully');
          this.refreshData();
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

  async deleteContact(contact: Contact) {
    // Validate that contact has an ID
    if (!contact.id) {
      this.errorMessage = 'Cannot delete contact: Invalid contact ID';
      return;
    }

    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Contact',
      message: `Delete contact ${contact.name}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'warning'
    });

    if (confirmed) {
      this.isLoading = true;
      this.errorMessage = '';

      this.contactService.deleteContact(contact.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.showSuccess('Contact deleted successfully');
          this.refreshData();
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
    this.newContactEmails = [''];
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
