import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterList } from './filter-list';

describe('FilterList', () => {
  let component: FilterList;
  let fixture: ComponentFixture<FilterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
