import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImgLabelProps, ThumbnailInfoProps } from '../image-labelling.model';
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

@Component({
    selector: 'image-labelling-info',
    templateUrl: './image-labelling-info.component.html',
    styleUrls: ['./image-labelling-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingInfoComponent implements OnInit, OnChanges {
    @Input() _onChange!: ImgLabelProps;
    @Output() _onClick: EventEmitter<ThumbnailInfoProps> = new EventEmitter();
    jsonSchema!: IconSchema;
    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logosCenter: [
                {
                    imgPath: `../../../assets/icons/previous.svg`,
                    hoverLabel: `Pervious`,
                    alt: `Previous`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: -1 }),
                },
                {
                    imgPath: `../../../assets/icons/next.svg`,
                    hoverLabel: `Next`,
                    alt: `Next`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: 1 }),
                },
            ],
            logosEnd: [
                {
                    imgPath: `../../../assets/icons/undo.svg`,
                    hoverLabel: `Undo`,
                    alt: `Undo`,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/redo.svg`,
                    hoverLabel: `Redo`,
                    alt: `Redo`,
                    onClick: () => null,
                },
                // {
                //     imgPath: `../../../assets/icons/zoom_in.svg`,
                //     hoverLabel: `Zoom In`,
                //     alt: `Zoom In`,
                //     onClick: () => null,
                // },
                // {
                //     imgPath: `../../../assets/icons/zoom_out.svg`,
                //     hoverLabel: `Zoom Out`,
                //     alt: `Zoom Out`,
                //     onClick: () => null,
                // },
            ],
        };
    };

    emitParentEvent = ({ url, thumbnailAction }: ThumbnailInfoProps): void => {
        // console.log(url, thumbnailAction);
        this._onClick.emit({ url, thumbnailAction });
    };

    ngOnChanges(changes: SimpleChanges): void {
        const { totalNumThumbnail } = changes._onChange.currentValue;
        this._onChange.totalNumThumbnail = totalNumThumbnail;
        this.bindImagePath();
    }

    conditionalIconTheme = (): string => 'utility-icon-light';
}
