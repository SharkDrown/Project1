import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostBorrowedBooksComponent } from './most-borrowed-books.component';

describe('MostBorrowedBooksComponent', () => {
  let component: MostBorrowedBooksComponent;
  let fixture: ComponentFixture<MostBorrowedBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostBorrowedBooksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostBorrowedBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
