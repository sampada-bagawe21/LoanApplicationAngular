import { Component } from '@angular/core';
import { EmpServices } from '../emp-services';
import { CommonModule } from '@angular/common';


@Component({
  imports: [CommonModule],
  selector: 'app-api',
  styleUrl: './api.scss',
  templateUrl: './api.html',
})
export class Api {
  constructor(private service:EmpServices)
  {
    this.getAllEmp();
  }

  allemps:any;
  getAllEmp()
  {
    this.service.getEmployees().subscribe({
      next:res=>{
        console.log(res);
        this.allemps=res.data.data;
      },

      error:err=>{
        console.log(err);
      }
    });
  }
}
