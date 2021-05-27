/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'toastr',
    templateUrl: './toastr.component.html',
    styleUrls: ['./toastr.component.scss'],
})
export class ToastrComponent implements OnInit, OnChanges {
    @Input() _processingNum: number = 0;
    doneProcess = false;

    constructor() {}

    ngOnInit(): void {}

    delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        // console.log(changes);
        if (changes._processingNum) {
            console.log(changes._processingNum);
            if (changes._processingNum.previousValue === 1 && changes._processingNum.currentValue === 0) {
                this.doneProcess = true;
                await this.delay(1000);
                this.doneProcess = false;
            }
        }
    }
}
