import { Routes } from '@angular/router';
import { EmailListComponent } from './features/email/components/email-list/email-list';
import { EmailTrashComponent } from './features/email/components/email-trash/email-trash';
import { FolderViewComponent } from './components/folder-view/folder-view';
import { ContactViewComponent } from './components/contact-view/contact-view';
import { FilterViewComponent } from './components/filter-view/filter-view';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AuthGuard } from './core/services/auth-gaurd';
import { GuestGuard } from './core/services/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inbox', pathMatch: 'full' },

  // Auth routes (No layout, only for guests)
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), canActivate: [GuestGuard] },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent), canActivate: [GuestGuard] },

  // App routes (With layout)
  {
    path: '',
    component: MainLayoutComponent,
    children: [

      {
        path: 'inbox',
        component: EmailListComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'starred',
        component: EmailListComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'sent',
        component: EmailListComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'drafts',
        component: EmailListComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'trash',
        component: EmailTrashComponent,
        canActivate: [AuthGuard]
      },

      // Split view routes
      {
        path: 'folders',
        component: FolderViewComponent,
        canActivate: [AuthGuard]
      },

      // Dynamic folder route for viewing emails in custom folders
      {
        path: 'folder/:folderName',
        component: EmailListComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'contacts',
        component: ContactViewComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'filters',
        component: FilterViewComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];
