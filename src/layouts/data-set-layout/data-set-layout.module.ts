import { CommonModule } from '@angular/common';
import { DataSetCardComponent } from './data-set-card/data-set-card.component';
import { DataSetHeaderComponent } from './data-set-header/data-set-header.component';
import { DataSetLayoutComponent } from './data-set-layout.component';
import { DataSetRoutingModule } from './data-set-layout-routing.module';
import { DataSetSideMenuComponent } from './data-set-side-menu/data-set-side-menu.component';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
    imports: [CommonModule, SharedModule, DataSetRoutingModule],
    declarations: [DataSetLayoutComponent, DataSetSideMenuComponent, DataSetHeaderComponent, DataSetCardComponent],
})
export class DataSetLayoutModule {}
