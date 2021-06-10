/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { CompleteMetadata, ImageLabelUrl, ImgLabelProps, TabsProps } from '../image-labelling.model';
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges,
    ChangeDetectionStrategy,
} from '@angular/core';
import { isEqual } from 'lodash-es';

@Component({
    selector: 'image-labelling-left-sidebar',
    templateUrl: './image-labelling-left-sidebar.component.html',
    styleUrls: ['./image-labelling-left-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingLeftSidebarComponent implements OnInit, OnChanges {
    @Input() _onChange!: ImgLabelProps;
    @Input() _currentUrl: ImageLabelUrl = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    @Output() _openInfo = new EventEmitter();
    @Output() _modalNoLabel = new EventEmitter();
    jsonSchema!: IconSchema;
    iconIndex!: number;
    labelList: string[] = [];

    constructor(
        private _imgLabelState: ImageLabellingActionService,
        private _annotateService: AnnotateSelectionService,
    ) {}

    ngOnInit(): void {
        this.updateLabelList();
        this.bindImagePath();
    }

    updateLabelList = () => {
        this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
    };

    resetSelectedAnnotate = () => {
        this._annotateService.setState();
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
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._imgLabelState.setState({ draw: false, drag: true, scroll: true });
                    },
                },
                // {
                //     imgPath: `../../../assets/icons/move.svg`,
                //     hoverLabel: `Move Image`,
                //     alt: `Move Image`,
                //     toggleable: true,
                //     onClick: () => {
                //         this._imgLabelState.setState({ draw: false, drag: true, scroll: false });
                //     },
                // },
                this._currentUrl === '/imglabel/bndbox'
                    ? {
                          imgPath: `../../../assets/icons/rec_bounding_box.svg`,
                          hoverLabel: `leftSideBar.rectangularBB`,
                          alt: `RectangularBB`,
                          toggleable: true,
                          onClick: () => {
                              this.resetSelectedAnnotate();
                              this._imgLabelState.setState({ draw: true, drag: false, scroll: false });
                          },
                      }
                    : {
                          imgPath: `../../../assets/icons/polygon.svg`,
                          hoverLabel: `leftSideBar.polygon`,
                          alt: `Polygon`,
                          toggleable: true,
                          onClick: () => {
                              if (this.labelList.length !== 0) {
                                  this.resetSelectedAnnotate();
                                  this._imgLabelState.setState({ draw: true, drag: false, scroll: false });
                              } else {
                                  this.showAlertNoLabel();
                              }
                          },
                      },
                // {
                //   imgPath: `../../../assets/icons/bounding_box.svg`,
                //   hoverLabel: `Bounding Box`,
                //   alt: `BoundingBox`,
                // },
                // {
                //     imgPath: `../../../assets/icons/polygon.svg`,
                //     hoverLabel: `Polygon`,
                //     alt: `Polygon`,
                // },
                // {
                //   imgPath: `../../../assets/icons/auto_select.svg`,
                //   hoverLabel: `Auto Select`,
                //   alt: `AutoSelect`,
                // },
                // {
                //   imgPath: `../../../assets/icons/brush_segmentation.svg`,
                //   hoverLabel: `Brush Segmentation`,
                //   alt: `BrushSeg`,
                // },
                // {
                //   imgPath: `../../../assets/icons/key_point.svg`,
                //   hoverLabel: `Key Point`,
                //   alt: `KeyPoint`,
                // },
                {
                    imgPath: `../../../assets/icons/eraser.svg`,
                    hoverLabel: `leftSideBar.eraser`,
                    alt: `Eraser`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._imgLabelState.setState({
                            draw: false,
                            drag: false,
                            fitCenter: false,
                            scroll: false,
                            clear: true,
                        });
                        this._imgLabelState.setState(null);
                    },
                },
                {
                    imgPath: `../../../assets/icons/fit_center.svg`,
                    hoverLabel: `leftSideBar.fitCenter`,
                    alt: `Fit Center`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._imgLabelState.setState({ draw: false, drag: false, fitCenter: true, scroll: false });
                        this._imgLabelState.setState(null);
                    },
                },
                {
                    imgPath: `../../../assets/icons/save.svg`,
                    hoverLabel: `leftSideBar.save`,
                    alt: `Save`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._imgLabelState.setState({
                            draw: false,
                            drag: false,
                            fitCenter: false,
                            scroll: false,
                            clear: false,
                            save: true,
                        });
                        // this._imgLabelState.setState(null);
                    },
                },
                {
                    imgPath: `../../../assets/icons/info.svg`,
                    hoverLabel: `leftSideBar.info`,
                    alt: `KeyPoint`,
                    toggleable: false,
                    onClick: () => {
                        this._openInfo.emit();
                    },
                },
            ],
        };
    };

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

    getIndex = (index: number): void => {
        this.iconIndex = index;
    };

    showAlertNoLabel() {
        alert('No label exist yet. Please add new label.');
    }

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;
}
