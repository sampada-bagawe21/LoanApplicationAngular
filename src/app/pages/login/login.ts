import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService, AuthResponse } from '../../services/auth-service';

declare global {
  interface Window {
    google?: any;
  }
}

class GoogleCredentialResponse {
  credential?: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  formData = {
    email: '',
    password: '',
  };

  otpCode = '';
  preAuthToken = '';

  requiresTwoFactor = false;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  // Initialize Google Sign-In button
  private initializeGoogleSignIn(attempt = 0): void {
    const google = window.google;
    const button = document.getElementById('googleButton');

    if (!button) {
      return;
    }

    // Wait for Google's script to load
    if (!google?.accounts?.id) {
      if (attempt < 30) {
        setTimeout(() => this.initializeGoogleSignIn(attempt + 1), 200);
      } else {
        this.errorMessage = 'Google Sign-In did not load. Please refresh the page.';

        this.cdr.markForCheck();
      }

      return;
    }

    google.accounts.id.initialize({
      client_id: this.authService.getGoogleClientId(),

      callback: (response: GoogleCredentialResponse) => {
        const idToken = response?.credential;

        if (!idToken) {
          this.errorMessage = 'Google did not return an ID token.';

          this.cdr.markForCheck();
          return;
        }

        this.loginWithGoogle(idToken);
      },
    });

    // Clear any old rendered button
    button.innerHTML = '';

    // Render Google Sign-In button
    google.accounts.id.renderButton(button, {
      type: 'standard',
      theme: 'outline',
      size: 'medium',
      text: 'continue_with',
      shape: 'rectangular',
      width: 300,
    });
  }

  // Navigate to Register page
  goToRegister(): void {
    void this.router.navigate(['/register']);
  }

  // Login with email and password
  login(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.requiresTwoFactor = false;
    this.otpCode = '';
    this.preAuthToken = '';

    this.authService.login(this.formData).subscribe({
      next: (response: AuthResponse) => {
        this.isSubmitting = false;
        this.processLoginResponse(response);
      },

      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  // Login with Google
  private loginWithGoogle(idToken: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService.googleLogin(idToken).subscribe({
      next: (response: AuthResponse) => {
        this.isSubmitting = false;
        this.processLoginResponse(response);
      },

      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  // Handle normal login and Google login responses
  private processLoginResponse(response: AuthResponse): void {
    const result = this.authService.handleLoginResponse(response);

    if (result.status === 'twoFactor') {
      this.requiresTwoFactor = true;
      this.preAuthToken = response.preAuthToken ?? '';

      this.successMessage = result.message ?? 'Enter the 6-digit code from your Authenticator app.';
    } else if (result.status === 'error') {
      this.errorMessage = result.message ?? 'Login failed.';
    }

    // Setup and dashboard navigation are handled by AuthService
    this.cdr.markForCheck();
  }

  // Verify OTP for an existing 2FA user
  verifyTwoFactor(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const token = sessionStorage.getItem('preAuthToken') ?? this.preAuthToken;

    if (!token) {
      this.errorMessage = 'Your login session is missing. Please log in again.';

      this.cdr.markForCheck();
      return;
    }

    if (!/^[0-9]{6}$/.test(this.otpCode)) {
      this.errorMessage = 'Enter a valid 6-digit OTP.';

      this.cdr.markForCheck();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService.verifyTwoFactor(token, this.otpCode).subscribe({
      next: (response: AuthResponse) => {
        this.isSubmitting = false;

        if (!response.token) {
          this.errorMessage = response.message ?? 'OTP verification failed.';

          this.cdr.markForCheck();
          return;
        }

        const success = this.authService.completeTwoFactorLogin(response);

        if (success) {
          this.preAuthToken = '';
          this.otpCode = '';
          this.requiresTwoFactor = false;
        } else {
          this.errorMessage = 'Login succeeded, but the role is missing or unrecognized.';
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

  // Display readable API errors
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
      return 'Cannot connect to the API. Check the backend, HTTPS and CORS.';
    }

    return `Request failed. HTTP Status: ${error.status}`;
  }
}
