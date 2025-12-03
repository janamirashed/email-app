import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderView } from './folder-view';

describe('FolderView', () => {
  let component: FolderView;
  let fixture: ComponentFixture<FolderView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
