/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'tabular-labelling-footer',
    templateUrl: './tabular-labelling-footer.component.html',
    styleUrls: ['./tabular-labelling-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabularLabellingFooterComponent implements OnInit {
    @Input() projectName!: string;
    @Input() filePath!: string;
    @Input() fileType!: string;
    jsonSchema!: IconSchema;

    ngOnInit() {}

    copyMessage(path: string) {
        const el = document.createElement('textarea');
        el.value = path;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
}
