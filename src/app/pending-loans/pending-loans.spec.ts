import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingLoans } from './pending-loans';

describe('PendingLoans', () => {
  let component: PendingLoans;
  let fixture: ComponentFixture<PendingLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingLoans],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingLoans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
