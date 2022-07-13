import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RightSidebarComponent } from './right-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, TranslateModule],
    declarations: [RightSidebarComponent],
    exports: [RightSidebarComponent],
})
export class RightSidebarModule {}
