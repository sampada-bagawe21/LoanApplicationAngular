import { TestBed } from '@angular/core/testing';
import { LoanDeal } from './loan-deal';

describe('LoanDeal', () => {
  let service: LoanDeal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanDeal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
