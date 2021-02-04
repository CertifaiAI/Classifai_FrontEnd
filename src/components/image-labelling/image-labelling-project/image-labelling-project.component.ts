import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { isEqual } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    ActionTabProps,
    BboxMetadata,
    Boundingbox,
    ChangeAnnotationLabel,
    CompleteMetadata,
    EventEmitter_ThumbnailDetails,
    Polygons,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
} from '../image-labelling.model';

@Component({
    selector: 'image-labelling-project',
    templateUrl: './image-labelling-project.component.html',
    styleUrls: ['./image-labelling-project.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingProjectComponent implements OnInit, OnChanges, OnDestroy {
    @Input() _thumbnailList: CompleteMetadata[] = [];
    @Input() _tabStatus: TabsProps[] = [];
    @Output() _onClose: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onClickThumbNail: EventEmitter<EventEmitter_ThumbnailDetails> = new EventEmitter();
    @Output() _onClickLabel: EventEmitter<SelectedLabelProps> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _onDeleteAnnotation: EventEmitter<number> = new EventEmitter();
    action: number = -1;
    displayInputLabel: boolean = false;
    inputLabel: string = '';
    selectedIndexAnnotation = -1;
    selectedLabel: string = '';
    unsubscribe$: Subject<any> = new Subject();
    clickAbilityToggle: boolean = false;
    invalidInput: boolean = false;

    constructor(
        private _annotateService: AnnotateSelectionService,
        private _imgLblState: ImageLabellingActionService,
    ) {}

    ngOnInit(): void {
        this._imgLblState.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ draw }) => (this.clickAbilityToggle = draw));

        this._thumbnailList.length > 0
            ? this._annotateService.labelStaging$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
                      // isDlbClick ? this._annotateService.setState({ annotation: -1 }) : null;

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

    onClick = (thumbnail: Omit<BboxMetadata & PolyMetadata, 'img_src'>, thumbnailIndex: number): void => {
        this._onClickThumbNail.emit({ ...thumbnail, thumbnailIndex });
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
                const isInvalidLabel: boolean = this._tabStatus.some(({ label_list }) =>
                    label_list && label_list.length ? label_list.some((label) => label === valTrimmed) : null,
                );
                if (!isInvalidLabel) {
                    this.invalidInput = false;
                    const label_lists = this._tabStatus
                        .map(({ label_list }) => (label_list ? label_list : []))
                        .filter((tab) => tab.length > 0)[0];
                    this._onEnterLabel.emit({ action: 1, label_list: label_lists ? [...label_lists, value] : [value] });
                    this.displayInputLabel = false;
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

    onIconClick = ({ tabType, action }: ActionTabProps): void => {
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

    onClickAnnotation = (index: number, { label }: Boundingbox & Polygons) => {
        // this._onClickThumbNail.emit(thumbnail);
        // const bbLabel = bnd_box.map(({ label }) => label);
        this.selectedLabel = label;
        this._annotateService.setState({ annotation: index });
    };

    onDeleteAnnotation = () => {
        this.selectedIndexAnnotation > -1 ? this._onDeleteAnnotation.emit(this.selectedIndexAnnotation) : null;
    };

    // onClickAnnotation = <T extends BboxMetadata>({ bnd_box }: T) => {
    //     // this._onClickThumbNail.emit(thumbnail);
    //     const bbLabel = bnd_box.map(({ label }) => label);
    //     console.log(bbLabel);
    // };

    checkCloseToggle = ({ closed }: TabsProps): string | null => (closed ? 'closed' : null);

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
            const { currentValue }: { currentValue: TabsProps[] } = changes._tabStatus;
            this._tabStatus = [...currentValue];
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
