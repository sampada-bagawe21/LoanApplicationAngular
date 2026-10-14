import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Form2 } from './form2';

describe('Form2', () => {
  let component: Form2;
  let fixture: ComponentFixture<Form2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Form2],
    }).compileComponents();

    fixture = TestBed.createComponent(Form2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
