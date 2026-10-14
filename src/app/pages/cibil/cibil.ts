
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { cibilapiService } from '../../services/cibil-api';

@Component({
  selector: 'app-cibil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cibil.html',
  styleUrl: './cibil.scss'
})
export class Cibil {
  customerId = 1;
  cibil: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private service: cibilapiService,
    private cdr: ChangeDetectorRef
  ) {}

  checkScore(): void {
    if (!this.customerId || this.customerId < 1) {
      this.errorMessage = 'Please select a valid customer.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cibil = null;

    this.service.generateCibil(this.customerId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
          console.log('Loading finished:', this.loading);
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('Full API response:', res);

          const report = res?.data ?? res;

          if (report?.cibilScore != null) {
            this.cibil = report;
          } else {
            this.errorMessage = 'CIBIL score is missing from the response.';
          }

          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('CIBIL API error:', err);
          this.errorMessage =
            err?.error?.message ||
            `Unable to generate CIBIL score. HTTP ${err.status}`;

          this.cdr.detectChanges();
        }
      });
  }

  get scoreColor(): string {
    if (!this.cibil) return '#6c757d';

    const score = Number(this.cibil.cibilScore);

    if (score >= 800) return '#198754';
    if (score >= 700) return '#ffc107';
    if (score >= 650) return '#fd7e14';

    return '#dc3545';
  }
}
