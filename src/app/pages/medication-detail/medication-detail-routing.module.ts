import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedicationDetailPage } from './medication-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MedicationDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicationDetailPageRoutingModule {}
