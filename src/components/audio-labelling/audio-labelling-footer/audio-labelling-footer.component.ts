/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ImageProps } from 'shared/types/image-labelling/image-labelling.model';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'audio-labelling-footer',
    templateUrl: './audio-labelling-footer.component.html',
    styleUrls: ['./audio-labelling-footer.component.scss'],
})
export class AudioLabellingFooterComponent {
    @Input() projectName: string = '';
    @Input() filePath: string = '';
    @Input() fileSize: string = '';
    @Input() fileType: string = '';
}
