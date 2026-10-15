import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { KycService } from '../../services/kyc-service';

interface KycDocumentView {
  documentId?: number;
  customerId?: number;
  documentType?: string;
  fileName?: string;
  filePath?: string;
  status?: string;
  verificationStatus?: string;
  rejectionReason?: string | null;
  uploadedAt?: string;
}

@Component({
  selector: 'app-customer-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-kyc.html',
  styleUrl: './customer-kyc.css',
})
export class CustomerKyc implements OnInit {
  @ViewChild('fileInput')
  fileInput?: ElementRef<HTMLInputElement>;

  documentType = '';
  selectedFile: File | null = null;

  documents: KycDocumentView[] = [];

  isUploading = false;
  isLoading = false;

  successMessage = '';
  errorMessage = '';

  documentTypes = ['PAN', 'Aadhaar', 'Address Proof', 'Income Proof', 'Bank Statement', 'Other'];

  constructor(
    private kycService: KycService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadMyDocuments();
  }

  // 1. HANDLE FILE SELECTION
  onFileSelected(event: Event): void {
    this.successMessage = '';
    this.errorMessage = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedFile = null;
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please select a PDF, JPG, JPEG or PNG file.';

      this.selectedFile = null;
      input.value = '';
      this.cdr.markForCheck();
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage = 'File size must not exceed 5 MB.';

      this.selectedFile = null;
      input.value = '';
      this.cdr.markForCheck();
      return;
    }

    this.selectedFile = file;
    this.cdr.markForCheck();
  }

  // 2. UPLOAD KYC DOCUMENT
  uploadDocument(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.documentType) {
      this.errorMessage = 'Please select a document type.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Please select a document file.';
      this.cdr.markForCheck();
      return;
    }

    if (this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.cdr.markForCheck();

    this.kycService
      .uploadDocument(this.documentType, this.selectedFile)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Document uploaded successfully.';

          this.documentType = '';
          this.selectedFile = null;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          this.cdr.markForCheck();

          // Refresh the table after successful upload.
          this.loadMyDocuments();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 3. LOAD LOGGED-IN CUSTOMER'S DOCUMENTS
  loadMyDocuments(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.kycService
      .getMyDocuments()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.documents = this.normalizeDocuments(response);
          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  // 4. NORMALIZE BACKEND RESPONSE FIELDS
  private normalizeDocuments(response: unknown): KycDocumentView[] {
    let items: unknown[] = [];

    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const result = response as Record<string, unknown>;

      const candidate = result['documents'] ?? result['data'] ?? result['items'];

      if (Array.isArray(candidate)) {
        items = candidate;
      }
    }

    return items.map((value): KycDocumentView => {
      const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

      const filePath = String(item['filePath'] ?? item['FilePath'] ?? '');

      const pathFileName = filePath.split(/[\\/]/).pop() ?? '';

      const fileName = String(
        item['fileName'] ??
          item['FileName'] ??
          pathFileName ??
          item['documentType'] ??
          item['DocumentType'] ??
          'KYC Document',
      );

      const status = String(
        item['verificationStatus'] ??
          item['VerificationStatus'] ??
          item['status'] ??
          item['Status'] ??
          'Unknown',
      );

      const rejectionReason = item['rejectionReason'] ?? item['RejectionReason'] ?? null;

      const documentIdValue = item['documentId'] ?? item['DocumentId'];

      const customerIdValue = item['customerId'] ?? item['CustomerId'];

      return {
        documentId: documentIdValue == null ? undefined : Number(documentIdValue),

        customerId: customerIdValue == null ? undefined : Number(customerIdValue),

        documentType: String(item['documentType'] ?? item['DocumentType'] ?? ''),

        fileName,
        filePath,
        status,
        verificationStatus: status,

        rejectionReason: rejectionReason == null ? null : String(rejectionReason),

        uploadedAt: String(
          item['uploadedAt'] ?? item['UploadedAt'] ?? item['createdAt'] ?? item['CreatedAt'] ?? '',
        ),
      };
    });
  }

  // 5. GET DOCUMENT STATUS
  getDocumentStatus(doc: KycDocumentView): string {
    return doc.verificationStatus || doc.status || 'Not Verified';
  }

  // 6. ACTION COLUMN LABEL
  getActionLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Verified';

      case 'rejected':
        return 'Re-upload Required';

      case 'pending':
        return 'Not Verified';

      default:
        return 'Not Verified';
    }
  }

  // 7. ACTION BADGE STYLE
  getActionClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-success';

      case 'rejected':
        return 'bg-danger';

      case 'pending':
        return 'bg-warning text-dark';

      default:
        return 'bg-secondary';
    }
  }

  // 8. STATUS BADGE STYLE
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

  // 9. VIEW DOCUMENT
  viewDocument(document: KycDocumentView): void {
    this.errorMessage = '';

    if (!document.documentId) {
      this.errorMessage = 'Document ID is missing.';
      this.cdr.markForCheck();
      return;
    }

    // Open a blank tab immediately to avoid popup blocking.
    const newTab = window.open('about:blank', '_blank');

    if (!newTab) {
      this.errorMessage = 'Please allow pop-ups to view the document.';
      this.cdr.markForCheck();
      return;
    }

    this.kycService.viewMyDocument(document.documentId).subscribe({
      next: (file: Blob) => {
        const fileUrl = URL.createObjectURL(file);

        newTab.location.href = fileUrl;

        // Release the temporary browser URL after viewing.
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

  // 10. FORMAT API ERRORS
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
      return 'You are not authorized. Please log in again if your session has expired.';
    }

    return `Request failed. HTTP Status: ${error.status}`;
  }
}
