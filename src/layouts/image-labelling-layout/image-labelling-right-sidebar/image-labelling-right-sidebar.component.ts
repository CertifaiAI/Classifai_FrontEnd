import { IimageLabellingSchema, Props, TabsProps } from '../image-labelling-layout.model';
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
    OnChanges,
    ChangeDetectionStrategy,
} from '@angular/core';

@Component({
    selector: 'image-labelling-right-sidebar',
    templateUrl: './image-labelling-right-sidebar.component.html',
    styleUrls: ['./image-labelling-right-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingRightSidebarComponent implements OnInit, OnChanges {
    // @Input() _theme: string;
    @Input() _onChange!: Props;
    @Output() _onClick: EventEmitter<TabsProps> = new EventEmitter();
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
    jsonSchema!: IimageLabellingSchema;

    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `${this.imgRelativePath}light-theme/folder.png`,
                    hoverLabel: `Folder / Files`,
                    alt: `Folder`,
                    // inputType: 'file',
                    // accept: 'image/x-png,image/jpeg',
                    // onUpload: () => this._onClick.emit(),
                    onClick: () => this._onClick.emit({ name: 'project', closed: false }),
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/label.png`,
                    hoverLabel: `Label`,
                    alt: `Label`,
                    onClick: () => this._onClick.emit({ name: 'label', closed: false }),
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/bounding_box.png`,
                    hoverLabel: `Annotation`,
                    alt: `Annotation`,
                    onClick: () => this._onClick.emit({ name: 'annotation', closed: false }),
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/statistic.png`,
                    hoverLabel: `Statistic`,
                    alt: `Statistic`,
                    // onClick: () => this._onClick.emit(null),
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        const { theme } = changes._onChange.currentValue;
        // console.log(currentValue);
        this._onChange.theme = theme;
        this.bindImagePath();
    }

    conditionalIconTheme = (): string =>
        this._onChange.theme === 'light' ? 'utility-icon-light' : 'utility-icon-dark';
}
