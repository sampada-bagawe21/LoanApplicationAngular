import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PenaltychargeService {
    http=inject(HttpClient);

    url1="https://localhost:7008/api/v1/admin/Penalty/GetAllPenalties";
    getAllPenalty(){
        return this.http.get<any>(this.url1);
    }

    url2="https://localhost:7008/api/v1/admin/Penalty/ApplyPenalty";
    ApplyPenalty(data:any){
        return this.http.post<any>(this.url2,data);
    }
}
