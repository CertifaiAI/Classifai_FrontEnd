/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { ImgLabelProps, TabsProps } from 'shared/types/image-labelling/image-labelling.model';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'audio-labelling-right-sidebar',
    templateUrl: './audio-labelling-right-sidebar.component.html',
    styleUrls: ['./audio-labelling-right-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioLabellingRightSidebarComponent implements OnInit {
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
                // {
                //     imgPath: `assets/icons/folder.svg`,
                //     hoverLabel: `rightSideBar.folderOrFiles`,
                //     alt: `Folder`,
                //     onClick: () => {
                //         if (this.toggleProject) {
                //             this._onClick.emit({ name: 'labellingProject.project', closed: true });
                //             this.toggleProject = false;
                //         } else {
                //             this._onClick.emit({ name: 'labellingProject.project', closed: false });
                //             this.toggleProject = true;
                //         }
                //     },
                // },
                // {
                //     imgPath: `assets/icons/tag.svg`,
                //     hoverLabel: `rightSideBar.label`,
                //     alt: `Label`,
                //     onClick: () => {
                //         if (this.toggleLabel) {
                //             this._onClick.emit({ name: 'labellingProject.label', closed: true });
                //             this.toggleLabel = false;
                //         } else {
                //             this._onClick.emit({ name: 'labellingProject.label', closed: false });
                //             this.toggleLabel = true;
                //         }
                //     },
                // },
                // {
                //     imgPath: `assets/icons/bounding_box.svg`,
                //     hoverLabel: `rightSideBar.annotation`,
                //     alt: `Annotation`,
                //     onClick: () => {
                //         if (this.toggleAnnotation) {
                //             this._onClick.emit({ name: 'labellingProject.annotation', closed: true });
                //             this.toggleAnnotation = false;
                //         } else {
                //             this._onClick.emit({ name: 'labellingProject.annotation', closed: false });
                //             this.toggleAnnotation = true;
                //         }
                //     },
                // },
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
                // {
                //     imgPath: `assets/icons/reload.svg`,
                //     hoverLabel: `rightSideBar.reload`,
                //     alt: `Reload`,
                //     style: 'padding: 1.5vh 0.5vw;',
                //     onClick: () => {
                //         this._onReload.emit();
                //     },
                // },
            ],
        };
    };

    conditionalIconTheme = (): string => 'utility-icon-light';
}
