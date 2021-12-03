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
    @Input() _tabClosedStatus!: TabsProps;
    @Output() _onClick: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onExport = new EventEmitter();
    @Output() _onReload = new EventEmitter();
    @Output() _onOpenProjectStats = new EventEmitter();
    @Output() _onAddImage = new EventEmitter();

    jsonSchema!: IconSchema;
    toggleProject: boolean = true;
    toggleLabel: boolean = true;
    toggleAnnotation: boolean = true;

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
                        if (this.toggleProject) {
                            this._onClick.emit({ name: 'labellingProject.project', closed: true });
                            this.toggleProject = false;
                        } else {
                            this._onClick.emit({ name: 'labellingProject.project', closed: false });
                            this.toggleProject = true;
                        }
                    },
                },
                {
                    imgPath: `assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => {
                        if (this.toggleLabel) {
                            this._onClick.emit({ name: 'labellingProject.label', closed: true });
                            this.toggleLabel = false;
                        } else {
                            this._onClick.emit({ name: 'labellingProject.label', closed: false });
                            this.toggleLabel = true;
                        }
                    },
                },
                {
                    imgPath: `assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => {
                        if (this.toggleAnnotation) {
                            this._onClick.emit({ name: 'labellingProject.annotation', closed: true });
                            this.toggleAnnotation = false;
                        } else {
                            this._onClick.emit({ name: 'labellingProject.annotation', closed: false });
                            this.toggleAnnotation = true;
                        }
                    },
                },
                {
                    imgPath: `assets/icons/statistic.svg`,
                    hoverLabel: `rightSideBar.statistic`,
                    alt: `Statistic`,
                    onClick: () => {
                        this._onOpenProjectStats.emit();
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
                {
                    imgPath: `assets/icons/add_image.svg`,
                    hoverLabel: `rightSideBar.addImageFiles`,
                    alt: `Add Images`,
                    style: 'padding: 1.4vh 0.4vw;',
                    onClick: () => {
                        this._onAddImage.emit();
                    },
                },
            ],
        };
    };

    ngOnChanges(changes: SimpleChanges): void {
        this.bindImagePath();

        if (this._tabClosedStatus) {
            if (this._tabClosedStatus.name === 'labellingProject.project') {
                this.toggleProject = !this._tabClosedStatus.closed;
            }

            if (this._tabClosedStatus.name === 'labellingProject.label') {
                this.toggleLabel = !this._tabClosedStatus.closed;
            }

            if (this._tabClosedStatus.name === 'labellingProject.annotation') {
                this.toggleAnnotation = !this._tabClosedStatus.closed;
            }
        }
    }

    conditionalIconTheme = (): string => 'utility-icon-light';
}
