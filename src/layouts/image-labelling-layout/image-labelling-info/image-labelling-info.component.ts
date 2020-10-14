import { IconSchema } from 'src/shared/type-casting/icon/icon.model';
import { ImgLabelProps, ThumbnailProps } from '../image-labelling-layout.model';
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
    @Output() _onClick: EventEmitter<ThumbnailProps> = new EventEmitter();
    jsonSchema!: IconSchema;
    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logosCenter: [
                {
                    imgPath: `../../../assets/icons/previous.png`,
                    hoverLabel: `Pervious`,
                    alt: `Previous`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: -1 }),
                },
                {
                    imgPath: `../../../assets/icons/next.png`,
                    hoverLabel: `Next`,
                    alt: `Next`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: 1 }),
                },
            ],
            logosEnd: [
                {
                    imgPath: `../../../assets/icons/undo.png`,
                    hoverLabel: `Undo`,
                    alt: `Undo`,
                },
                {
                    imgPath: `../../../assets/icons/redo.png`,
                    hoverLabel: `Redo`,
                    alt: `Redo`,
                },
                {
                    imgPath: `../../../assets/icons/zoom_in.png`,
                    hoverLabel: `Zoom In`,
                    alt: `Zoom In`,
                },
                {
                    imgPath: `../../../assets/icons/zoom_out.png`,
                    hoverLabel: `Zoom Out`,
                    alt: `Zoom Out`,
                },
            ],
        };
    };

    emitParentEvent = <T extends ThumbnailProps>({ url, thumbnailAction }: T): void => {
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
