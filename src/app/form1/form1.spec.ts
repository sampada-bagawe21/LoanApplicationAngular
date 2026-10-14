import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Form1 } from './form1';

describe('Form1', () => {
  let component: Form1;
  let fixture: ComponentFixture<Form1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Form1],
    }).compileComponents();

    fixture = TestBed.createComponent(Form1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
