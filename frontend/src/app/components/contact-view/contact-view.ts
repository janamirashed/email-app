import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactList } from '../../features/contact/components/contact-list/contact-list';


@Component({
  selector: 'app-contact-view',
  standalone: true,
  imports: [CommonModule, ContactList],
  templateUrl: './contact-view.html'
})
export class ContactViewComponent {}
