import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NyanCat } from './nyan-cat';

describe('NyanCat', () => {
  let component: NyanCat;
  let fixture: ComponentFixture<NyanCat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NyanCat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NyanCat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
