import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [CommonModule],
    declarations: [ModalComponent],
    exports: [ModalComponent],
})
export class ModalModule {}
