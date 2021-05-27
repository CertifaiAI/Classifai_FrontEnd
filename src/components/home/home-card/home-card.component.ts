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

import { CardFieldSchema } from '../../../layouts/home-layout/home-layout.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'home-card',
    templateUrl: './home-card.component.html',
    styleUrls: ['./home-card.component.scss'],
})
export class HomeCardComponent implements OnInit {
    @Input() _jsonSchema!: CardFieldSchema;
    @Output() _onThumbnailClick: EventEmitter<string> = new EventEmitter();
    hover!: boolean;
    hoverIndex!: number;

    constructor() {}

    ngOnInit() {}

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
