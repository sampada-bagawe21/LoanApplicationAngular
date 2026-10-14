import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule,CommonModule],
  selector: 'app-form1',
  styleUrl: './form1.scss',
  templateUrl: './form1.html',
})
export class Form1 {
  getdata(data:any)
  {
    console.log(data);
  }
}
