import { TestBed } from '@angular/core/testing';
import { PenaltychargeService } from './penaltycharge-service';

describe('PenaltychargeService', () => {
  let service: PenaltychargeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PenaltychargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
