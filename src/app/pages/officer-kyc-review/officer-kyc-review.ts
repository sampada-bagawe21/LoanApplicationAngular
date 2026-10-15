import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { KycService } from '../../services/kyc-service';

interface ReviewDocument {
  documentId: number;
  documentType: string;
  status: string;
  fileName: string;
  filePath?: string;
}

interface KycApiResponse {
  message?: string;
}

@Component({
  selector: 'app-officer-kyc-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-kyc-review.html',
  styleUrl: './officer-kyc-review.css',
})
export class OfficerKycReview implements OnInit {
  customerId = 0;

  documents: ReviewDocument[] = [];
  selectedDocumentIds: number[] = [];

  rejectionReason = '';

  isLoading = false;
  isProcessing = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kycService: KycService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('customerId'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid customer ID.';
      return;
    }

    this.customerId = id;
    this.loadDocuments();
  }

  // 1. LOAD SELECTED CUSTOMER'S DOCUMENTS
  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.kycService
      .getCustomerDocuments(this.customerId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: unknown) => {
          this.documents = this.normalizeDocuments(response);
          this.selectedDocumentIds = [];
          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 2. NORMALIZE BACKEND DOCUMENT RESPONSE
  private normalizeDocuments(response: unknown): ReviewDocument[] {
    let items: unknown[] = [];

    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const data = response as Record<string, unknown>;

      const value = data['documents'] ?? data['data'] ?? data['items'];

      if (Array.isArray(value)) {
        items = value;
      }
    }

    return items
      .map((value): ReviewDocument => {
        const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

        const filePath = String(item['filePath'] ?? item['FilePath'] ?? '');

        const fileName = String(
          item['fileName'] ?? item['FileName'] ?? filePath.split(/[\\/]/).pop() ?? 'KYC Document',
        );

        return {
          documentId: Number(item['documentId'] ?? item['DocumentId'] ?? 0),

          documentType: String(item['documentType'] ?? item['DocumentType'] ?? 'Document'),

          status: String(
            item['verificationStatus'] ??
              item['VerificationStatus'] ??
              item['status'] ??
              item['Status'] ??
              'Pending',
          ),

          fileName,
          filePath,
        };
      })
      .filter((doc) => doc.documentId > 0);
  }

  // 3. CHECK WHETHER A DOCUMENT CAN BE REVIEWED
  isPending(status: string): boolean {
    return status.trim().toLowerCase() === 'pending';
  }

  // 4. SELECT OR DESELECT ONE DOCUMENT
  toggleDocument(documentId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const document = this.documents.find((doc) => doc.documentId === documentId);

    // Only pending documents can be selected.
    if (!document || !this.isPending(document.status)) {
      return;
    }

    if (checked) {
      if (!this.selectedDocumentIds.includes(documentId)) {
        this.selectedDocumentIds = [...this.selectedDocumentIds, documentId];
      }
    } else {
      this.selectedDocumentIds = this.selectedDocumentIds.filter((id) => id !== documentId);
    }

    this.cdr.markForCheck();
  }

  // 5. SELECT OR DESELECT ALL PENDING DOCUMENTS
  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.selectedDocumentIds = checked
      ? this.documents.filter((doc) => this.isPending(doc.status)).map((doc) => doc.documentId)
      : [];

    this.cdr.markForCheck();
  }

  // 6. HEADER CHECKBOX STATE
  get allSelected(): boolean {
    const pendingDocuments = this.documents.filter((doc) => this.isPending(doc.status));

    return (
      pendingDocuments.length > 0 &&
      pendingDocuments.every((doc) => this.selectedDocumentIds.includes(doc.documentId))
    );
  }

  // 7. STATUS BADGE STYLE
  getStatusClass(status: string): string {
    switch (status.trim().toLowerCase()) {
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

  // 8. VIEW CUSTOMER DOCUMENT
  viewDocument(document: ReviewDocument): void {
    this.errorMessage = '';

    if (!document.documentId) {
      this.errorMessage = 'Document ID is missing.';
      this.cdr.markForCheck();
      return;
    }

    // Open tab immediately to avoid popup blocking.
    const tab = window.open('about:blank', '_blank');

    if (!tab) {
      this.errorMessage = 'Please allow pop-ups to view documents.';
      this.cdr.markForCheck();
      return;
    }

    this.kycService.viewCustomerDocument(document.documentId).subscribe({
      next: (file: Blob) => {
        if (!file || file.size === 0) {
          tab.close();
          this.errorMessage = 'The document file is empty.';
          this.cdr.markForCheck();
          return;
        }

        const fileUrl = URL.createObjectURL(file);
        tab.location.href = fileUrl;

        window.setTimeout(() => {
          URL.revokeObjectURL(fileUrl);
        }, 60000);
      },

      error: (error: HttpErrorResponse) => {
        tab.close();
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  // 9. APPROVE SELECTED PENDING DOCUMENTS
  approveSelected(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isProcessing) {
      return;
    }

    const documentIds = this.documents
      .filter(
        (doc) => this.selectedDocumentIds.includes(doc.documentId) && this.isPending(doc.status),
      )
      .map((doc) => doc.documentId);

    if (documentIds.length === 0) {
      this.errorMessage = 'Please select at least one pending document.';
      this.cdr.markForCheck();
      return;
    }

    if (!window.confirm(`Approve ${documentIds.length} selected document(s)?`)) {
      return;
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    this.kycService
      .approveCustomerKyc(this.customerId, documentIds)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: KycApiResponse) => {
          this.successMessage = response?.message || 'Selected documents approved successfully.';

          this.selectedDocumentIds = [];
          this.loadDocuments();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 10. REJECT SELECTED PENDING DOCUMENTS
  rejectSelected(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isProcessing) {
      return;
    }

    const documentIds = this.documents
      .filter(
        (doc) => this.selectedDocumentIds.includes(doc.documentId) && this.isPending(doc.status),
      )
      .map((doc) => doc.documentId);

    if (documentIds.length === 0) {
      this.errorMessage = 'Please select at least one pending document.';
      this.cdr.markForCheck();
      return;
    }

    const reason = this.rejectionReason.trim();

    if (!reason) {
      this.errorMessage = 'Please enter a rejection reason.';
      this.cdr.markForCheck();
      return;
    }

    if (!window.confirm(`Reject ${documentIds.length} selected document(s)?`)) {
      return;
    }

    this.isProcessing = true;
    this.cdr.markForCheck();

    this.kycService
      .rejectCustomerKyc(this.customerId, documentIds, reason)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: KycApiResponse) => {
          this.successMessage = response?.message || 'Selected documents rejected successfully.';

          this.selectedDocumentIds = [];
          this.rejectionReason = '';

          this.loadDocuments();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 11. RETURN TO OFFICER KYC LIST
  goBack(): void {
    void this.router.navigate(['/officer-kyc']);
  }

  // 12. API ERROR MESSAGE
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
      return 'You are not authorized to view or modify these documents.';
    }

    return `Request failed. HTTP Status: ${error.status}`;
  }
}
