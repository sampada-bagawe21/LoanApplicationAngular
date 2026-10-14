import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-third',
  styleUrl: './third.scss',
  templateUrl: './third.html',
})
export class Third {
 
  col:any;
  mydata:any;
  getdata( name:any)
  {
    this.mydata=name;
  }



  fno: any;
  sno:any;
  choise:any;
  res : any;

  Calci()
  {
    if(this.choise=='+')
    {
      this.res=this.fno+this.sno;
    }

    else if(this.choise=='-')
    {
       this.res=this.fno-this.sno;
    }
    else 
    {
       this.res=this.fno*this.sno;
    }
  }
}
