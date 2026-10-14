import { Routes } from '@angular/router';
import { Cibil } from './pages/cibil/cibil';
import { Eligibility } from './pages/eligibility/eligibility';
import { Scorecard } from './pages/scorecard/scorecard';

export const routes: Routes = [
  { path: 'cibil', component: Cibil },
   { path: 'scorecard', component: Scorecard },
  { path: 'eligibility', component: Eligibility },
  { path: '', redirectTo: 'cibil', pathMatch: 'full' }
];
