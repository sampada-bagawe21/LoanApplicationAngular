import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Penaltycharges } from './penaltycharges';

describe('Penaltycharges', () => {
  let component: Penaltycharges;
  let fixture: ComponentFixture<Penaltycharges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Penaltycharges],
    }).compileComponents();

    fixture = TestBed.createComponent(Penaltycharges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
