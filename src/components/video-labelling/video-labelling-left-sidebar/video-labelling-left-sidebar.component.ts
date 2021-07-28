import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IconSchema } from '../../../shared/types/icon/icon.model';
import { AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { VideoLabellingActionService } from '../../video-labelling/video-labelling-action.service';

@Component({
    selector: 'video-labelling-left-sidebar',
    templateUrl: './video-labelling-left-sidebar.component.html',
    styleUrls: ['./video-labelling-left-sidebar.component.scss'],
})
export class VideoLabellingLeftSidebarComponent implements OnInit, OnChanges {
    labelList: string[] = [];
    jsonSchema!: IconSchema;
    iconIndex!: number;

    constructor(
        private _annotateService: AnnotateSelectionService,
        private _videoLabelState: VideoLabellingActionService,
    ) {}

    ngOnInit() {
        this.bindImagePath();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `assets/icons/separator.svg`,
                    hoverLabel: ``,
                    alt: ``,
                    nonClickable: true,
                    toggleable: false,
                    onClick: () => null,
                },
                {
                    imgPath: `assets/icons/pointer.svg`,
                    hoverLabel: 'leftSideBar.pointer',
                    alt: `Pointer`,
                    toggleable: true,
                    onClick: () => null,
                },
                {
                    imgPath: `assets/icons/rec_bounding_box.svg`,
                    hoverLabel: `leftSideBar.rectangularBB`,
                    alt: `RectangularBB`,
                    toggleable: true,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({ draw: true, drag: false, scroll: false });
                    },
                },
                {
                    imgPath: `assets/icons/eraser.svg`,
                    hoverLabel: `leftSideBar.eraser`,
                    alt: `Eraser`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({ draw: false, drag: false, clear: true });
                    },
                },
                {
                    imgPath: `assets/icons/fit_center.svg`,
                    hoverLabel: `leftSideBar.fitCenter`,
                    alt: `Fit Center`,
                    toggleable: false,
                    onClick: () => null,
                },
            ],
        };
    };

    getIndex = (index: number): void => {
        this.iconIndex = index;
    };

    resetSelectedAnnotate = () => {
        this._annotateService.setState();
    };

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;
}
