/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges,
    ChangeDetectionStrategy,
    HostListener,
} from '@angular/core';
import { isEqual } from 'lodash-es';
import {
    ImgLabelProps,
    ImageLabelUrl,
    TabsProps,
    CompleteMetadata,
} from 'shared/types/image-labelling/image-labelling.model';
import { AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { IconSchema } from 'shared/types/icon/icon.model';
import { MousrCursorService } from '../../../shared/services/mouse-cursor.service';

@Component({
    selector: 'tabular-labelling-left-sidebar',
    templateUrl: './tabular-labelling-left-sidebar.component.html',
    styleUrls: ['./tabular-labelling-left-sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabularLabellingLeftSidebarComponent implements OnInit, OnChanges {
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _toggleTabularTable: EventEmitter<any> = new EventEmitter();
    @Output() _toggleLabels: EventEmitter<any> = new EventEmitter();
    @Output() _toggleConditions: EventEmitter<any> = new EventEmitter();
    @Output() _toggleSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() _modalNoLabel = new EventEmitter();
    jsonSchema!: IconSchema;
    iconIndex!: number;
    labelList: string[] = [];
    isCrossLineOn: boolean = false;

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
                    imgPath: `assets/icons/tag.svg`,
                    hoverLabel: `leftSideBar.label`,
                    alt: `Label`,
                    onClick: () => {
                        this._toggleLabels.emit();
                    },
                },
                {
                    imgPath: `assets/icons/conditions.svg`,
                    hoverLabel: `leftSideBar.conditions`,
                    alt: `Conditions`,
                    onClick: () => {
                        this._toggleConditions.emit();
                    },
                },
                {
                    imgPath: `assets/icons/table.svg`,
                    hoverLabel: `rightSideBar.table`,
                    alt: `Table`,
                    onClick: () => {
                        this._toggleTabularTable.emit();
                    },
                },
                {
                    imgPath: `assets/icons/save.svg`,
                    hoverLabel: `leftSideBar.save`,
                    alt: `Save`,
                    toggleable: false,
                    onClick: () => {
                        this._toggleSave.emit();
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

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
        this.bindImagePath();
        if (
            changes._tabStatus &&
            this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
        ) {
            const { currentValue }: { currentValue: TabsProps<CompleteMetadata>[] } = changes._tabStatus;
            this._tabStatus = [...currentValue];
        }
    }

    getIndex = (index: number): void => {
        if (index === 3) {
            return;
        }
        this.iconIndex = index;
    };

    showAlertNoLabel() {
        alert('No label exist yet. Please add new label.');
    }

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;

    // @HostListener('window:keydown', ['$event'])
    // keyStrokeEvent({ altKey, key }: KeyboardEvent) {
    //     try {
    //         if (altKey && (key === 'z' || key === 'Z')) {
    //             this.resetSelectedAnnotate();
    //             this._imgLabelState.setState({ draw: false, drag: true, scroll: true });
    //             this.getIndex(1);
    //             this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
    //         } else if (altKey && (key === 'a' || key === 'A')) {
    //             this.resetSelectedAnnotate();
    //             this._imgLabelState.setState({ draw: true, drag: false, scroll: false, crossLine: this.isCrossLineOn });
    //             this.getIndex(2);
    //         } else if (altKey && (key === 'x' || key === 'X')) {
    //             this.resetSelectedAnnotate();
    //             this._imgLabelState.setState({ draw: false, drag: false, scroll: false, crossLine: false });
    //             this._mouseCursorService.setState({ default: true });
    //             this.getIndex(0);
    //             this.emitClickAbilityToggleStatus(this._clickAbilityToggleStatus);
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
}
