
import { Component } from '@angular/core';
import { LoanDeal } from '../loan-deal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-apply-loan',
  styleUrl: './apply-loan.scss',
  templateUrl: './apply-loan.html',
})
export class ApplyLoan {

  constructor(private services: LoanDeal) 
  {
    
  }

  applyforLoan(data: any) {
    data.customerId = 1; 
    console.log('Form Data:', data);

    this.services.applyLoans(data).subscribe({
      next: (res: any) => {
        console.log('Success:', res);
        alert('Loan application submitted successfully!');
      },
      error: (err: any) => {
        console.error('API Error:', err);
        alert(err.error?.message || 'Loan application failed.');
      }
    });
  }
}
