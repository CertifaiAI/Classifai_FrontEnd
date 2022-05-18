/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { isEqual } from 'lodash-es';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'audio-labelling-left-sidebar',
    templateUrl: './audio-labelling-left-sidebar.component.html',
    styleUrls: ['./audio-labelling-left-sidebar.component.scss'],
})
export class AudioLabellingLeftSidebarComponent implements OnInit {
    jsonSchema!: IconSchema;
    iconIndex!: number;
    isLockAllRegions: boolean = false;
    @Output() _removeAllRegions: EventEmitter<any> = new EventEmitter<any>();
    @Output() _setDefaultRegionsLength: EventEmitter<any> = new EventEmitter<any>();
    @Output() _lockAllRegions: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() _save: EventEmitter<any> = new EventEmitter<any>();

    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `assets/icons/separator.svg`,
                    hoverLabel: ``,
                    alt: ``,
                    nonClickable: true,
                    toggleable: false,
                    onClick: () => null,
                },
                {
                    imgPath: `assets/icons/eraser.svg`,
                    hoverLabel: `leftSideBar.eraser`,
                    alt: `Eraser`,
                    toggleable: false,
                    onClick: () => {
                        this._removeAllRegions.emit();
                    },
                },
                {
                    imgPath: `assets/icons/length.svg`,
                    hoverLabel: `Set Default Region Length`,
                    alt: `Set Default Region Length`,
                    toggleable: false,
                    onClick: () => {
                        this._setDefaultRegionsLength.emit();
                    },
                },
                {
                    imgPath: `assets/icons/lock.svg`,
                    hoverLabel: `Lock Regions`,
                    alt: `Lock All Regions`,
                    toggleable: false,
                    onClick: () => {
                        this.isLockAllRegions = !this.isLockAllRegions;
                        this._lockAllRegions.emit(this.isLockAllRegions);
                    },
                },
                {
                    imgPath: `assets/icons/save.svg`,
                    hoverLabel: `leftSideBar.save`,
                    alt: `Save`,
                    toggleable: false,
                    onClick: () => {
                        this._save.emit();
                    },
                },
                {
                    imgPath: `assets/icons/info.svg`,
                    hoverLabel: `leftSideBar.info`,
                    alt: `KeyPoint`,
                    toggleable: false,
                    onClick: () => {},
                },
            ],
        };
    };

    getIndex = (index: number): void => {
        if (index === 3) {
            return;
        }
        this.iconIndex = index;
    };

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;
}
