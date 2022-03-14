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
    ImgLabelProps,
    TabsProps,
    CompleteMetadata,
    ThumbnailInfoProps,
    ImageLabelUrl,
} from 'shared/types/image-labelling/image-labelling.model';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'tabular-labelling-info',
    templateUrl: './tabular-labelling-info.component.html',
    styleUrls: ['./tabular-labelling-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabularLabellingInfoComponent implements OnInit, OnChanges {
    @Input() totalUuid!: number;
    @Input() currentIndex!: number;
    @Input() hasAnnotation!: boolean;
    @Input() isToggleLabelSection!: boolean;
    @Input() isToggleConditionsSection!: boolean;
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _onClick: EventEmitter<ThumbnailInfoProps> = new EventEmitter();
    @Output() onNavigateData: EventEmitter<number> = new EventEmitter();
    searchIndex: number = 0;
    status!: string;

    constructor(private _sharedUndoRedoService: SharedUndoRedoService, private router: Router) {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasAnnotation) {
            if (this.hasAnnotation) {
                this.status = 'Labeled';
            } else {
                this.status = 'Not labeled';
            }
        }
    }

    searchData(event: any) {
        this.searchIndex = Number(event.target.value);
        this.currentIndex = Number(event.target.value - 1);
    }

    navigateData() {
        this.onNavigateData.emit(this.searchIndex);
    }

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
}
