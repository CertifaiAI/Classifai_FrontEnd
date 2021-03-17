import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImgLabelProps, TabsProps } from '../image-labelling.model';
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
                    hoverLabel: `rightSideBar.folderOrFiles`,
                    alt: `Folder`,
                    // inputType: 'file',
                    // accept: 'image/x-png,image/jpeg',
                    // onUpload: () => this._onClick.emit(),
                    onClick: () => {
                        this._onClick.emit({ name: 'project', closed: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => {
                        this._onClick.emit({ name: 'label', closed: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => {
                        this._onClick.emit({ name: 'annotation', closed: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/statistic.svg`,
                    hoverLabel: `rightSideBar.statistic`,
                    alt: `Statistic`,
                    onClick: () => {},
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        this.bindImagePath();
    }

    conditionalIconTheme = (): string => 'utility-icon-light';
}
