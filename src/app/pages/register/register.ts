import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, JsonPipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formData = {
    firstName: '',
    lastName: '',
    age: null as number | null,
    email: '',
    password: '',
    mobileNo: '',
    pan: '',
    aadhaarNo: '',
    employmentType: '',
    monthlyIncome: null as number | null,
    monthlyInvestment: null as number | null,
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // Register user through AuthService
  register(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        this.successMessage = response.message || 'Registration successful!';

        this.errorMessage = '';

        // Keep the page open so the success message is visible
        this.cdr.markForCheck();
      },

      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);

        this.cdr.markForCheck();
      },
    });
  }

  // Return to Login page
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Convert API errors into readable messages
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

    return `Registration failed. HTTP Status: ${error.status}`;
  }
}
