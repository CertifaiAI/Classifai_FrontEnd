/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
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
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { cloneDeep, isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    BboxMetadata,
    Boundingbox,
    ChangeAnnotationLabel,
    CompleteMetadata,
    EventEmitter_ThumbnailDetails,
    ImgLabelProps,
    Polygons,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
} from '../image-labelling.model';
import { LanguageService } from 'src/shared/services/language.service';
import { UndoRedoService } from 'src/shared/services/undo-redo.service';

@Component({
    selector: 'image-labelling-project',
    templateUrl: './image-labelling-project.component.html',
    styleUrls: ['./image-labelling-project.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingProjectComponent implements OnInit, OnChanges, OnDestroy {
    @Input() _onChange!: ImgLabelProps;
    @Input() _totalUuid: number = 0;
    @Input() _selectMetadata!: BboxMetadata & PolyMetadata;
    @ViewChild('thumbnailList') thumbnailList!: ElementRef<HTMLDivElement>;
    @Input() _thumbnailList: CompleteMetadata[] = [];
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _onClose: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onClickThumbnail: EventEmitter<EventEmitter_ThumbnailDetails> = new EventEmitter();
    @Output() _onClickLabel: EventEmitter<SelectedLabelProps> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _onDeleteAnnotation: EventEmitter<number> = new EventEmitter();
    @Output() _loadMoreThumbnails: EventEmitter<void> = new EventEmitter();
    @Output() _onRenameImage: EventEmitter<CompleteMetadata> = new EventEmitter();
    @Output() _onDeleteImage: EventEmitter<CompleteMetadata> = new EventEmitter();
    action: number = -1;
    displayInputLabel: boolean = false;
    inputLabel: string = '';
    selectedIndexAnnotation = -1;
    selectedLabel: string = '';
    unsubscribe$: Subject<any> = new Subject();
    clickAbilityToggle: boolean = false;
    invalidInput: boolean = false;
    labelList: string[] = [];
    isTabStillOpen: boolean = true;
    tempMax: number = 0;
    max: number = 0;

    constructor(
        private _annotateService: AnnotateSelectionService,
        private _imgLblState: ImageLabellingActionService,
        private _languageService: LanguageService,
        private _undoRedoService: UndoRedoService,
    ) {}

    ngOnInit(): void {
        this.updateLabelList();
        this._imgLblState.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ draw }) => (this.clickAbilityToggle = draw));

        this._thumbnailList.length > 0 &&
            this._annotateService.labelStaging$
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
                    // isDlbClick && this._annotateService.setState();

                    this.selectedIndexAnnotation = annnotationIndex;
                    const [{ annotation }] = this._tabStatus.filter((tab) => tab.annotation);
                    const resultLabel = annotation?.map(({ bnd_box, polygons }) => {
                        if (bnd_box) {
                            return bnd_box.find((_, i) => i === annnotationIndex);
                        }
                        if (polygons) {
                            return polygons.find((_, i) => i === annnotationIndex);
                        }
                    })[0];
                    this.selectedLabel = resultLabel?.label ?? '';
                    // this.selectedIndexAnnotation = this._tabStatus.reduce((prev, { annotation }) => {
                    //     const currentIndex =
                    //         annotation?.findIndex(({ bnd_box }) =>
                    //             bnd_box.findIndex((_, i) => {
                    //                 const ss = i === annnotationIndex;
                    //                 console.log(`${i}===${annnotationIndex}`);
                    //                 console.log(ss);
                    //                 return ss;
                    //             }),
                    //         ) || -1;
                    //     prev = currentIndex || -1;
                    //     return prev;
                    // }, 0);

                    // this.selectedIndexAnnotation = this._tabStatus.findIndex(({ annotation }) =>
                    //     annotation?.findIndex(({ bnd_box }) => bnd_box.findIndex((_, i) => i === annnotationIndex)),
                    // );
                    // console.log({ annnotationIndex, isDlbClick });
                });
    }

    updateLabelList = () => {
        this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
    };

    onClose = (tab: TabsProps): void => {
        this._onClose.emit({ name: tab.name, closed: true });
    };

    onClick = (thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number): void => {
        this._onClickThumbnail.emit({ ...thumbnail, thumbnailIndex });
        // after switch photo display, also reset selectedIndexAnnotation & selectedLabel
        this.selectedIndexAnnotation = -1;
        this.selectedLabel = '';
    };

    onDisplayInputModal = (): void => {
        this.displayInputLabel = !this.displayInputLabel;
        this.inputLabel = '';
    };

    validateInputLabel = ({ target }: HTMLElementEvent<HTMLTextAreaElement>): void => {
        const { value } = target;
        const valTrimmed = value.trim();
        if (valTrimmed) {
            const validateVal: boolean = valTrimmed.match(/^[a-zA-Z0-9-]*$/) ? true : false;
            if (validateVal) {
                const isInvalidLabel: boolean = this._tabStatus.some(
                    ({ label_list }) =>
                        label_list && label_list.length && label_list.some((label) => label === valTrimmed),
                );
                if (!isInvalidLabel) {
                    this.invalidInput = false;
                    const label_lists = this._tabStatus
                        .map(({ label_list }) => (label_list ? label_list : []))
                        .filter((tab) => tab.length > 0)[0];
                    this._onEnterLabel.emit({ action: 1, label_list: label_lists ? [...label_lists, value] : [value] });
                    this.displayInputLabel = false;
                    this.inputLabel = '';
                } else {
                    this.invalidInput = true;
                    console.error(`Invalid existing label input`);
                }
            } else {
                this.invalidInput = true;
                console.error(`Invalid input value`);
            }
        }
    };

    inputLabelChange(text: string) {
        this.labelList = this._tabStatus[1].label_list
            ? this._tabStatus[1].label_list?.filter((label) => label.includes(text))
            : [];
    }

    onDeleteLabel = (selectedLabel: string): void => {
        let isLabelExist = false;
        this._thumbnailList.forEach((thumbnail) => {
            if (thumbnail.bnd_box) {
                thumbnail.bnd_box.forEach((bndbox) => {
                    bndbox.label === selectedLabel && (isLabelExist = true);
                });
            }
            if (thumbnail.polygons) {
                thumbnail.polygons.forEach((polygon) => {
                    polygon.label === selectedLabel && (isLabelExist = true);
                });
            }
        });
        if (isLabelExist) {
            this._languageService._translate.get('labelExist').subscribe((translated) => {
                alert(translated);
            });
        } else {
            const [{ label_list }] = this._tabStatus.filter((tab) => tab.label_list);
            this._onClickLabel.emit({
                selectedLabel,
                label_list: label_list && label_list.length > 0 ? label_list : [],
                action: 0,
            });
        }
    };

    onClickLabel = (label: string) => {
        this.selectedLabel = label;
        // this.selectedIndexAnnotation > -1 &&
        this._onChangeAnnotationLabel.emit({ label, index: this.selectedIndexAnnotation });
        // this._selectMetadata.bnd_box[this.selectedIndexAnnotation].label = label;
        this._undoRedoService.appendStages({
            meta: this._selectMetadata,
            method: 'draw',
        });
    };

    onClickAnnotation = (index: number, { label }: Boundingbox & Polygons) => {
        // this._onClickThumbnail.emit(thumbnail);
        // const bbLabel = bnd_box.map(({ label }) => label);
        this.selectedLabel = label;
        this._annotateService.setState({ annotation: index });
    };

    onDeleteAnnotation = () => {
        if (this.selectedIndexAnnotation > -1) {
            this._onDeleteAnnotation.emit(this.selectedIndexAnnotation);
            this._selectMetadata.bnd_box.splice(this.selectedIndexAnnotation, 1) &&
                this._undoRedoService.appendStages({
                    meta: cloneDeep(this._selectMetadata),
                    method: 'draw',
                });
        }
    };

    // onClickAnnotation = <T extends BboxMetadata>({ bnd_box }: T) => {
    //     // this._onClickThumbnail.emit(thumbnail);
    //     const bbLabel = bnd_box.map(({ label }) => label);
    //     console.log(bbLabel);
    // };

    checkCloseToggle = (tab: TabsProps): string | null => {
        let classes = '';
        if (
            !(
                (tab.name === 'labellingProject.label' && this._tabStatus[2].closed) ||
                (tab.name === 'labellingProject.project' && this._tabStatus[1].closed && this._tabStatus[2].closed) ||
                tab.name === 'labellingProject.annotation'
            )
        ) {
            classes = 'flex-content';
        }
        if (tab.closed) {
            classes += ' closed';
        }
        return classes;
    };

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._thumbnailList) {
            const { currentValue }: { currentValue: BboxMetadata[] & PolyMetadata[] } = changes._thumbnailList;
            // console.log(currentValue);
            this._thumbnailList = Object.assign([], this._thumbnailList, [...currentValue]);
        }

        if (
            changes._tabStatus &&
            this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
        ) {
            const { currentValue }: { currentValue: TabsProps<CompleteMetadata>[] } = changes._tabStatus;
            this._tabStatus = [...currentValue];
            this.updateLabelList();
            this.isTabStillOpen = false;
            for (const { closed } of this._tabStatus) {
                if (!closed) {
                    this.isTabStillOpen = true;
                    break;
                }
            }
        }
    }

    openAllTab() {
        this._tabStatus.forEach((tab) => {
            tab.closed = false;
        });
    }

    @HostListener('scroll', ['$event'])
    mouseScroll() {
        const pos = this.thumbnailList.nativeElement.scrollTop + this.thumbnailList.nativeElement.clientHeight;
        this.max = this.thumbnailList.nativeElement.scrollHeight;
        if (pos + 1500 >= this.max && this.tempMax !== this.max) {
            this.tempMax = this.max;
            this._loadMoreThumbnails.emit();
        }
    }

    renameImage(thumbnail: CompleteMetadata) {
        this._onRenameImage.emit(thumbnail);
    }

    deleteImage(thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number) {
        this.onClick(thumbnail, thumbnailIndex);
        this._onDeleteImage.emit(thumbnail);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
