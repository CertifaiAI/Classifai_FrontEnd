/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'toastr',
    templateUrl: './toastr.component.html',
    styleUrls: ['./toastr.component.scss'],
})
export class ToastrComponent implements OnChanges {
    @Input() _processingNum: number = 0;
    doneProcess = false;

    delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes._processingNum) {
            if (changes._processingNum.previousValue === 1 && changes._processingNum.currentValue === 0) {
                this.doneProcess = true;
                await this.delay(1000);
                this.doneProcess = false;
            }
        }
    }
}
