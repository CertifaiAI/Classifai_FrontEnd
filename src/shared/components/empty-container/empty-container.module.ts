import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyContainerComponent } from './empty-container.component';

@NgModule({
    imports: [CommonModule, TranslateModule],
    declarations: [EmptyContainerComponent],
    exports: [EmptyContainerComponent],
})
export class EmptyContainerModule {}
