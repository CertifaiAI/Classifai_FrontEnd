/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    CompleteMetadata,
    ImageLabelUrl,
    ImgLabelProps,
    TabsProps,
    ThumbnailInfoProps,
} from 'shared/types/labelling-type/image-labelling.model';

import { IconSchema } from 'shared/types/icon/icon.model';
import { Router } from '@angular/router';
import { SharedUndoRedoService } from 'shared/services/shared-undo-redo.service';

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

    constructor(private _sharedUndoRedoService: SharedUndoRedoService, private router: Router) {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logosCenter: [
                {
                    imgPath: `assets/icons/previous.svg`,
                    hoverLabel: `labellingInfo.previous`,
                    alt: `Previous`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: -1 }),
                },
                {
                    imgPath: `assets/icons/next.svg`,
                    hoverLabel: `labellingInfo.next`,
                    alt: `Next`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: 1 }),
                },
            ],
            logosEnd: [
                {
                    imgPath: `assets/icons/undo.svg`,
                    hoverLabel: `labellingInfo.undo`,
                    alt: `Undo`,
                    onClick: () => this.undoRedo('UNDO'),
                },
                {
                    imgPath: `assets/icons/redo.svg`,
                    hoverLabel: `labellingInfo.redo`,
                    alt: `Redo`,
                    onClick: () => this.undoRedo('REDO'),
                },
                // {
                //     imgPath: `assets/icons/zoom_in.svg`,
                //     hoverLabel: `Zoom In`,
                //     alt: `Zoom In`,
                //     onClick: () => null,
                // },
                // {
                //     imgPath: `assets/icons/zoom_out.svg`,
                //     hoverLabel: `Zoom Out`,
                //     alt: `Zoom Out`,
                //     onClick: () => null,
                // },
            ],
        };
    };

    undoRedo(action: string) {
        const imageLblType = this.router.url as ImageLabelUrl;
        if (action === 'UNDO') {
            if (imageLblType === '/imglabel/bndbox') {
                this._sharedUndoRedoService.action.next('BBOX_UNDO');
            }
            if (imageLblType === '/imglabel/seg') {
                this._sharedUndoRedoService.action.next('SEG_UNDO');
            }
        }
        if (action === 'REDO') {
            if (imageLblType === '/imglabel/bndbox') {
                this._sharedUndoRedoService.action.next('BBOX_REDO');
            }
            if (imageLblType === '/imglabel/seg') {
                this._sharedUndoRedoService.action.next('SEG_REDO');
            }
        }
    }

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
