
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { eligibilityapiService } from '../../services/eligibility-api';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-eligibility',
  templateUrl: './eligibility.html',
  styleUrl: './eligibility.scss'
})
export class Eligibility {

  constructor(
    private service: eligibilityapiService,
    private cd: ChangeDetectorRef
  )
  {
    this.getPendingRequests();
  }

  pendingRequests: any[] = [];
  selectedRequest: any = null;
  selectedEligibilityId: number | null = null;
  remarks = '';
  loading = false;
  decisionLoading = false;
  errorMessage = '';
  successMessage = '';

  getPendingRequests()
  {
    this.loading = true;
    this.errorMessage = '';

    this.service.getPendingRequests().subscribe({
      next: res => {
        console.log('Pending Requests:', res);

        let data = res.data ?? res;

        if (!Array.isArray(data))
        {
          data = data.items ?? data.requests ?? [];
        }

        this.pendingRequests = data.filter((item: any) => {
          const status = String(
            item.eligibilityStatus ?? item.isEligible ?? 'Pending'
          ).toLowerCase();

          return status === 'pending' || status === 'false';
        });

        if (this.selectedEligibilityId)
        {
          this.selectedRequest =
            this.pendingRequests.find(
              x => x.eligibilityId === this.selectedEligibilityId
            ) ?? null;

          if (!this.selectedRequest)
          {
            this.selectedEligibilityId = null;
          }
        }

        this.loading = false;
        this.cd.detectChanges();
      },
      error: err => {
        console.log(err);

        this.errorMessage =
          err?.error?.message ||
          'Unable to load pending eligibility requests.';

        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  SelectRequest()
  {
    this.selectedRequest =
      this.pendingRequests.find(
        x => Number(x.eligibilityId) === Number(this.selectedEligibilityId)
      ) ?? null;

    this.remarks = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  UpdateDecision(approved: boolean)
  {
    if (!this.selectedRequest)
    {
      this.errorMessage = 'Please select a pending customer.';
      return;
    }

    const action = approved ? 'approve' : 'reject';

    if (!confirm(`Are you sure you want to ${action} this application?`))
    {
      return;
    }

    const id = Number(this.selectedRequest.eligibilityId);

    const data = {
      approved: approved,
      remarks: this.remarks.trim() ||
        (approved ? 'Approved by Loan Officer' : 'Rejected by Loan Officer')
    };

    this.decisionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.service.officerDecision(id, data).subscribe({
      next: res => {
        console.log('Officer Decision:', res);

        this.successMessage =
          res.message || `Application ${action}d successfully.`;

        this.selectedRequest = null;
        this.selectedEligibilityId = null;
        this.remarks = '';
        this.decisionLoading = false;

        this.getPendingRequests();
        this.cd.detectChanges();
      },
      error: err => {
        console.log(err);

        this.errorMessage =
          err?.error?.message ||
          `Unable to ${action} the application.`;

        this.decisionLoading = false;
        this.cd.detectChanges();
      }
    });
  }
}
