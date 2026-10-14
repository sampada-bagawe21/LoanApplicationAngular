import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Png } from './png';

describe('Png', () => {
  let component: Png;
  let fixture: ComponentFixture<Png>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Png],
    }).compileComponents();

    fixture = TestBed.createComponent(Png);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
