import { IconSchema, Props, ThumbnailProps } from '../image-labelling-layout.model';
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
    // @Input() _selectedThumbnail: string;
    @Input() _onChange!: Props;
    @Output() _onClick: EventEmitter<ThumbnailProps> = new EventEmitter();
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
    jsonSchema!: IconSchema;
    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logosCenter: [
                {
                    imgPath: `${this.imgRelativePath}light-theme/previous.png`,
                    hoverLabel: `Pervious`,
                    alt: `Previous`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: -1 }),
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/next.png`,
                    hoverLabel: `Next`,
                    alt: `Next`,
                    onClick: () => this.emitParentEvent({ thumbnailAction: 1 }),
                },
            ],
            logosEnd: [
                {
                    imgPath: `${this.imgRelativePath}light-theme/undo.png`,
                    hoverLabel: `Undo`,
                    alt: `Undo`,
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/redo.png`,
                    hoverLabel: `Redo`,
                    alt: `Redo`,
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/zoom_in.png`,
                    hoverLabel: `Zoom In`,
                    alt: `Zoom In`,
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/zoom_out.png`,
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
