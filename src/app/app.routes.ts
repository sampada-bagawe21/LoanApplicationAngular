import { Routes } from '@angular/router';
import { First } from './first/first';
import { Second } from './second/second';

import { Png } from './png/png';
import { Form1 } from './form1/form1';
import { Form2 } from './form2/form2';
import { Api } from './api/api';
import { PendingLoans } from './pending-loans/pending-loans';
import { ApplyLoan } from './apply-loan/apply-loan';

export const routes: Routes = [
    
    {path:'',redirectTo:'/fst',pathMatch:'full'},
    {path:'fst',component:First},
    {path:'scd',component:Second},

    {path:'api',component:Api},
    {path:'f1',component:Form1},
    {path:'f2',component:Form2},

    {path:'AL',component:ApplyLoan},
    {path:'PD',component:PendingLoans},



    {path:'**',component:Png}
];
