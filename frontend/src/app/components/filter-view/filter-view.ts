import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterListComponent } from '../../features/filter/components/filter-list/filter-list';
import { FilterDialogComponent } from '../../features/filter/components/filter-dialog/filter-dialog';


@Component({
  selector: 'app-filter-view',
  standalone: true,
  imports: [CommonModule, FilterListComponent, FilterDialogComponent],
  templateUrl: './filter-view.html'
})
export class FilterViewComponent {}