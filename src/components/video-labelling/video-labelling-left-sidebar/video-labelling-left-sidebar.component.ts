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
import { IconSchema } from '../../../shared/types/icon/icon.model';
import { AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { VideoLabellingActionService } from '../../video-labelling/video-labelling-action.service';
import {
    VideoLabelProps,
    VideoLabelUrl,
    CompleteMetadata,
    TabsProps,
} from '../../../shared/types/video-labelling/video-labelling.model';
import { isEqual } from 'lodash-es';

@Component({
    selector: 'video-labelling-left-sidebar',
    templateUrl: './video-labelling-left-sidebar.component.html',
    styleUrls: ['./video-labelling-left-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoLabellingLeftSidebarComponent implements OnInit, OnChanges {
    @Input() _onChange!: VideoLabelProps;
    @Input() _currentUrl: VideoLabelUrl = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    @Output() _modalNoLabel = new EventEmitter();
    labelList: string[] = [];
    jsonSchema!: IconSchema;
    iconIndex!: number;
    isCrossLineOn: boolean = false;

    constructor(
        private _annotateService: AnnotateSelectionService,
        private _videoLabelState: VideoLabellingActionService,
    ) {}

    ngOnInit() {
        this.bindImagePath();
        this.updateLabelList();
    }

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
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({ draw: false, drag: true, scroll: true });
                    },
                },
                this._currentUrl === '/videolabel/videobndbox'
                    ? {
                          imgPath: `assets/icons/rec_bounding_box.svg`,
                          hoverLabel: `leftSideBar.rectangularBB`,
                          alt: `RectangularBB`,
                          toggleable: true,
                          onClick: () => {
                              this.resetSelectedAnnotate();
                              this._videoLabelState.setState({ draw: true, drag: false, scroll: false });
                          },
                      }
                    : {
                          imgPath: `assets/icons/polygon.svg`,
                          hoverLabel: `leftSideBar.polygon`,
                          alt: `Polygon`,
                          toggleable: true,
                          onClick: () => {
                              if (this.labelList.length !== 0) {
                                  this.resetSelectedAnnotate();
                                  this._videoLabelState.setState({ draw: true, drag: false, scroll: false });
                              } else {
                                  this.showAlertNoLabel();
                              }
                          },
                      },
                {
                    imgPath: this.isCrossLineOn ? `assets/icons/indicator_on.svg` : `assets/icons/indicator.svg`,
                    hoverLabel: this.isCrossLineOn ? `leftSideBar.offCrossLine` : `leftSideBar.onCrossLine`,
                    alt: `Cross Guiding Line`,
                    toggleable: false,
                    onClick: () => {
                        this.isCrossLineOn = !this.isCrossLineOn;
                        this.bindImagePath();
                        if (this.iconIndex === 2) {
                            this._videoLabelState.setState({
                                draw: true,
                                drag: false,
                                scroll: false,
                                crossLine: this.isCrossLineOn,
                            });
                        }
                    },
                },
                {
                    imgPath: `assets/icons/eraser.svg`,
                    hoverLabel: `leftSideBar.eraser`,
                    alt: `Eraser`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({
                            draw: false,
                            drag: false,
                            clear: true,
                            fitCenter: false,
                            scroll: false,
                        });
                        this._videoLabelState.setState(null);
                    },
                },
                {
                    imgPath: `assets/icons/fit_center.svg`,
                    hoverLabel: `leftSideBar.fitCenter`,
                    alt: `Fit Center`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({ draw: false, drag: false, fitCenter: true, scroll: false });
                        this._videoLabelState.setState(null);
                    },
                },
                {
                    imgPath: `assets/icons/save.svg`,
                    hoverLabel: `leftSideBar.save`,
                    alt: `Save`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({
                            draw: false,
                            drag: false,
                            fitCenter: false,
                            scroll: false,
                            clear: false,
                            save: true,
                            keyInfo: false,
                        });
                    },
                },
                {
                    imgPath: `assets/icons/info.svg`,
                    hoverLabel: `leftSideBar.info`,
                    alt: `KeyPoint`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._videoLabelState.setState({
                            draw: false,
                            drag: false,
                            fitCenter: false,
                            scroll: false,
                            clear: false,
                            save: false,
                            keyInfo: true,
                        });
                    },
                },
            ],
        };
    };

    getIndex = (index: number): void => {
        if (index === 3) {
            return;
        }
        this.iconIndex = index;
    };

    resetSelectedAnnotate = () => {
        this._annotateService.setState();
    };

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;

    updateLabelList = () => {
        this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
    };

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    showAlertNoLabel() {
        alert('No label exist yet. Please add new label.');
    }
}
