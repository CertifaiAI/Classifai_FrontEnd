/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
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
