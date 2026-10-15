import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';

import { AuthService, AuthResponse, TwoFactorSetupResponse } from '../../services/auth-service';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './two-factor-setup.html',
  styleUrl: './two-factor-setup.css',
})
export class TwoFactorSetup {
  qrCodeDataUrl = '';
  manualEntryKey = '';
  otpCode = '';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // Step 1: Generate QR code using AuthService
  enableTwoFactor(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isSubmitting) {
      return;
    }

    const setupToken = sessionStorage.getItem('setupToken');

    if (!setupToken) {
      this.errorMessage = 'Setup session is missing or expired. Please log in again.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;

    this.authService.enableTwoFactor(setupToken).subscribe({
      next: async (response: TwoFactorSetupResponse) => {
        this.isSubmitting = false;

        if (!response.qrCodeUri) {
          this.errorMessage =
            response.message || 'QR setup information was not returned by the server.';
          this.cdr.markForCheck();
          return;
        }

        this.manualEntryKey = response.manualEntryKey ?? '';

        try {
          this.qrCodeDataUrl = await QRCode.toDataURL(response.qrCodeUri);

          this.successMessage =
            'Scan this QR code with your Authenticator app, then enter the 6-digit code.';
        } catch {
          this.errorMessage = 'Could not generate the QR code.';
        }

        this.cdr.markForCheck();
      },

      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);

        this.cdr.markForCheck();
      },
    });
  }

  // Step 2: Verify first-time setup OTP through AuthService
  verifySetupOtp(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const setupToken = sessionStorage.getItem('setupToken');

    if (!setupToken) {
      this.errorMessage = 'Setup session is missing or expired. Please log in again.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.qrCodeDataUrl) {
      this.errorMessage = 'Please generate and scan the QR code first.';
      this.cdr.markForCheck();
      return;
    }

    if (!/^[0-9]{6}$/.test(this.otpCode)) {
      this.errorMessage = 'Enter a valid 6-digit Authenticator code.';
      this.cdr.markForCheck();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService.verifyTwoFactor(setupToken, this.otpCode).subscribe({
      next: (response: AuthResponse) => {
        this.isSubmitting = false;

        if (!response.token) {
          this.errorMessage = response.message || 'OTP verification failed.';

          this.cdr.markForCheck();
          return;
        }

        // AuthService stores the access token and opens the dashboard
        const loginSuccessful = this.authService.completeSetupLogin(response);

        if (!loginSuccessful) {
          this.errorMessage = '2FA was verified, but the user role is missing or unrecognized.';

          this.cdr.markForCheck();
          return;
        }

        this.successMessage = response.message || '2FA setup and verification successful!';

        this.otpCode = '';
        this.cdr.markForCheck();
      },

      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);

        this.cdr.markForCheck();
      },
    });
  }

  // Return to Login and clear the incomplete setup session
  goToLogin(): void {
    this.authService.logout();
  }

  // Convert API errors to readable messages
  private getErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.title) {
      return error.error.title;
    }

    if (error.status === 0) {
      return 'Cannot connect to the API. Check whether the backend is running.';
    }

    if (error.status === 401) {
      return 'Setup session is invalid or expired. Please log in again.';
    }

    return `Request failed. HTTP Status: ${error.status}`;
  }
}
