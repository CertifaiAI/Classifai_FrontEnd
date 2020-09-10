import { DataSetLayoutComponent } from './data-set-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const dataSetRoutes: Routes = [
  {
    path: '',
    component: DataSetLayoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(dataSetRoutes)],
})
export class DataSetRoutingModule {}
