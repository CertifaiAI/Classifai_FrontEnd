import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { ImageLabelUrl, ImgLabelProps } from '../image-labelling.model';
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

@Component({
    selector: 'image-labelling-left-sidebar',
    templateUrl: './image-labelling-left-sidebar.component.html',
    styleUrls: ['./image-labelling-left-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingLeftSidebarComponent implements OnInit, OnChanges {
    @Input() _onChange!: ImgLabelProps;
    @Input() _currentUrl: ImageLabelUrl = '';
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    jsonSchema!: IconSchema;
    iconIndex!: number;

    constructor(
        private _imgLabelState: ImageLabellingActionService,
        private _annotateService: AnnotateSelectionService,
    ) {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    resetSelectedAnnotate = () => {
        this._annotateService.setState({ annotation: -1 });
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
                    hoverLabel: `Pointer`,
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
                          hoverLabel: `Rectangular Bounding Box`,
                          alt: `RectangularBB`,
                          toggleable: true,
                          onClick: () => {
                              this.resetSelectedAnnotate();
                              this._imgLabelState.setState({ draw: true, drag: false, scroll: false });
                          },
                      }
                    : {
                          imgPath: `../../../assets/icons/polygon.svg`,
                          hoverLabel: `Polygon`,
                          alt: `Polygon`,
                          toggleable: true,
                          onClick: () => {
                              this.resetSelectedAnnotate();
                              this._imgLabelState.setState({ draw: true, drag: false, scroll: false });
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
                    hoverLabel: `Eraser`,
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
                    hoverLabel: `Fit Center`,
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
                    hoverLabel: `Save`,
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
                        });
                    },
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        this.bindImagePath();
    }

    getIndex = (index: number): void => {
        this.iconIndex = index;
    };

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;
}
