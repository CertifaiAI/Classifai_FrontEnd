import { IconSchema } from 'src/shared/type-casting/icon/icon.model';
import { ImgLabelProps, TabsProps } from '../image-labelling-layout.model';
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
    @Input() _onChange!: ImgLabelProps;
    @Output() _onClick: EventEmitter<TabsProps> = new EventEmitter();
    jsonSchema!: IconSchema;

    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `../../../assets/icons/folder.svg`,
                    hoverLabel: `Folder / Files`,
                    alt: `Folder`,
                    // inputType: 'file',
                    // accept: 'image/x-png,image/jpeg',
                    // onUpload: () => this._onClick.emit(),
                    onClick: () => this._onClick.emit({ name: 'project', closed: false }),
                },
                {
                    imgPath: `../../../assets/icons/label.svg`,
                    hoverLabel: `Label`,
                    alt: `Label`,
                    onClick: () => this._onClick.emit({ name: 'label', closed: false }),
                },
                {
                    imgPath: `../../../assets/icons/bounding_box.svg`,
                    hoverLabel: `Annotation`,
                    alt: `Annotation`,
                    onClick: () => this._onClick.emit({ name: 'annotation', closed: false }),
                },
                {
                    imgPath: `../../../assets/icons/statistic.svg`,
                    hoverLabel: `Statistic`,
                    alt: `Statistic`,
                    // onClick: () => this._onClick.emit(null),
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        this.bindImagePath();
    }

    conditionalIconTheme = (): string => 'utility-icon-light';
}
