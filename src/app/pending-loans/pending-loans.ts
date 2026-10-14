import { Component } from '@angular/core';
import { LoanDeal } from '../loan-deal';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-pending-loans',
  styleUrl: './pending-loans.scss',
  templateUrl: './pending-loans.html',
})
export class PendingLoans {
  constructor(private services:LoanDeal)
  {
       this.getpendingdeals();
  }

  pending: any;

getpendingdeals()
 {
  this.services.getPendingLoans().subscribe({
    next: (res: any) => {
      console.log(res);
      this.pending = res;
    },
    error: (err: any) => {
      console.log(err);
    }
  });
}
}