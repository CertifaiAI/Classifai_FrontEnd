import { IconSchema, Props } from '../image-labelling-layout.model';
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
import { BoundingBoxStateService } from 'src/shared/services/bounding-box-state.service';

@Component({
    selector: 'image-labelling-left-sidebar',
    templateUrl: './image-labelling-left-sidebar.component.html',
    styleUrls: ['./image-labelling-left-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingLeftSidebarComponent implements OnInit, OnChanges {
    // @Input() _theme: string;
    // @Input() _status: boolean;
    @Input() _onChange!: Props;
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
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
                    imgPath: `${this.imgRelativePath}light-theme/pointer.png`,
                    hoverLabel: `Pointer`,
                    alt: `Pointer`,
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/move.png`,
                    hoverLabel: `Move Image`,
                    alt: `Move Image`,
                    onClick: (): void => {
                        this._bbState.setState({ draw: false, drag: true });
                    },
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/rec_bounding_box.png`,
                    hoverLabel: `Rectangular Bounding Box`,
                    alt: `RectangularBB`,
                    onClick: (): void => {
                        this._bbState.setState({ draw: true, drag: false });
                    },
                },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/bounding_box.png`,
                //   hoverLabel: `Bounding Box`,
                //   alt: `BoundingBox`,
                // },
                // {
                //     imgPath: `${this.imgRelativePath}light-theme/polygon.png`,
                //     hoverLabel: `Polygon`,
                //     alt: `Polygon`,
                // },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/auto_select.png`,
                //   hoverLabel: `Auto Select`,
                //   alt: `AutoSelect`,
                // },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/brush_segmentation.png`,
                //   hoverLabel: `Brush Segmentation`,
                //   alt: `BrushSeg`,
                // },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/key_point.png`,
                //   hoverLabel: `Key Point`,
                //   alt: `KeyPoint`,
                // },
                {
                    imgPath: `${this.imgRelativePath}light-theme/eraser.png`,
                    hoverLabel: `Eraser`,
                    alt: `Eraser`,
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/fit_center.png`,
                    hoverLabel: `Fit Center`,
                    alt: `Fit Center`,
                },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/move_img_px.png`,
                //   hoverLabel: `Move Image by Pixel`,
                //   alt: `Move Image by Pixel`,
                // },
                {
                    imgPath: `${this.imgRelativePath}light-theme/save.png`,
                    hoverLabel: `Save`,
                    alt: `Save`,
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        const { theme } = changes._onChange.currentValue;
        // console.log(currentValue);
        this._onChange.theme = theme;
        this.bindImagePath();
    }

    getIndex = (index: number): void => {
        this.iconIndex = index;
    };

    conditionalIconTheme = (): string => `utility-icon-light-theme`;

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex
            ? this._onChange.theme === 'light-theme'
                ? { background: 'rgb(59 59 59)', outline: 'darkgrey inset 0.1vw' }
                : { background: 'darkgray', outline: 'cyan inset 0.1vw' }
            : null;
}
