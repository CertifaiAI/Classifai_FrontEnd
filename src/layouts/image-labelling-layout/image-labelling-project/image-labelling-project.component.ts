import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { BoundingBoxStateService } from 'src/shared/services/bounding-box-state.service';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { HTMLElementEvent } from 'src/shared/type-casting/field/field.model';
import { isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    ThumbnailMetadata,
    TabsProps,
    ActionTabProps,
    SelectedLabelProps,
    ThumbnailMetadataProps,
    ImgLabelProps,
    Boundingbox,
    ChangeAnnotationLabel,
} from '../image-labelling-layout.model';

@Component({
    selector: 'image-labelling-project',
    templateUrl: './image-labelling-project.component.html',
    styleUrls: ['./image-labelling-project.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingProjectComponent implements OnInit, OnChanges, OnDestroy {
    @Input() _thumbnailList: ImgLabelProps<ThumbnailMetadata[]> = [];
    @Input() _tabStatus: TabsProps[] = [];
    @Output() _onClose: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onClickThumbNail: EventEmitter<ThumbnailMetadataProps> = new EventEmitter();
    @Output() _onClickLabel: EventEmitter<SelectedLabelProps> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _onDeleteAnnotation: EventEmitter<number> = new EventEmitter();
    @Output() _onDisplayModal: EventEmitter<null> = new EventEmitter();
    action: number = -1;
    displayInputLabel: boolean = false;
    inputLabel: string = '';
    selectedIndexAnnotation = -1;
    selectedLabel: string = '';
    unsubscribe$: Subject<any> = new Subject();
    clickAbilityToggle: boolean = false;

    constructor(private _annotateService: AnnotateSelectionService, private _bbState: BoundingBoxStateService) {}

    ngOnInit(): void {
        this._bbState.boundingBox$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ draw }) => (this.clickAbilityToggle = draw));

        this._thumbnailList.length > 0
            ? this._annotateService.labelStaging$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
                      // isDlbClick ? this._annotateService.mutateState({ annotation: -1 }) : null;

                      this.selectedIndexAnnotation = annnotationIndex;
                      const [{ annotation }] = this._tabStatus.filter((tab) => tab.annotation);
                      const resultLabel = annotation?.map(({ bnd_box }) =>
                          bnd_box.find((_, i) => i === annnotationIndex),
                      )[0];
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
                  })
            : null;
    }

    onClose = (tab: TabsProps): void => {
        this._onClose.emit({ name: tab.name, closed: true });
    };

    onClick = <T extends Omit<ThumbnailMetadataProps, 'img_src'>>(thumbnail: T): void => {
        this._onClickThumbNail.emit(thumbnail);
    };

    onDisplayInputModal = (isDisplay: boolean): void => {
        this.displayInputLabel = isDisplay;
        this.inputLabel = '';
    };

    validateInputLabel = ({ target }: HTMLElementEvent<HTMLTextAreaElement>): void => {
        const { value } = target;
        const valTrimmed = value.trim();
        if (valTrimmed) {
            const validateVal: boolean = valTrimmed.match(/^[a-zA-Z0-9-]*$/) ? true : false;
            if (validateVal) {
                const isInvalidLabel: boolean = this._tabStatus.some(({ label_list }) =>
                    label_list && label_list.length ? label_list.some((label) => label === valTrimmed) : null,
                );
                if (!isInvalidLabel) {
                    const label_list = this._tabStatus
                        .map(({ label_list }) => (label_list ? label_list : []))
                        .filter((tab) => tab.length > 0)[0];
                    this._onEnterLabel.emit({ action: 1, label_list: label_list ? [...label_list, value] : [value] });
                    this.displayInputLabel = false;
                } else {
                    console.error(`Invalid existing label input`);
                }
            } else {
                console.error(`Invalid input value`);
            }
        }
    };

    onIconClick = <T extends ActionTabProps>({ tabType, action }: T): void => {
        this.action = action;
    };

    onChangeInputLabel = (event: HTMLElementEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        this.inputLabel = value;
    };

    onDeleteLabel = (selectedLabel: string): void => {
        const [{ label_list }] = this._tabStatus.filter((tab) => tab.label_list);
        this._onClickLabel.emit({
            selectedLabel,
            label_list: label_list && label_list.length > 0 ? label_list : [],
            action: 0,
        });
    };

    onClickLabel = (label: string) => {
        this.selectedLabel = label;

        this.selectedIndexAnnotation > -1
            ? this._onChangeAnnotationLabel.emit({ label, index: this.selectedIndexAnnotation })
            : null;
    };

    onClickAnnotation = (index: number, { label }: Boundingbox) => {
        // this._onClickThumbNail.emit(thumbnail);
        // const bbLabel = bnd_box.map(({ label }) => label);
        this.selectedLabel = label;
        this._annotateService.mutateState({ annotation: index });
    };

    onDeleteAnnotation = () => {
        this.selectedIndexAnnotation > -1 ? this._onDeleteAnnotation.emit(this.selectedIndexAnnotation) : null;
    };

    // onClickAnnotation = <T extends ThumbnailMetadata>({ bnd_box }: T) => {
    //     // this._onClickThumbNail.emit(thumbnail);
    //     const bbLabel = bnd_box.map(({ label }) => label);
    //     console.log(bbLabel);
    // };

    checkCloseToggle = <T extends TabsProps>({ closed }: T): string | null => (closed ? 'closed' : null);

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    onClickModal = () => {
        this._onDisplayModal.emit();
    };

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._thumbnailList) {
            const { currentValue }: { currentValue: ImgLabelProps<ThumbnailMetadata[]> } = changes._thumbnailList;
            // console.log(currentValue);
            this._thumbnailList = Object.assign([], this._thumbnailList, [...currentValue]);
        }

        if (
            changes._tabStatus &&
            this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
        ) {
            const { currentValue }: { currentValue: TabsProps[] } = changes._tabStatus;
            this._tabStatus = [...currentValue];
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
