import { TestBed } from '@angular/core/testing';
import { CibilApi } from './cibil-api';

describe('CibilApi', () => {
  let service: CibilApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CibilApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
