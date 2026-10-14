import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class EmpServices {
    http=inject(HttpClient);

    url="https://localhost:44307/api/v1/Employee/GetE";
    getEmployees(){
        return this.http.get<any>(this.url);
      
        }
        
    }


