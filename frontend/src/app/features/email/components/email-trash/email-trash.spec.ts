import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTrash } from './email-trash';

describe('EmailTrash', () => {
  let component: EmailTrash;
  let fixture: ComponentFixture<EmailTrash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTrash]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTrash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
