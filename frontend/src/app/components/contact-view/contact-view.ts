import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactList } from '../../features/contact/components/contact-list/contact-list';
import { ContactDialogComponent } from '../../features/contact/components/contact-dialog/contact-dialog';


@Component({
  selector: 'app-contact-view',
  standalone: true,
  imports: [CommonModule, ContactList, ContactDialogComponent],
  templateUrl: './contact-view.html'
})
export class ContactViewComponent {}
