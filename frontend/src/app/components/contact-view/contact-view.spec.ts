import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactView } from './contact-view';

describe('ContactView', () => {
  let component: ContactView;
  let fixture: ComponentFixture<ContactView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
