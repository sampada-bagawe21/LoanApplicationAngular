
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { eligibilityapiService } from '../../services/eligibility-api';

@Component({
  imports: [CommonModule],
  selector: 'app-scorecard',
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.scss'
})
export class Scorecard {

  constructor(
    private service: eligibilityapiService,
    private cd: ChangeDetectorRef
  )
  {
    this.getAllCustomers();
  }

  allCustomers: any[] = [];
  scorecard: any = null;
  loading = false;
  selectedCustomerId: number | null = null;
  errorMessage = '';

  getAllCustomers()
  {
    this.service.getAllCustomers().subscribe({
      next: res => {
        console.log('Customers:', res);

        this.allCustomers = res.data ?? [];

        this.cd.detectChanges();
      },
      error: err => {
        console.log(err);

        this.errorMessage =
          err?.error?.message ||
          'Unable to load customers.';

        this.cd.detectChanges();
      }
    });
  }

  ViewScoreCard(customerId: number)
  {
    this.loading = true;
    this.selectedCustomerId = customerId;
    this.scorecard = null;
    this.errorMessage = '';

    this.service.generateScorecard(customerId).subscribe({
      next: res => {
        console.log('ScoreCard:', res);

        this.scorecard = res.data ?? res;
        this.loading = false;

        this.cd.detectChanges();
      },
      error: err => {
        console.log(err);

        this.errorMessage =
          err?.error?.message ||
          `Unable to generate scorecard. HTTP ${err.status}`;

        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  BackToList()
  {
    this.scorecard = null;
    this.selectedCustomerId = null;
    this.errorMessage = '';
  }
}
