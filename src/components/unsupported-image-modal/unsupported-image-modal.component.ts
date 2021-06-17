/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, Input } from '@angular/core';
import { ModalBodyStyle } from '../modal/modal.model';

@Component({
    selector: 'unsupported-image-modal',
    templateUrl: './unsupported-image-modal.component.html',
    styleUrls: ['./unsupported-image-modal.component.scss'],
})
export class UnsupportedImageModalComponent {
    @Input() _modalUnsupportedImage: string = '';
    @Input() _unsupportedImageBodyStyle!: ModalBodyStyle;
    @Input() _unsupportedImageList: string[] = [];
}
