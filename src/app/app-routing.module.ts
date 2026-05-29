import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'add-medication',
    loadChildren: () => import('./pages/add-medication/add-medication.module').then(m => m.AddMedicationPageModule)
  },
  {
    path: 'add-medication/:id',
    loadChildren: () => import('./pages/add-medication/add-medication.module').then(m => m.AddMedicationPageModule)
  },
  {
    path: 'medication-detail/:id',
    loadChildren: () => import('./pages/medication-detail/medication-detail.module').then(m => m.MedicationDetailPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
