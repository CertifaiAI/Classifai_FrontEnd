import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, TranslateModule],
    declarations: [FooterComponent],
    exports: [FooterComponent],
})
export class FooterModule {}
