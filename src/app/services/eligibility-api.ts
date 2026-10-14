
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class eligibilityapiService {

  http = inject(HttpClient);

  baseUrl = "https://localhost:7008/api";

  // ==================== CIBIL ====================

  url = `${this.baseUrl}/Cibil/GenerateScore`;

  generateCibil(customerId: number)
  {
    return this.http.post<any>(
      this.url,
      { customerId }
    );
  }

  url2 = `${this.baseUrl}/Cibil/GetScore`;

  getCibil(customerId: number)
  {
    return this.http.get<any>(
      `${this.url2}/${customerId}`
    );
  }

  // ==================== SCORECARD ====================

  // Get all customers for Admin Index
  url3 = `${this.baseUrl}/ScoreCard/Customers`;

  getAllCustomers()
  {
    return this.http.get<any>(this.url3);
  }

  // Generate scorecard for selected customer
  url4 = `${this.baseUrl}/ScoreCard/Generate`;

  generateScorecard(customerId: number)
  {
    return this.http.post<any>(
      this.url4,
      { customerId }
    );
  }

  // ==================== ELIGIBILITY ====================

  // Customer checks eligibility
  url5 = `${this.baseUrl}/Eligibility/Check`;

  checkEligibility(customerId: number)
  {
    return this.http.post<any>(
      this.url5,
      { customerId }
    );
  }

  // Officer gets pending requests
  url6 = `${this.baseUrl}/Eligibility/PendingRequests`;

  getPendingRequests()
  {
    return this.http.get<any>(this.url6);
  }

  // Officer approves or rejects application
  url7 = `${this.baseUrl}/Eligibility/OfficerDecision`;

  officerDecision(eligibilityId: number, data: any)
  {
    return this.http.put<any>(
      `${this.url7}/${eligibilityId}`,
      data
    );
  }

  // Customer views eligibility result
  url8 = `${this.baseUrl}/Eligibility/Result`;

  getEligibilityResult(eligibilityId: number)
  {
    return this.http.get<any>(
      `${this.url8}/${eligibilityId}`
    );
  }
}
