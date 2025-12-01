import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDetail } from './email-detail';

describe('EmailDetail', () => {
  let component: EmailDetail;
  let fixture: ComponentFixture<EmailDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
