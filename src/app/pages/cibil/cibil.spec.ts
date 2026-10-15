import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cibil } from './cibil';

describe('Cibil', () => {
  let component: Cibil;
  let fixture: ComponentFixture<Cibil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cibil],
    }).compileComponents();

    fixture = TestBed.createComponent(Cibil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
