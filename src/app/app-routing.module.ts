import { HomeLayoutComponent } from 'src/layouts/home-layout/home-layout.component';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: HomeLayoutComponent },
  {
    path: 'imglabel',
    loadChildren: () =>
      import(
        '../layouts/image-labelling-layout/image-labelling-layout.module'
      ).then((m) => m.ImageLabellingLayoutModule),
  },
  {
    path: 'dataset',
    loadChildren: () =>
      import('../layouts/data-set-layout/data-set-layout.module').then(
        (m) => m.DataSetLayoutModule
      ),
  },
  { path: '500', component: InternalServerErrorComponent },
  { path: '404', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
