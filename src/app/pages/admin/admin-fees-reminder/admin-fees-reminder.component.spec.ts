import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeesReminderComponent } from './admin-fees-reminder.component';

describe('AdminFeesReminderComponent', () => {
  let component: AdminFeesReminderComponent;
  let fixture: ComponentFixture<AdminFeesReminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminFeesReminderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFeesReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
