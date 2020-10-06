import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageHeaderComponent } from './page-header.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
})
export class PageHeaderModule {}
