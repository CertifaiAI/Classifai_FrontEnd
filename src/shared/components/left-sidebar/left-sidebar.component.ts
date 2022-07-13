/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { CompleteMetadata, ImgLabelProps, TabsProps } from 'shared/types/labelling-type/image-labelling.model';

import { AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { IconSchema } from 'shared/types/icon/icon.model';
import { ImageLabellingActionService } from '../../../components/image-labelling/image-labelling-action.service';
import { MousrCursorService } from '../../services/mouse-cursor.service';
import { isEqual } from 'lodash-es';

@Component({
    selector: 'left-sidebar',
    templateUrl: 'left-sidebar.component.html',
    styleUrls: ['left-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftSidebarComponent implements OnInit, OnChanges {
    @Input() _onChange!: ImgLabelProps;
    @Input() _currentUrl: string = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Input() _clickAbilityToggleStatus: boolean = false;
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    @Output() _modalNoLabel = new EventEmitter();
    @Output() _clickAbilityToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() _removeAllRegions: EventEmitter<any> = new EventEmitter<any>();
    @Output() _setDefaultRegionsLength: EventEmitter<any> = new EventEmitter<any>();
    @Output() _lockAllRegions: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() _save: EventEmitter<any> = new EventEmitter<any>();
    jsonSchema!: IconSchema;
    iconIndex!: number;
    labelList: string[] = [];
    isCrossLineOn: boolean = false;
    isLockAllRegions: boolean = false;

    constructor(
        private _imgLabelState: ImageLabellingActionService,
        private _annotateService: AnnotateSelectionService,
        private _mouseCursorService: MousrCursorService,
    ) {}

    ngOnInit(): void {
        this.updateLabelList();
        this.bindImagePath();
    }

    updateLabelList = () => {
        if (this._currentUrl === '/imglabel/bndbox' || this._currentUrl === '/imglabel/seg') {
            this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
        } else {
            this.labelList = [];
        }
    };

    resetSelectedAnnotate = () => {
        this._annotateService.setState();
    };

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
                        this._imgLabelState.setState({ draw: false, drag: true, scroll: true });
                        this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
                    },
                },
                this._currentUrl === '/imglabel/bndbox'
                    ? {
                          imgPath: `assets/icons/rec_bounding_box.svg`,
                          hoverLabel: `leftSideBar.rectangularBB`,
                          alt: `RectangularBB`,
                          toggleable: true,
                          onClick: () => {
                              this.resetSelectedAnnotate();
                              this._imgLabelState.setState({
                                  draw: true,
                                  drag: false,
                                  scroll: false,
                                  crossLine: this.isCrossLineOn,
                              });
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
                                  this._imgLabelState.setState({ draw: true, drag: false, scroll: false });
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
                            this._imgLabelState.setState({
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
                        this._imgLabelState.setState({
                            draw: false,
                            drag: false,
                            fitCenter: false,
                            scroll: false,
                            clear: true,
                        });
                        this._imgLabelState.setState(null);
                        this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
                        if (this._currentUrl === 'audio') {
                            this._removeAllRegions.emit();
                        }
                    },
                },
                {
                    imgPath: `assets/icons/fit_center.svg`,
                    hoverLabel: `leftSideBar.fitCenter`,
                    alt: `Fit Center`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._imgLabelState.setState({ draw: false, drag: false, fitCenter: true, scroll: false });
                        this._imgLabelState.setState(null);
                        this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
                    },
                },
                {
                    imgPath: `assets/icons/length.svg`,
                    hoverLabel: `Set Default Region Length`,
                    alt: `Set Default Region Length`,
                    toggleable: false,
                    onClick: () => {
                        this._setDefaultRegionsLength.emit();
                    },
                },
                {
                    imgPath: `assets/icons/lock.svg`,
                    hoverLabel: `Lock Regions`,
                    alt: `Lock All Regions`,
                    toggleable: false,
                    onClick: () => {
                        this.isLockAllRegions = !this.isLockAllRegions;
                        this._lockAllRegions.emit(this.isLockAllRegions);
                    },
                },
                {
                    imgPath: `assets/icons/save.svg`,
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
                            keyInfo: false,
                        });
                        this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
                    },
                },
                {
                    imgPath: `assets/icons/info.svg`,
                    hoverLabel: `leftSideBar.info`,
                    alt: `KeyPoint`,
                    toggleable: false,
                    onClick: () => {
                        this.resetSelectedAnnotate();
                        this._imgLabelState.setState({
                            draw: false,
                            drag: false,
                            fitCenter: false,
                            scroll: false,
                            clear: false,
                            save: false,
                            keyInfo: true,
                        });
                        this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
                    },
                },
            ],
        };
    };

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
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
        if (index === 3) {
            return;
        }
        this.iconIndex = index;
    };

    showAlertNoLabel() {
        alert('No label exist yet. Please add new label.');
    }

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ altKey, key }: KeyboardEvent) {
        try {
            if (altKey && (key === 'z' || key === 'Z')) {
                this.resetSelectedAnnotate();
                this._imgLabelState.setState({ draw: false, drag: true, scroll: true });
                this.getIndex(1);
                this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
            } else if (altKey && (key === 'a' || key === 'A')) {
                this.resetSelectedAnnotate();
                this._imgLabelState.setState({ draw: true, drag: false, scroll: false, crossLine: this.isCrossLineOn });
                this.getIndex(2);
            } else if (altKey && (key === 'x' || key === 'X')) {
                this.resetSelectedAnnotate();
                this._imgLabelState.setState({ draw: false, drag: false, scroll: false, crossLine: false });
                this._mouseCursorService.setState({ default: true });
                this.getIndex(0);
                this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
            }
        } catch (err) {
            console.log(err);
        }
    }

    emitClickAbilityToggleStatus(status: boolean) {
        if (status) {
            this._clickAbilityToggle.emit(false);
        }
    }
}
