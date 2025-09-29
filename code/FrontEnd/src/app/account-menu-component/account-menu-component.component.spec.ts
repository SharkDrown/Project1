import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMenuComponentComponent } from './account-menu-component.component';

describe('AccountMenuComponentComponent', () => {
  let component: AccountMenuComponentComponent;
  let fixture: ComponentFixture<AccountMenuComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountMenuComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountMenuComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
