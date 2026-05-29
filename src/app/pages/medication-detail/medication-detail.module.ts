import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicationDetailPageRoutingModule } from './medication-detail-routing.module';

import { MedicationDetailPage } from './medication-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicationDetailPageRoutingModule
  ],
  declarations: [MedicationDetailPage]
})
export class MedicationDetailPageModule {}
