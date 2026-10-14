import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Third } from './third';

describe('Third', () => {
  let component: Third;
  let fixture: ComponentFixture<Third>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Third],
    }).compileComponents();

    fixture = TestBed.createComponent(Third);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
