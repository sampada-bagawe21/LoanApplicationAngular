import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class cibilapiService {

  http = inject(HttpClient);

  url = "https://localhost:7008/api/Cibil/GenerateScore";
  generateCibil(customerId: number)
  {
    return this.http.post<any>(this.url, { customerId });
  }

  url2 = "https://localhost:7008/api/Cibil/GetScore";
  getCibil(customerId: number)
  {
    return this.http.get<any>(`${this.url2}/${customerId}`);
  }
  
}