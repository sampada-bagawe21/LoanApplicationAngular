import { ChangeDetectorRef, Component } from '@angular/core';
import { PenaltychargeService } from '../penaltycharge-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
declare var $:any;

@Component({
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  selector: 'app-penaltycharges',
  styleUrl: './penaltycharges.scss',
  templateUrl: './penaltycharges.html',
})
export class Penaltycharges {
  constructor(private service:PenaltychargeService,private cd:ChangeDetectorRef){
    this.getAllPenalty();
  }

  allpenalties:any;
  getAllPenalty(){
    this.service.getAllPenalty().subscribe({
      next:res=>{
        console.log(res);
        this.allpenalties=res;
        this.cd.detectChanges();
      },
      error:err=>{
        console.log(err);
      }
    })
  }

loanAccountId: number = 0;
emiScheduleId: number = 0;
penaltyType: string = 'Late Fees';
applying: boolean = false;

ResetPenalty(loanAccountId: number, emiScheduleId: number) {
  this.loanAccountId = loanAccountId;
  this.emiScheduleId = emiScheduleId;
  this.penaltyType = 'Late Fees';

  $("#exampleModal").modal('show');
}

ApplyPenalty() {
  const data = {
    loanAccountId: this.loanAccountId,
    emiScheduleId: this.emiScheduleId,
    penaltyType: this.penaltyType
  };

  this.applying = true;

  this.service.ApplyPenalty(data).subscribe({
    next: res => {
  alert(res.message);
  this.applying = false;

  $("#exampleModal").modal('hide');

  this.getAllPenalty();
},
    error: err => {
      console.log(err);
    }
  });
}
}
