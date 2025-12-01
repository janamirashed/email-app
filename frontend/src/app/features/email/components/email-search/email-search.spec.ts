import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSearch } from './email-search';

describe('EmailSearch', () => {
  let component: EmailSearch;
  let fixture: ComponentFixture<EmailSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
