import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IconSchema } from 'src/shared/types/icon/icon.model';
import { AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { VideoLabellingActionService } from '../../video-labelling/video-labelling-action.service';
import { isEqual } from 'lodash-es';
import { CompleteMetadata, ImageLabelUrl, ImgLabelProps, TabsProps } from '../../image-labelling/image-labelling.model';

@Component({
    selector: 'video-labelling-left-sidebar',
    templateUrl: './video-labelling-left-sidebar.component.html',
    styleUrls: ['./video-labelling-left-sidebar.component.scss'],
})
export class VideoLabellingLeftSidebarComponent implements OnInit, OnChanges {
    @Input() _onChange!: ImgLabelProps;
    @Input() _currentUrl: ImageLabelUrl = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    @Output() _openInfo = new EventEmitter();

    labelList: string[] = [];
    jsonSchema!: IconSchema;
    iconIndex!: number;

    constructor(
        private _annotateService: AnnotateSelectionService,
        private _videoLabelState: VideoLabellingActionService,
    ) {}

    ngOnInit() {
        this.bindImagePath();
        this.updateLabelList();
    }

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        this.bindImagePath();
        if (
            changes._tabStatus &&
            this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
        ) {
            const { currentValue }: { currentValue: TabsProps<CompleteMetadata>[] } = changes._tabStatus;
            this._tabStatus = [...currentValue];
            this.updateLabelList();
        }
    }

    updateLabelList = () => {
        this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
    };

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `../../../assets/icons/separator.svg`,
                    hoverLabel: ``,
                    alt: ``,
                    nonClickable: true,
                    toggleable: false,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/pointer.svg`,
                    hoverLabel: 'leftSideBar.pointer',
                    alt: `Pointer`,
                    toggleable: true,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/rec_bounding_box.svg`,
                    hoverLabel: `leftSideBar.rectangularBB`,
                    alt: `RectangularBB`,
                    toggleable: true,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({ draw: true, drag: false, scroll: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/eraser.svg`,
                    hoverLabel: `leftSideBar.eraser`,
                    alt: `Eraser`,
                    toggleable: false,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/fit_center.svg`,
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
