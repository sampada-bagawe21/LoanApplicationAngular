import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class LoanDeal {
    http=inject(HttpClient);

    url="http://localhost:5235/api/Loan/pending";
    getPendingLoans(){
        return this.http.get<any>(this.url);
      
        }


    url2="http://localhost:5235/api/Loan/apply";
    applyLoans(data:any){
        return this.http.post<any>(this.url2,data);
      
        }
    }
