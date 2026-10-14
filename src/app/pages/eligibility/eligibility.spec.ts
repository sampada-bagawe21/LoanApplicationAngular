import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Eligibility } from './eligibility';

describe('Eligibility', () => {
  let component: Eligibility;
  let fixture: ComponentFixture<Eligibility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eligibility],
    }).compileComponents();

    fixture = TestBed.createComponent(Eligibility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
