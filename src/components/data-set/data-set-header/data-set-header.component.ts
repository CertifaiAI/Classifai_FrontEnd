/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'data-set-header',
    templateUrl: './data-set-header.component.html',
    styleUrls: ['./data-set-header.component.scss'],
})
export class DataSetHeaderComponent {
    @Output() selectedKey = new EventEmitter<string>();
    @Input() _enableSort: boolean = true;
    selectedOpt: string = 'project_name';

    onOptionsSelected(value: string) {
        this.selectedOpt = value;
        this.selectedKey.emit(value);
    }
}
