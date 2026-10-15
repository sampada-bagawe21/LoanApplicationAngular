import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerKycReview } from './officer-kyc-review';

describe('OfficerKycReview', () => {
  let component: OfficerKycReview;
  let fixture: ComponentFixture<OfficerKycReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerKycReview],
    }).compileComponents();

    fixture = TestBed.createComponent(OfficerKycReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
