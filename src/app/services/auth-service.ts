import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';


// 1. Authentication API Response Class
export class AuthResponse {
  requiresTwoFactor?: boolean;
  requiresTwoFactorSetup?: boolean;
  setupToken?: string | null;
  preAuthToken?: string | null;
  token?: string | null;
  role?: string | null;
  message?: string;
}

// 2. Two-Factor Setup Response Class
export class TwoFactorSetupResponse {
  manualEntryKey?: string;
  qrCodeUri?: string;
  message?: string;
}

// 3. API Message Response Class
export class ApiMessageResponse {
  message?: string;
}

// 4. Login Flow Result Class
export class LoginFlowResult {
  status: 'setup' | 'twoFactor' | 'authenticated' | 'error' = 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = 'https://localhost:44319/api/Auth';

  // 5. Google OAuth Client ID
  private readonly googleClientId =
    '1066832090441-qbqpblqu0ksr8dgau73pklpr57boheuf.apps.googleusercontent.com';

  // 6. REGISTER
  register(data: any): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/register`, data);
  }

  // 7. LOGIN WITH EMAIL AND PASSWORD
  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  // 8. GET GOOGLE CLIENT ID
  getGoogleClientId(): string {
    return this.googleClientId;
  }

  // 9. LOGIN WITH GOOGLE
  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, {
      idToken: idToken,
    });
  }

  // 10. ENABLE 2FA AND GET QR SETUP INFORMATION
  enableTwoFactor(setupToken: string): Observable<TwoFactorSetupResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${setupToken}`,
    });

    return this.http.post<TwoFactorSetupResponse>(`${this.apiUrl}/enable-2fa`, {}, { headers });
  }

  // 11. VERIFY AUTHENTICATOR OTP
  verifyTwoFactor(preAuthToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-2fa`, {
      preAuthToken,
      code,
    });
  }

  // 12. HANDLE LOGIN RESPONSE
  handleLoginResponse(response: AuthResponse): LoginFlowResult {
    const result = new LoginFlowResult();

    // FIRST-TIME LOGIN: 2FA SETUP REQUIRED
    if (response.requiresTwoFactorSetup) {
      if (!response.setupToken) {
        result.status = 'error';
        result.message = 'Setup token was not returned by the server.';
        return result;
      }

      this.clearAuthData();

      sessionStorage.setItem('setupToken', response.setupToken);

      void this.router.navigate(['/two-factor-setup']);

      result.status = 'setup';
      return result;
    }

    // EXISTING USER: OTP REQUIRED
    if (response.requiresTwoFactor) {
      if (!response.preAuthToken) {
        result.status = 'error';
        result.message = 'Pre-authentication token was not returned.';
        return result;
      }

      this.clearAuthData();

      sessionStorage.setItem('preAuthToken', response.preAuthToken);

      result.status = 'twoFactor';
      result.message = 'Enter the 6-digit code from your Authenticator app.';

      return result;
    }

    // NORMAL LOGIN OR GOOGLE LOGIN
    if (response.token) {
      const success = this.completeLogin(response.token, response.role);

      if (success) {
        result.status = 'authenticated';
        return result;
      }

      result.status = 'error';
      result.message = 'Login succeeded, but the role is missing or unrecognized.';

      return result;
    }

    result.status = 'error';
    result.message = response.message || 'Login failed.';

    return result;
  }

  // 13. COMPLETE LOGIN AFTER OTP VERIFICATION
  completeTwoFactorLogin(response: AuthResponse): boolean {
    if (!response.token) {
      return false;
    }

    return this.completeLogin(response.token, response.role);
  }

  // 14. COMPLETE LOGIN AFTER FIRST-TIME SETUP
  completeSetupLogin(response: AuthResponse): boolean {
    if (!response.token) {
      return false;
    }

    return this.completeLogin(response.token, response.role);
  }

  // 15. STORE TOKEN AND NAVIGATE BY ROLE
  private completeLogin(token: string, responseRole?: string | null): boolean {
    const role = (responseRole || this.getRoleFromToken(token)).trim().toLowerCase();

    let dashboardRoute = '';

    if (role === 'user') {
      dashboardRoute = '/user-dashboard';
    } else if (role === 'officer' || role === 'loan officer') {
      dashboardRoute = '/officer-dashboard';
    } else if (role === 'admin') {
      dashboardRoute = '/admin-dashboard';
    } else {
      return false;
    }

    this.clearAuthData();

    sessionStorage.setItem('accessToken', token);
    sessionStorage.setItem('userRole', role);

    void this.router.navigate([dashboardRoute]);

    return true;
  }

  // 16. READ ROLE FROM JWT
  private getRoleFromToken(token: string): string {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');

      const paddedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');

      const claims = JSON.parse(atob(paddedPayload));

      const role =
        claims['role'] ??
        claims['roles'] ??
        claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      return Array.isArray(role) ? (role[0] ?? '') : (role ?? '');
    } catch {
      return '';
    }
  }

  // 17. GET ACCESS TOKEN
  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  // 18. GET CURRENT ROLE
  getCurrentRole(): string | null {
    return sessionStorage.getItem('userRole');
  }

  // 19. CHECK LOGIN STATUS
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // 20. LOGOUT
  logout(): void {
    this.clearAuthData();
    void this.router.navigate(['/login']);
  }

  // 21. CLEAR AUTHENTICATION SESSION
  private clearAuthData(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('setupToken');
    sessionStorage.removeItem('preAuthToken');
  }
}
