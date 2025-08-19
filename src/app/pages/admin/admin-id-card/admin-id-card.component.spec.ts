import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIdCardComponent } from './admin-id-card.component';

describe('AdminIdCardComponent', () => {
  let component: AdminIdCardComponent;
  let fixture: ComponentFixture<AdminIdCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminIdCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIdCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
