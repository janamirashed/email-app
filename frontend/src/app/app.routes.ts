import { Routes } from '@angular/router';
import { EmailListComponent } from './features/email/components/email-list/email-list';
import { EmailTrashComponent } from './features/email/components/email-trash/email-trash';
import { EmailSearchComponent } from './features/email/components/email-search/email-search';
import { FolderViewComponent } from './components/folder-view/folder-view';
import { ContactViewComponent } from './components/contact-view/contact-view';
import { FilterViewComponent } from './components/filter-view/filter-view';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AuthGuard } from './core/services/auth-gaurd';
import { GuestGuard } from './core/services/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inbox', pathMatch: 'full' },

  // Auth routes (No layout, only for guests)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },

  // App routes (With layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inbox',
        component: EmailListComponent,
      },
      {
        path: 'starred',
        component: EmailListComponent,
      },
      {
        path: 'sent',
        component: EmailListComponent,
      },
      {
        path: 'drafts',
        component: EmailListComponent,
      },
      {
        path: 'trash',
        component: EmailTrashComponent,
      },
      {
        path: 'search',
        component: EmailSearchComponent,
      },
      {
        path: 'folders',
        component: FolderViewComponent,
      },
      {
        path: 'contacts',
        component: ContactViewComponent,
      },
      {
        path: 'filters',
        component: FilterViewComponent,
      },
      // Custom folder route
      {
        path: 'folder/:folderName',
        component: EmailListComponent,
      }
    ]
  }
];
