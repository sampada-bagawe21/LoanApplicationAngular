import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { KycService } from '../../services/kyc-service';

interface PendingCustomer {
  customerId: number;
  customerName: string;
  email: string;
  mobileNo: string;
}

interface OfficerKycDocument {
  documentId?: number;
  customerId?: number;
  documentType: string;
  fileName: string;
  status: string;
  filePath?: string;
  rejectionReason?: string | null;
}

interface KycApiMessage {
  message?: string;
}

@Component({
  selector: 'app-officer-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-kyc.html',
  styleUrl: './officer-kyc.css',
})
export class OfficerKyc implements OnInit {
  pendingCustomers: PendingCustomer[] = [];
  customerDocuments: OfficerKycDocument[] = [];

  selectedCustomer: PendingCustomer | null = null;

  isLoadingCustomers = false;
  isLoadingDocuments = false;
  isProcessing = false;

  processingCustomerId: number | null = null;

  rejectionReason = '';

  successMessage = '';
  errorMessage = '';

  constructor(
    private kycService: KycService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPendingCustomers();
  }

  // 1. LOAD PENDING CUSTOMERS
  loadPendingCustomers(): void {
    this.isLoadingCustomers = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.kycService
      .getPendingCustomers()
      .pipe(
        finalize(() => {
          this.isLoadingCustomers = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: unknown) => {
          this.pendingCustomers = this.normalizeCustomers(response);

          // Clear a previously selected customer if no longer pending.
          if (
            this.selectedCustomer &&
            !this.pendingCustomers.some(
              (customer) => customer.customerId === this.selectedCustomer?.customerId,
            )
          ) {
            this.selectedCustomer = null;
            this.customerDocuments = [];
            this.rejectionReason = '';
          }

          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 2. NORMALIZE CUSTOMER LIST RESPONSE
  private normalizeCustomers(response: unknown): PendingCustomer[] {
    let items: unknown[] = [];

    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const data = response as Record<string, unknown>;

      const candidate =
        data['customers'] ?? data['pendingCustomers'] ?? data['data'] ?? data['items'];

      if (Array.isArray(candidate)) {
        items = candidate;
      }
    }

    return items
      .map((value) => {
        const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

        const id = Number(
          item['customerId'] ?? item['CustomerId'] ?? item['id'] ?? item['Id'] ?? 0,
        );

        const firstName = String(item['firstName'] ?? item['FirstName'] ?? '');

        const lastName = String(item['lastName'] ?? item['LastName'] ?? '');

        const fullName = String(
          item['customerName'] ??
            item['CustomerName'] ??
            item['fullName'] ??
            item['FullName'] ??
            `${firstName} ${lastName}`.trim(),
        );

        return {
          customerId: id,
          customerName: fullName || `Customer ${id}`,
          email: String(item['email'] ?? item['Email'] ?? ''),
          mobileNo: String(
            item['mobileNo'] ?? item['MobileNo'] ?? item['phone'] ?? item['Phone'] ?? '',
          ),
        };
      })
      .filter((customer) => customer.customerId > 0);
  }

  // 3. SELECT CUSTOMER AND LOAD THEIR DOCUMENTS
  selectCustomer(customer: PendingCustomer): void {
    this.selectedCustomer = customer;
    this.customerDocuments = [];
    this.rejectionReason = '';
    this.successMessage = '';
    this.errorMessage = '';

    this.loadCustomerDocuments(customer.customerId);
  }
  reviewCustomer(customer: PendingCustomer): void {
    void this.router.navigate(['/officer-kyc-review', customer.customerId]);
  }

  // 4. LOAD SELECTED CUSTOMER'S DOCUMENTS
  private loadCustomerDocuments(customerId: number): void {
    this.isLoadingDocuments = true;
    this.cdr.markForCheck();

    this.kycService
      .getCustomerDocuments(customerId)
      .pipe(
        finalize(() => {
          this.isLoadingDocuments = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: unknown) => {
          this.customerDocuments = this.normalizeDocuments(response);

          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 5. NORMALIZE DOCUMENT LIST RESPONSE
  private normalizeDocuments(response: unknown): OfficerKycDocument[] {
    let items: unknown[] = [];

    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const data = response as Record<string, unknown>;

      const candidate = data['documents'] ?? data['data'] ?? data['items'];

      if (Array.isArray(candidate)) {
        items = candidate;
      }
    }

    return items.map((value) => {
      const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

      const filePath = String(item['filePath'] ?? item['FilePath'] ?? '');

      const fileName = String(
        item['fileName'] ?? item['FileName'] ?? filePath.split(/[\\/]/).pop() ?? 'KYC Document',
      );

      return {
        documentId: Number(item['documentId'] ?? item['DocumentId'] ?? 0),
        customerId: Number(item['customerId'] ?? item['CustomerId'] ?? 0),
        documentType: String(item['documentType'] ?? item['DocumentType'] ?? 'KYC Document'),
        fileName,
        filePath,
        status: String(
          item['verificationStatus'] ??
            item['VerificationStatus'] ??
            item['status'] ??
            item['Status'] ??
            'Pending',
        ),
        rejectionReason: (item['rejectionReason'] ?? item['RejectionReason'] ?? null) as
          string | null,
      };
    });
  }

  // 6. VIEW SELECTED CUSTOMER'S DOCUMENT
  viewDocument(document: OfficerKycDocument): void {
    this.errorMessage = '';

    if (!document.documentId) {
      this.errorMessage = 'Document ID is missing.';
      this.cdr.markForCheck();
      return;
    }

    const newTab = window.open('about:blank', '_blank');

    if (!newTab) {
      this.errorMessage = 'Please allow pop-ups to view the document.';
      this.cdr.markForCheck();
      return;
    }

    this.kycService.viewCustomerDocument(document.documentId).subscribe({
      next: (file: Blob) => {
        const fileUrl = URL.createObjectURL(file);
        newTab.location.href = fileUrl;

        window.setTimeout(() => {
          URL.revokeObjectURL(fileUrl);
        }, 60000);
      },

      error: (error: HttpErrorResponse) => {
        newTab.close();
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  // 7. APPROVE SELECTED CUSTOMER'S KYC

  approveCustomer(): void {
    if (!this.selectedCustomer || this.isProcessing) {
      return;
    }

    const customerId = this.selectedCustomer.customerId;

    const documentIds = this.customerDocuments
      .filter((doc) => doc.documentId && doc.status.trim().toLowerCase() === 'pending')
      .map((doc) => doc.documentId as number);

    if (documentIds.length === 0) {
      this.errorMessage = 'No pending documents found.';
      this.cdr.markForCheck();
      return;
    }

    if (!window.confirm('Approve all pending documents for this customer?')) {
      return;
    }

    this.processCustomerAction(
      customerId,
      this.kycService.approveCustomerKyc(customerId, documentIds),
      'KYC approved successfully.',
    );
  }

  // 8. REJECT SELECTED CUSTOMER'S KYC

  rejectCustomer(): void {
    if (!this.selectedCustomer || this.isProcessing) {
      return;
    }

    const reason = this.rejectionReason.trim();

    if (!reason) {
      this.errorMessage = 'Please enter a rejection reason.';
      this.cdr.markForCheck();
      return;
    }

    const customerId = this.selectedCustomer.customerId;

    const documentIds = this.customerDocuments
      .filter((doc) => doc.documentId && doc.status.trim().toLowerCase() === 'pending')
      .map((doc) => doc.documentId as number);

    if (documentIds.length === 0) {
      this.errorMessage = 'No pending documents found.';
      this.cdr.markForCheck();
      return;
    }

    if (!window.confirm('Reject all pending documents for this customer?')) {
      return;
    }

    this.processCustomerAction(
      customerId,
      this.kycService.rejectCustomerKyc(customerId, documentIds, reason),
      'KYC rejected successfully.',
    );
  }

  // 9. PROCESS APPROVE/REJECT RESPONSE
  private processCustomerAction(
    customerId: number,
    request: import('rxjs').Observable<KycApiMessage>,
    defaultMessage: string,
  ): void {
    this.isProcessing = true;
    this.processingCustomerId = customerId;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    request
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.processingCustomerId = null;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response?.message || defaultMessage;

          this.selectedCustomer = null;
          this.customerDocuments = [];
          this.rejectionReason = '';

          this.loadPendingCustomers();
          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 10. STATUS BADGE
  getStatusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return 'bg-success';

      case 'pending':
        return 'bg-warning text-dark';

      case 'rejected':
        return 'bg-danger';

      default:
        return 'bg-secondary';
    }
  }

  // 11. API ERROR MESSAGE
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.title) {
      return error.error.title;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.status === 0) {
      return 'Cannot connect to the API. Check that the backend is running.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'You are not authorized to perform this action.';
    }

    return `Request failed. HTTP Status: ${error.status}`;
  }
}
