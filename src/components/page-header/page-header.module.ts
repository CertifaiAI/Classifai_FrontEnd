import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageHeaderComponent } from './page-header.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, RouterModule, TranslateModule],
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
})
export class PageHeaderModule {}
