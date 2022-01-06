import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ElementRef,
    HostListener,
} from '@angular/core';
import {
    VideoLabelProps,
    BboxMetadata,
    CompleteMetadata,
    EventEmitter_ThumbnailDetails,
    PolyMetadata,
    TabsProps,
    ChangeAnnotationLabel,
    SelectedLabelProps,
    Polygons,
    Boundingbox,
} from 'shared/types/video-labelling/video-labelling.model';
import { cloneDeep, isEqual } from 'lodash-es';
import { HTMLElementEvent } from '../../../shared/types/field/field.model';
import { AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { VideoLabellingActionService } from '../video-labelling-action.service';
import { LanguageService } from '../../../shared/services/language.service';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'video-labelling-project',
    templateUrl: './video-labelling-project.component.html',
    styleUrls: ['./video-labelling-project.component.scss'],
})
export class VideoLabellingProjectComponent implements OnInit, OnChanges {
    @Input() _onChange!: VideoLabelProps;
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Input() _selectMetadata!: BboxMetadata & PolyMetadata;
    @Input() _videoDuration: string = '';
    @Input() _videoPath: string = '';
    @Output() _onClickLabel: EventEmitter<SelectedLabelProps> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _onDeleteAnnotation: EventEmitter<number> = new EventEmitter();
    @ViewChild('thumbnailList') thumbnailList!: ElementRef<HTMLDivElement>;
    @Input() _totalUuid: number = 0;
    @Output() _onClose = new EventEmitter();
    @Input() _thumbnailList: CompleteMetadata[] = [];
    @Output() _loadMoreThumbnails: EventEmitter<void> = new EventEmitter();
    @Output() _onRenameImage: EventEmitter<CompleteMetadata> = new EventEmitter();
    @Output() _onDeleteImage: EventEmitter<CompleteMetadata> = new EventEmitter();
    @Output() _onClickThumbnail: EventEmitter<EventEmitter_ThumbnailDetails> = new EventEmitter();
    isTabStillOpen: boolean = true;
    selectedIndexAnnotation = -1;
    selectedLabel: string = '';
    tempMax: number = 0;
    max: number = 0;
    clickAbilityToggle: boolean = false;
    invalidInput: boolean = false;
    inputLabel: string = '';
    labelList: string[] = [];
    displayInputLabel: boolean = false;
    unsubscribe$: Subject<any> = new Subject();

    constructor(
        private _annotateService: AnnotateSelectionService,
        private _videoLblState: VideoLabellingActionService,
        private _languageService: LanguageService,
        private _undoRedoService: UndoRedoService,
    ) {
        const langsArr: string[] = ['video-labelling-en'];
        this._languageService.initializeLanguage(`video-labelling`, langsArr);
    }

    ngOnInit(): void {
        this.updateLabelList();
        this._videoLblState.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ draw }) => (this.clickAbilityToggle = draw));

        this._thumbnailList.length > 0 &&
            this._annotateService.labelStaging$
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
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
                });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._thumbnailList) {
            const { currentValue }: { currentValue: BboxMetadata[] & PolyMetadata[] } = changes._thumbnailList;
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

    updateLabelList = () => {
        this.labelList = this._tabStatus[1].label_list ? this._tabStatus[1].label_list : [];
    };

    onClick = (thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number): void => {
        this._onClickThumbnail.emit({ ...thumbnail, thumbnailIndex });
        // after switch photo display, also reset selectedIndexAnnotation & selectedLabel
        this.selectedIndexAnnotation = -1;
        this.selectedLabel = '';
    };

    onClose = (tab: TabsProps): void => {
        this._onClose.emit({ name: tab.name, closed: true });
    };

    resetAnnotationIndexAndLabel = (): void => {
        this.selectedIndexAnnotation = -1;
        this.selectedLabel = '';
    };

    @HostListener('scroll', ['$event'])
    mouseScroll() {
        const pos = this.thumbnailList.nativeElement.scrollTop + this.thumbnailList.nativeElement.clientHeight;
        this.max = this.thumbnailList.nativeElement.scrollHeight;
        if (pos + 1500 >= this.max && this.tempMax !== this.max) {
            this.tempMax = this.max;
            this._loadMoreThumbnails.emit();
        }
    }

    checkCloseToggle = (tab: TabsProps): string | null => {
        let classes = '';
        if (
            !(
                (tab.name === 'label' && this._tabStatus[2].closed) ||
                (tab.name === 'project' && this._tabStatus[1].closed && this._tabStatus[2].closed) ||
                tab.name === 'annotation'
            )
        ) {
            classes = 'flex-content';
        }
        if (tab.closed) {
            classes += ' closed';
        }
        return classes;
    };

    openAllTab() {
        this._tabStatus.forEach((tab) => {
            tab.closed = false;
        });
    }

    renameImage(thumbnail: CompleteMetadata) {
        this._onRenameImage.emit(thumbnail);
    }

    deleteImage(thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number) {
        this.onClick(thumbnail, thumbnailIndex);
        this._onDeleteImage.emit(thumbnail);
    }

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

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

    onClickAnnotation = (index: number, { label }: Boundingbox & Polygons) => {
        this.selectedLabel = label;
        this._annotateService.setState({ annotation: index });
    };

    onClickLabel = (label: string) => {
        this.selectedLabel = label;
        this._onChangeAnnotationLabel.emit({ label, index: this.selectedIndexAnnotation });
        this._undoRedoService.appendStages({
            meta: this._selectMetadata,
            method: 'draw',
        });
    };

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
}
