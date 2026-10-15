import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerKyc } from './officer-kyc';

describe('OfficerKyc', () => {
  let component: OfficerKyc;
  let fixture: ComponentFixture<OfficerKyc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerKyc],
    }).compileComponents();

    fixture = TestBed.createComponent(OfficerKyc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
