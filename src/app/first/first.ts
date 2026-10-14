import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-first',
  styleUrl: './first.scss',
  templateUrl: './first.html',
})
export class First {
  name="Sampada";

  arr=[1,2,3]


  obj={id :101,
        name : 'Sampada',
        salary : 100000
      }


    arrobj=[
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'},
      {      id: 101,name:'khushi'}
    ] 
}
