/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

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
import { ImgLabelProps, TabsProps } from 'shared/types/image-labelling/image-labelling.model';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'image-labelling-right-sidebar',
    templateUrl: './image-labelling-right-sidebar.component.html',
    styleUrls: ['./image-labelling-right-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingRightSidebarComponent implements OnInit, OnChanges {
    @Input() _onChange!: ImgLabelProps;
    @Output() _onClick: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onExport = new EventEmitter();
    @Output() _onReload = new EventEmitter();

    jsonSchema!: IconSchema;

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `assets/icons/folder.svg`,
                    hoverLabel: `rightSideBar.folderOrFiles`,
                    alt: `Folder`,
                    // inputType: 'file',
                    // accept: 'image/x-png,image/jpeg',
                    // onUpload: () => this._onClick.emit(),
                    onClick: () => {
                        this._onClick.emit({ name: 'labellingProject.project', closed: false });
                    },
                },
                {
                    imgPath: `assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => {
                        this._onClick.emit({ name: 'labellingProject.label', closed: false });
                    },
                },
                {
                    imgPath: `assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => {
                        this._onClick.emit({ name: 'labellingProject.annotation', closed: false });
                    },
                },
                {
                    imgPath: `assets/icons/statistic.svg`,
                    hoverLabel: `rightSideBar.statistic`,
                    alt: `Statistic`,
                    onClick: () => {
                        console.log('This feature is not available yet');
                    },
                },
                {
                    imgPath: `assets/icons/export.svg`,
                    hoverLabel: `rightSideBar.export`,
                    alt: `Export`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => {
                        this._onExport.emit();
                    },
                },
                {
                    imgPath: `assets/icons/reload.svg`,
                    hoverLabel: `rightSideBar.reload`,
                    alt: `Reload`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => {
                        this._onReload.emit();
                    },
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        this.bindImagePath();
    }

    conditionalIconTheme = (): string => 'utility-icon-light';
}
