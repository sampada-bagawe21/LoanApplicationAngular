import { Routes } from '@angular/router';


import { Png } from './png/png';
import { Form1 } from './form1/form1';
import { Form2 } from './form2/form2';
import { Api } from './api/api';
import { PendingLoans } from './pending-loans/pending-loans';
import { ApplyLoan } from './apply-loan/apply-loan';
import { Penaltycharges } from './penaltycharges/penaltycharges';

export const routes: Routes = [
    
    {path:'',redirectTo:'/fst',pathMatch:'full'},


    {path:'api',component:Api},
    {path:'f1',component:Form1},
    {path:'f2',component:Form2},

    {path:'AL',component:ApplyLoan},
    {path:'PD',component:PendingLoans},
    {path:'pc',component:Penaltycharges},



    {path:'**',component:Png}
];
