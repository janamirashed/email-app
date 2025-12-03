import { Routes } from '@angular/router';
import { EmailListComponent } from './features/email/components/email-list/email-list';
import { EmailTrashComponent } from './features/email/components/email-trash/email-trash';
import { FolderViewComponent } from './components/folder-view/folder-view';
import { ContactViewComponent } from './components/contact-view/contact-view';
import { FilterViewComponent } from './components/filter-view/filter-view';
export const routes: Routes = [
  { path: '', redirectTo: 'inbox', pathMatch: 'full' },
  { path: 'inbox', component: EmailListComponent },
  { path: 'starred', component: EmailListComponent },
  { path: 'sent', component: EmailListComponent },
  { path: 'drafts', component: EmailListComponent },
  { path: 'trash', component: EmailTrashComponent },
  
  // Split view routes
  { path: 'folders', component: FolderViewComponent },
  { path: 'contacts', component: ContactViewComponent },
  { path: 'filters', component: FilterViewComponent },
];