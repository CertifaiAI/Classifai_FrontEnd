/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    ImgLabelProps,
    BboxMetadata,
    PolyMetadata,
    CompleteMetadata,
    TabsProps,
    EventEmitter_ThumbnailDetails,
    SelectedLabelProps,
    ChangeAnnotationLabel,
    Boundingbox,
    Polygons,
} from 'shared/types/image-labelling/image-labelling.model';
import { AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { LanguageService } from 'shared/services/language.service';
import { UndoRedoService } from 'shared/services/undo-redo.service';
import { HTMLElementEvent } from 'shared/types/field/field.model';
import { ImageLabellingActionService } from '../../image-labelling/image-labelling-action.service';
import { LabelColorServices } from '../../../shared/services/label-color.services';
import { Labels } from '../../../shared/types/dataset-layout/data-set-layout.model';
import { label } from '../../../shared/types/tabular-labelling/tabular-labelling.model';
import { Key } from 'readline';

@Component({
    selector: 'tabular-labelling-project',
    templateUrl: './tabular-labelling-project.component.html',
    styleUrls: ['./tabular-labelling-project.component.scss'],
})
export class TabularLabellingProjectComponent implements OnInit, OnDestroy {
    @Input() annotations!: label[];
    @Input() tempLabels!: label[];
    @Output() onRemoveAnnotation: EventEmitter<label> = new EventEmitter();
    @Output() onSearchLabel: EventEmitter<label> = new EventEmitter();
    @Output() onChooseLabel: EventEmitter<label> = new EventEmitter();
    displayInputLabel: boolean = false;
    inputLabel: string = '';
    selectedLabel: string = '';
    unsubscribe$: Subject<any> = new Subject();
    invalidInput: boolean = false;

    constructor(
        private _languageService: LanguageService,
        private _undoRedoService: UndoRedoService,
        private _labelColorService: LabelColorServices,
    ) {}

    ngOnInit(): void {}

    chooseLabel(label: label) {
        this.onChooseLabel.emit(label);
    }

    searchLabel(label: label) {
        this.onSearchLabel.emit(label);
    }

    removeAnnotation(event: MouseEvent, annotation: label) {
        event.preventDefault();
        this.onRemoveAnnotation.emit(annotation);
    }

    // updateLabelList = () => {
    //     this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
    //     this.pickRandomColorForLabel();
    // };
    //
    // onClose = (tab: TabsProps): void => {
    //     this._onClose.emit({ name: tab.name, closed: true });
    // };
    //
    // onClick = (thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number): void => {
    //     this._onClickThumbnail.emit({ ...thumbnail, thumbnailIndex });
    //     // after switch photo display, also reset selectedIndexAnnotation & selectedLabel
    //     this.selectedIndexAnnotation = -1;
    //     this.selectedLabel = '';
    // };
    //
    // onDisplayInputModal = (): void => {
    //     this.displayInputLabel = !this.displayInputLabel;
    //     this.inputLabel = '';
    // };
    //
    // validateInputLabel = ({ target }: HTMLElementEvent<HTMLTextAreaElement>): void => {
    //     const { value } = target;
    //     const valTrimmed = value.trim();
    //     if (valTrimmed) {
    //         const validateVal: boolean = valTrimmed.match(/^[a-zA-Z0-9-]*$/) ? true : false;
    //         if (validateVal) {
    //             const isInvalidLabel: boolean = this._tabStatus.some(
    //                 ({ label_list }) =>
    //                     label_list && label_list.length && label_list.some((label) => label === valTrimmed),
    //             );
    //             if (!isInvalidLabel) {
    //                 this.invalidInput = false;
    //                 const label_lists = this._tabStatus
    //                     .map(({ label_list }) => (label_list ? label_list : []))
    //                     .filter((tab) => tab.length > 0)[0];
    //                 this._onEnterLabel.emit({ action: 1, label_list: label_lists ? [...label_lists, value] : [value] });
    //                 this.displayInputLabel = false;
    //                 this.inputLabel = '';
    //             } else {
    //                 this.invalidInput = true;
    //                 console.error(`Invalid existing label input`);
    //             }
    //         } else {
    //             this.invalidInput = true;
    //             console.error(`Invalid input value`);
    //         }
    //     }
    // };
    //
    // inputLabelChange(text: string) {
    //     this.labelList = this._tabStatus[1].label_list
    //         ? this._tabStatus[1].label_list?.filter((label) => label.includes(text))
    //         : [];
    // }
    //
    // onDeleteLabel = (selectedLabel: string): void => {
    //     let isLabelExist = false;
    //     this._thumbnailList.forEach((thumbnail) => {
    //         if (thumbnail.bnd_box) {
    //             thumbnail.bnd_box.forEach((bndbox) => {
    //                 bndbox.label === selectedLabel && (isLabelExist = true);
    //             });
    //         }
    //         if (thumbnail.polygons) {
    //             thumbnail.polygons.forEach((polygon) => {
    //                 polygon.label === selectedLabel && (isLabelExist = true);
    //             });
    //         }
    //     });
    //     if (isLabelExist) {
    //         this._languageService._translate.get('labelExist').subscribe((translated) => {
    //             alert(translated);
    //         });
    //     } else {
    //         const [{ label_list }] = this._tabStatus.filter((tab) => tab.label_list);
    //         this._onClickLabel.emit({
    //             selectedLabel,
    //             label_list: label_list && label_list.length > 0 ? label_list : [],
    //             action: 0,
    //         });
    //     }
    //     this._refreshLabelColor.emit();
    // };
    //
    // onClickLabel = (label: string) => {
    //     this.selectedLabel = label;
    //     this._onChangeAnnotationLabel.emit({ label, index: this.selectedIndexAnnotation });
    //     this._undoRedoService.appendStages({
    //         meta: this._selectMetadata,
    //         method: 'draw',
    //     });
    // };
    //
    // onClickAnnotation = (index: number, { label }: Boundingbox & Polygons) => {
    //     this.selectedLabel = label;
    //     this._annotateService.setState({ annotation: index });
    // };
    //
    // checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);
    //
    // ngOnChanges(changes: SimpleChanges): void {
    //     if (changes._thumbnailList) {
    //         const { currentValue }: { currentValue: BboxMetadata[] & PolyMetadata[] } = changes._thumbnailList;
    //         this._thumbnailList = Object.assign([], this._thumbnailList, [...currentValue]);
    //     }
    //
    //     if (
    //         changes._tabStatus &&
    //         this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
    //     ) {
    //         const { currentValue }: { currentValue: TabsProps<CompleteMetadata>[] } = changes._tabStatus;
    //         this._tabStatus = [...currentValue];
    //         this.updateLabelList();
    //         this.isTabStillOpen = false;
    //         for (const { closed } of this._tabStatus) {
    //             if (!closed) {
    //                 this.isTabStillOpen = true;
    //                 break;
    //             }
    //         }
    //         this.pickRandomColorForLabel();
    //     }
    //
    //     if (changes._changeClickAbilityToggleStatus) {
    //         this.clickAbilityToggle = this._changeClickAbilityToggleStatus;
    //         if (!this.clickAbilityToggle) {
    //             this.selectedIndexAnnotation = -1;
    //             this.selectedLabel = '';
    //         }
    //     }
    //
    //     if (this.clickAbilityToggle) {
    //         setTimeout(() => this._clickAbilityToggleStatus.emit(true));
    //     }
    //
    //     if (changes.selectedIndexAnnotation) {
    //         console.log(this.selectedIndexAnnotation);
    //     }
    // }
    //
    // openAllTab() {
    //     this._tabStatus.forEach((tab) => {
    //         tab.closed = false;
    //     });
    // }
    //
    // @HostListener('scroll', ['$event'])
    // mouseScroll() {
    //     const pos = this.thumbnailList.nativeElement.scrollTop + this.thumbnailList.nativeElement.clientHeight;
    //     this.max = this.thumbnailList.nativeElement.scrollHeight;
    //     if (pos + 1500 >= this.max && this.tempMax !== this.max) {
    //         this.tempMax = this.max;
    //         this._loadMoreThumbnails.emit();
    //     }
    // }
    //
    // renameImage(thumbnail: CompleteMetadata) {
    //     this._onRenameImage.emit(thumbnail);
    // }
    //
    // deleteImage(thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number) {
    //     this.onClick(thumbnail, thumbnailIndex);
    //     this._onDeleteImage.emit(thumbnail);
    // }
    //
    // pickRandomColorForLabel(): void {
    //     this._labelColorService.setLabelColors(this.labelList, this._projectName);
    // }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
