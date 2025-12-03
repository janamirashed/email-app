import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterView } from './filter-view';

describe('FilterView', () => {
  let component: FilterView;
  let fixture: ComponentFixture<FilterView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
