/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

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
import { Router } from '@angular/router';
import { SharedUndoRedoService } from 'shared/services/shared-undo-redo.service';
import {
    VideoLabelProps,
    TabsProps,
    CompleteMetadata,
    ThumbnailInfoProps,
    VideoLabelUrl,
} from 'shared/types/labelling-type/video-labelling.model';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'video-labelling-info',
    templateUrl: './video-labelling-info.component.html',
    styleUrls: ['./video-labelling-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoLabellingInfoComponent implements OnInit, OnChanges {
    @Input() _totalUuid: number = 0;
    @Input() _onChange!: VideoLabelProps;
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
        const videoLblType = this.router.url as VideoLabelUrl;
        if (action === 'UNDO') {
            if (videoLblType === '/videolabel/videobndbox') {
                this._sharedUndoRedoService.action.next('BBOX_UNDO');
            }
            if (videoLblType === '/videolabel/videoseg') {
                this._sharedUndoRedoService.action.next('SEG_UNDO');
            }
        }
        if (action === 'REDO') {
            if (videoLblType === '/videolabel/videobndbox') {
                this._sharedUndoRedoService.action.next('BBOX_REDO');
            }
            if (videoLblType === '/videolabel/videoseg') {
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
