/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    @Output() _onExport = new EventEmitter();
    @Output() _onReload = new EventEmitter();

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
                        this._onClick.emit({ name: 'labellingProject.project', closed: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => {
                        this._onClick.emit({ name: 'labellingProject.label', closed: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => {
                        this._onClick.emit({ name: 'labellingProject.annotation', closed: false });
                    },
                },
                {
                    imgPath: `../../../assets/icons/statistic.svg`,
                    hoverLabel: `rightSideBar.statistic`,
                    alt: `Statistic`,
                    onClick: () => {},
                },
                {
                    imgPath: `../../../assets/icons/export.svg`,
                    hoverLabel: `rightSideBar.export`,
                    alt: `Export`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => {
                        this._onExport.emit();
                    },
                },
                {
                    imgPath: `../../../assets/icons/reload.svg`,
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
