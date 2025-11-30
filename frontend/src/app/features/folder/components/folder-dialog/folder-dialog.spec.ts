import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderDialog } from './folder-dialog';

describe('FolderDialog', () => {
  let component: FolderDialog;
  let fixture: ComponentFixture<FolderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
