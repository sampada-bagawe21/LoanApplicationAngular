import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  selector: 'app-form2',
  styleUrl: './form2.scss',
  templateUrl: './form2.html',
})
export class Form2 {
  emps=new FormGroup({
    ename : new FormControl(),
    econ : new FormControl(),
    email : new FormControl(),
  })

  getdata(data:any)
  {
    console.log(data);
  }
}
