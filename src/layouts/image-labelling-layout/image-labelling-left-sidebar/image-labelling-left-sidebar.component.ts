import { BoundingBoxStateService } from 'src/shared/services/bounding-box-state.service';
import { IconSchema } from 'src/shared/type-casting/icon/icon.model';
import { ImgLabelProps } from '../image-labelling-layout.model';
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
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    jsonSchema!: IconSchema;
    iconIndex!: number;

    constructor(private _bbState: BoundingBoxStateService) {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `../../../assets/icons/pointer.svg`,
                    hoverLabel: `Pointer`,
                    alt: `Pointer`,
                    toggleable: true,
                    onClick: (): void => {
                        this._bbState.setState({ draw: false, drag: true });
                    },
                },
                {
                    imgPath: `../../../assets/icons/move.svg`,
                    hoverLabel: `Move Image`,
                    alt: `Move Image`,
                    toggleable: true,
                    onClick: (): void => {
                        this._bbState.setState({ draw: false, drag: true });
                    },
                },
                {
                    imgPath: `../../../assets/icons/rec_bounding_box.svg`,
                    hoverLabel: `Rectangular Bounding Box`,
                    alt: `RectangularBB`,
                    toggleable: true,
                    onClick: (): void => {
                        this._bbState.setState({ draw: true, drag: false });
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
                    toggleable: true,
                },
                {
                    imgPath: `../../../assets/icons/fit_center.svg`,
                    hoverLabel: `Fit Center`,
                    alt: `Fit Center`,
                    toggleable: false,
                    onClick: (): void => {
                        this._bbState.setState({ draw: true, drag: false, fitCenter: true });
                    },
                },
                {
                    imgPath: `../../../assets/icons/save.svg`,
                    hoverLabel: `Save`,
                    alt: `Save`,
                    toggleable: false,
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

    conditionalIconTheme = (): string => `utility-icon-light-theme`;

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)', outline: 'darkgrey inset 0.1vw' } : null;
}
