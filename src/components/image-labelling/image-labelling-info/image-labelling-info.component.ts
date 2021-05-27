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

import { IconSchema } from 'src/shared/types/icon/icon.model';
import { CompleteMetadata, ImgLabelProps, TabsProps, ThumbnailInfoProps } from '../image-labelling.model';
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    OnChanges,
    SimpleChanges,
    ChangeDetectionStrategy,
} from '@angular/core';

@Component({
    selector: 'image-labelling-info',
    templateUrl: './image-labelling-info.component.html',
    styleUrls: ['./image-labelling-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingInfoComponent implements OnInit, OnChanges {
    @Input() _totalUuid: number = 0;
    @Input() _onChange!: ImgLabelProps;
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _onClick: EventEmitter<ThumbnailInfoProps> = new EventEmitter();
    jsonSchema!: IconSchema;
    isTabStillOpen: boolean = true;
    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logosCenter: [
                {
                    imgPath: `../../../assets/icons/previous.svg`,
                    hoverLabel: `labellingInfo.previous`,
                    alt: `Previous`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: -1 }),
                },
                {
                    imgPath: `../../../assets/icons/next.svg`,
                    hoverLabel: `labellingInfo.next`,
                    alt: `Next`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: 1 }),
                },
            ],
            logosEnd: [
                {
                    imgPath: `../../../assets/icons/undo.svg`,
                    hoverLabel: `labellingInfo.undo`,
                    alt: `Undo`,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/redo.svg`,
                    hoverLabel: `labellingInfo.redo`,
                    alt: `Redo`,
                    onClick: () => null,
                },
                // {
                //     imgPath: `../../../assets/icons/zoom_in.svg`,
                //     hoverLabel: `Zoom In`,
                //     alt: `Zoom In`,
                //     onClick: () => null,
                // },
                // {
                //     imgPath: `../../../assets/icons/zoom_out.svg`,
                //     hoverLabel: `Zoom Out`,
                //     alt: `Zoom Out`,
                //     onClick: () => null,
                // },
            ],
        };
    };

    emitParentEvent = ({ url, thumbnailAction }: ThumbnailInfoProps): void => {
        // console.log(url, thumbnailAction);
        this._onClick.emit({ url, thumbnailAction });
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._onChange) {
            const { totalNumThumbnail } = changes._onChange.currentValue;
            this._onChange.totalNumThumbnail = totalNumThumbnail;
            this.bindImagePath();
        }

        if (changes._tabStatus) {
            this.isTabStillOpen = false;
            for (const { closed } of this._tabStatus) {
                if (!closed) {
                    this.isTabStillOpen = true;
                    break;
                }
            }
        }
    }
}
