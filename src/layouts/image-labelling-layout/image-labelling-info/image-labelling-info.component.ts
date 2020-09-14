import { IimageLabellingSchema, Props } from '../image-labelling-layout.model';
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
    styleUrls: ['./image-labelling-info.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingInfoComponent implements OnInit, OnChanges {
    // @Input() _selectedThumbnail: string;
    @Input() _onChange!: Props;
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
    jsonSchema!: IimageLabellingSchema;
    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logoCenter: [
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/previous.png`,
                    hoverLabel: `Pervious`,
                    alt: `Previous`,
                },
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/next.png`,
                    hoverLabel: `Next`,
                    alt: `Next`,
                },
            ],
            logoEnd: [
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/undo.png`,
                    hoverLabel: `Undo`,
                    alt: `Undo`,
                },
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/redo.png`,
                    hoverLabel: `Redo`,
                    alt: `Redo`,
                },
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/zoom_in.png`,
                    hoverLabel: `Zoom In`,
                    alt: `Zoom In`,
                },
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/zoom_out.png`,
                    hoverLabel: `Zoom Out`,
                    alt: `Zoom Out`,
                },
            ],
        };
    };

    emitParentUrl(url: string): void {
        url ? this._navigate.emit(url) : null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { theme, totalNumThumbnail } = changes._onChange.currentValue;
        // console.log(currentValue);
        this._onChange.theme = theme;
        this._onChange.totalNumThumbnail = totalNumThumbnail;
        this.bindImagePath();
    }

    conditionalIconTheme = (): string =>
        this._onChange.theme === 'light' ? 'utility-icon-light' : 'utility-icon-dark';
}
