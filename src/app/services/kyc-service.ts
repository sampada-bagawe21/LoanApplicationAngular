import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

export interface KycDocument {
  documentId?: number;
  customerId?: number;
  documentType?: string;
  fileName?: string;
  status?: string;
  rejectionReason?: string | null;
  uploadedAt?: string;
  message?: string;
}

export interface KycApiResponse {
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class KycService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiUrl = 'https://localhost:44319/api/Kyc';

  // Add the logged-in user's access token to API requests
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // 1. UPLOAD KYC DOCUMENT
  uploadDocument(documentType: string, file: File): Observable<KycApiResponse> {
    const formData = new FormData();

    formData.append('DocumentType', documentType);
    formData.append('File', file);

    return this.http.post<KycApiResponse>(`${this.apiUrl}/upload`, formData, {
      headers: this.getHeaders(),
    });
  }

  // 2. GET LOGGED-IN CUSTOMER'S DOCUMENTS
  getMyDocuments(): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.apiUrl}/my-documents`, {
      headers: this.getHeaders(),
    });
  }

  // 3. GET A CUSTOMER'S DOCUMENTS
  // Intended for authorized officer/admin screens later.
  getCustomerDocuments(customerId: number): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.apiUrl}/customer/${customerId}`, {
      headers: this.getHeaders(),
    });
  }

  // APPROVE SELECTED DOCUMENTS
  approveCustomerKyc(customerId: number, documentIds: number[]): Observable<KycApiResponse> {
    return this.http.put<KycApiResponse>(
      `${this.apiUrl}/customer/${customerId}/approve`,
      { documentIds },
      {
        headers: this.getHeaders(),
      },
    );
  }

  // REJECT SELECTED DOCUMENTS
  rejectCustomerKyc(
    customerId: number,
    documentIds: number[],
    rejectionReason: string,
  ): Observable<KycApiResponse> {
    return this.http.put<KycApiResponse>(
      `${this.apiUrl}/customer/${customerId}/reject`,
      {
        documentIds,
        rejectionReason,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  //6.

  viewMyDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/my-documents/${documentId}/view`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  // 7. GET CUSTOMERS WHOSE KYC IS PENDING
  getPendingCustomers(): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiUrl}/pending-customers`, {
      headers: this.getHeaders(),
    });
  }

  // 8. VIEW A CUSTOMER'S DOCUMENT (OFFICER)
  viewCustomerDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/view`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }
}
