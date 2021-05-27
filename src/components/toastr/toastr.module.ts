import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToastrComponent } from './toastr.component';

@NgModule({
    imports: [CommonModule],
    declarations: [ToastrComponent],
    exports: [ToastrComponent],
})
export class ToastrModule {}
