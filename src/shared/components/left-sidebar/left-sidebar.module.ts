import { CommonModule } from '@angular/common';
import { LeftSidebarComponent } from './left-sidebar.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, TranslateModule],
    declarations: [LeftSidebarComponent],
    exports: [LeftSidebarComponent],
})
export class LeftSidebarModule {}
