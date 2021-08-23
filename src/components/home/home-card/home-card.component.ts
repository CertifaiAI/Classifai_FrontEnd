/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardFieldSchema } from 'shared/types/home-layout/home-layout.model';

@Component({
    selector: 'home-card',
    templateUrl: './home-card.component.html',
    styleUrls: ['./home-card.component.scss'],
})
export class HomeCardComponent {
    @Input() _jsonSchema!: CardFieldSchema;
    @Output() _onThumbnailClick: EventEmitter<string> = new EventEmitter();
    hover!: boolean;
    hoverIndex!: number;

    mouseEventCapture(event: MouseEvent, index: number): void {
        const { type } = event;
        this.hover = type === 'mouseover' ? true : false;
        this.hoverIndex = index;
    }

    emitParentUrl(enabled: boolean, url: string): void {
        enabled && this._onThumbnailClick.emit(url);
    }

    hoverStyling = (index: number, isHover: boolean, hoverLabel: string, imgPath: string): object =>
        index === this.hoverIndex && isHover
            ? {
                  'background-image': 'url(' + imgPath + ')',
                  opacity: '1.0',
                  cursor: hoverLabel ? 'not-allowed' : 'pointer',
              }
            : {
                  'background-image': 'url(' + imgPath + ')',
                  opacity: '0.5',
              };

    conditionalHoverPlaceholder = (index: number, hoverLabel: string): string =>
        index === this.hoverIndex && hoverLabel ? hoverLabel : '';
}
