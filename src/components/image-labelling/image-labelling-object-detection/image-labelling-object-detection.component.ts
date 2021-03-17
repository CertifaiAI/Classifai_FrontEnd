import { AnnotateActionState, AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { BoundingBoxCanvasService } from './bounding-box-canvas.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from '../../../shared/services/copy-paste.service';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
import {
    ActionState,
    BboxMetadata,
    Boundingbox,
    ChangeAnnotationLabel,
    CompleteMetadata,
    Direction,
    LabelInfo,
    MouseCursor,
    SelectedLabelProps,
    TabsProps,
    UndoState,
} from '../image-labelling.model';
import {
    Component,
    OnInit,
    Input,
    SimpleChanges,
    ViewChild,
    ElementRef,
    HostListener,
    ChangeDetectionStrategy,
    OnChanges,
    Output,
    EventEmitter,
    OnDestroy,
} from '@angular/core';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';

@Component({
    selector: 'image-labelling-object-detection',
    templateUrl: './image-labelling-object-detection.component.html',
    styleUrls: ['./image-labelling-object-detection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingObjectDetectionComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    @ViewChild('floatdiv') floatdiv!: ElementRef<HTMLDivElement>;
    @ViewChild('lbltypetxt') lbltypetxt!: ElementRef<HTMLInputElement>;
    @ViewChild('availablelbl') availablelbl!: ElementRef<HTMLDivElement>;
    private canvasContext!: CanvasRenderingContext2D | null;
    private img: HTMLImageElement = new Image();
    private mousedown: boolean = false;
    private boundingBoxState!: ActionState;
    private annotateState!: AnnotateActionState;
    private unsubscribe$: Subject<any> = new Subject();
    labelSearch: string = '';
    labelList: LabelInfo[] = [];
    allLabelList: LabelInfo[] = [];
    showDropdownLabelBox: boolean = false;
    invalidInput: boolean = false;
    closeEnough: number = 5;
    private mouseCursor: MouseCursor = {
        move: false,
        pointer: false,
        grab: false,
        resize: false,
    };
    private scale = 1;
    private factor = 0.05;
    private max_scale = 4;
    @Input() _selectMetadata!: BboxMetadata;
    @Input() _imgSrc: string = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _onChangeMetadata: EventEmitter<BboxMetadata> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();

    constructor(
        private _boundingBoxCanvas: BoundingBoxCanvasService,
        private _imgLblStateService: ImageLabellingActionService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit() {
        this.getLabelList();

        // subscribes to action state & handles side effect
        this._imgLblStateService.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ clear, fitCenter, ...action }) => {
                this.boundingBoxState = { ...action, clear, fitCenter };

                fitCenter && this.imgFitToCenter();
                if (clear) {
                    this._selectMetadata.bnd_box = [];
                    this.redrawImage(this._selectMetadata);
                    this.emitMetadata();
                }
            });

        this._annotateSelectState.labelStaging$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
            this.annotateState = state;
            this._boundingBoxCanvas.setCurrentSelectedbBox(state.annotation);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._selectMetadata?.currentValue) {
            this.redrawImage(this._selectMetadata);
        }

        if (changes._imgSrc?.currentValue) {
            this.initializeCanvas();
            this._undoRedoService.clearAllStages();
            this.loadImage(changes._imgSrc.currentValue);
            this._boundingBoxCanvas.setCurrentSelectedbBox(-1);
        }
    }

    initializeCanvas() {
        this.canvas.nativeElement.style.width = '80%';
        this.canvas.nativeElement.style.height = '90%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d');
    }

    emitMetadata() {
        // console.log(this._selectMetadata);
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    annotateStateSelectChange(newState: AnnotateActionState) {
        this._annotateSelectState.setState(newState);
    }

    resetZoomScale() {
        this.scale = 1;
        this.factor = 0.05;
        this.max_scale = 4;
    }

    imgFitToCenter() {
        try {
            const tmpObj = this._boundingBoxCanvas.calScaleTofitScreen(
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                this.canvas.nativeElement.offsetWidth,
                this.canvas.nativeElement.offsetHeight,
            );
            this._selectMetadata.img_w *= tmpObj.factor;
            this._selectMetadata.img_h *= tmpObj.factor;
            this._boundingBoxCanvas.scaleAllBoxes(
                tmpObj.factor,
                this._selectMetadata.bnd_box,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
            );
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._boundingBoxCanvas.setGlobalXY(tmpObj.newX, tmpObj.newY);
            this._boundingBoxCanvas.moveAllBbox(
                this._selectMetadata.bnd_box,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                // (isDone) => {
                //     if (isDone) {
                //         const meta = cloneDeep(this._selectMetadata);
                //         this._undoRedoService.isMethodChange('zoom')
                //             ? this._undoRedoService.appendStages({
                //                   meta,
                //                   method: 'zoom',
                //               })
                //             : this._undoRedoService.replaceStages({
                //                   meta,
                //                   method: 'zoom',
                //               });
                //     }
                // },
            );
            this.redrawImage(this._selectMetadata);
            if (this.canvasContext) {
                this.resetZoomScale();
                this.canvasContext.canvas.style.transformOrigin = `0 0`;
                this.canvasContext.canvas.style.transform = `scale(1, 1)`;
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ ctrlKey, shiftKey, key }: KeyboardEvent) {
        try {
            const { isActiveModal } = this.boundingBoxState;
            if (!this.mousedown && !isActiveModal && !this.showDropdownLabelBox && this._selectMetadata) {
                if (ctrlKey && (key === 'c' || key === 'C')) {
                    // copy
                    this.annotateState.annotation > -1 &&
                        this._copyPasteService.copy(this._selectMetadata.bnd_box[this.annotateState.annotation]);
                } else if (ctrlKey && (key === 'v' || key === 'V')) {
                    // paste
                    if (this._copyPasteService.isAvailable()) {
                        // another copy function to make sense of copying the latest BB instead of the 1st copied BB
                        this._copyPasteService.copy(this._selectMetadata.bnd_box[this.annotateState.annotation]);
                        const pastedMetadata = this._copyPasteService.paste<Boundingbox>();
                        pastedMetadata && this._selectMetadata.bnd_box.push(pastedMetadata);
                        this.annotateStateSelectChange({
                            annotation: this._selectMetadata.bnd_box.length - 1,
                            isDlbClick: false,
                        });
                        this.getBBoxDistanceFromImage();
                        this.redrawImage(this._selectMetadata);
                    }

                    this._undoRedoService.appendStages({
                        meta: cloneDeep(this._selectMetadata),
                        method: 'draw',
                    });
                    this.emitMetadata();
                    // this.canvas.nativeElement.focus();
                } else if (ctrlKey && shiftKey && (key === 'z' || key === 'Z')) {
                    // redo
                    if (this._undoRedoService.isAllowRedo()) {
                        const rtStages: UndoState = this._undoRedoService.redo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
                        this.redrawImage(this._selectMetadata);
                        this.getBBoxDistanceFromImage();
                        this.emitMetadata();
                    }
                } else if (ctrlKey && (key === 'z' || key === 'Z')) {
                    // undo
                    if (this._undoRedoService.isAllowUndo()) {
                        const rtStages: UndoState = this._undoRedoService.undo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
                        this.redrawImage(this._selectMetadata);
                        this.getBBoxDistanceFromImage();
                        this.emitMetadata();
                    }
                } else if (
                    !isActiveModal &&
                    this.annotateState.annotation > -1 &&
                    (key === 'Delete' || key === 'Backspace')
                ) {
                    // delete single annotation
                    this._boundingBoxCanvas.deleteSingleBox(
                        this._selectMetadata.bnd_box,
                        this.annotateState.annotation,
                        (isDone) => {
                            if (isDone) {
                                this.annotateStateSelectChange({ annotation: -1, isDlbClick: false });
                                this.redrawImage(this._selectMetadata);
                                this._undoRedoService.appendStages({
                                    meta: cloneDeep(this._selectMetadata),
                                    method: 'draw',
                                });
                                this.emitMetadata();
                            }
                        },
                    );
                } else {
                    const direction =
                        key === 'ArrowLeft'
                            ? 'left'
                            : key === 'ArrowRight'
                            ? 'right'
                            : key === 'ArrowUp'
                            ? 'up'
                            : key === 'ArrowDown' && 'down';
                    direction && this.keyMoveBox(direction);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(_: MouseEvent) {
        try {
            this.annotateState.annotation > -1 &&
                (this._undoRedoService.clearRedundantStages(),
                this.annotateStateSelectChange({ annotation: this.annotateState.annotation, isDlbClick: true }));
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent & { wheelDelta: number }) {
        try {
            const mouseWithinPointPath = this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event);

            if (mouseWithinPointPath && this.canvasContext) {
                // let delta = event.deltaY ? event.deltaY / 40 : 0;
                // const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.detail));
                let delta = event.wheelDelta;
                if (delta === undefined) {
                    // we are on firefox
                    delta = event.detail;
                }
                delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency
                const { scrollLeft, scrollTop } = this.canvas.nativeElement;
                const offset = { x: scrollLeft, y: scrollTop };
                const image_loc = {
                    x: event.pageX + offset.x,
                    y: event.pageY + offset.y,
                };
                const zoom_point = { x: image_loc.x / this.scale, y: image_loc.y / this.scale };

                // apply zoom
                this.scale += delta * this.factor * this.scale;
                this.scale = Math.max(1, Math.min(this.max_scale, this.scale));

                const zoom_point_new = { x: zoom_point.x * this.scale, y: zoom_point.y * this.scale };

                const newScroll = {
                    x: zoom_point_new.x - event.pageX,
                    y: zoom_point_new.y - event.pageY,
                };
                // this.canvas.nativeElement.style.transformOrigin = '0 0';
                // this.canvas.nativeElement.style.transform = `scale(${this.scale}, ${this.scale})`;
                // this.canvas.nativeElement.scrollTop = newScroll.y;
                // this.canvas.nativeElement.scrollLeft = newScroll.x;

                // prevent canvas scaling on UI but scroll state is false
                if (this.boundingBoxState.scroll) {
                    this.canvasContext.canvas.style.transformOrigin = `${event.offsetX}px ${event.offsetY}px`;
                    this.canvasContext.canvas.style.transform = `scale(${this.scale}, ${this.scale})`;
                }

                this.canvasContext.canvas.scrollTop = newScroll.y;
                this.canvasContext.canvas.scrollLeft = newScroll.x;

                this._copyPasteService.isAvailable() && this._copyPasteService.clear();
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        try {
            if (this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event)) {
                this.mousedown = true;
                if (this.boundingBoxState.drag) {
                    this._boundingBoxCanvas.setPanXY(event.offsetX, event.offsetY);
                }
                if (this.boundingBoxState.draw) {
                    const tmpBox = this._boundingBoxCanvas.mouseDownDrawEnable(
                        event.offsetX,
                        event.offsetY,
                        this._selectMetadata.bnd_box,
                    );
                    this.annotateStateSelectChange({ annotation: tmpBox, isDlbClick: false });
                    this.redrawImage(this._selectMetadata);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        try {
            if (this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event)) {
                if (this.boundingBoxState.drag && this.mousedown) {
                    this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                }
                if (this.boundingBoxState.draw && this.mousedown) {
                    const retObj = this._boundingBoxCanvas.mouseUpDrawEnable(this._selectMetadata, (isDone) => {
                        if (isDone) {
                            this._undoRedoService.isStateChange(this._selectMetadata.bnd_box) &&
                                this._undoRedoService.appendStages({
                                    meta: cloneDeep(this._selectMetadata),
                                    method: 'draw',
                                });
                            this.getBBoxDistanceFromImage();
                            this.emitMetadata();
                        }
                    });
                    if (retObj.isNew) {
                        this.getLabelList();
                        const annotationList = this._tabStatus[2].annotation
                            ? this._tabStatus[2].annotation[0].bnd_box
                                ? this._tabStatus[2].annotation[0].bnd_box
                                : []
                            : [];
                        this.sortingLabelList(this.labelList, annotationList);
                        this.floatdiv.nativeElement.style.top = event.offsetY.toString() + 'px';
                        this.floatdiv.nativeElement.style.left = event.offsetX.toString() + 'px';
                        this.showDropdownLabelBox = true;
                        this.labelSearch = '';
                        this.invalidInput = false;
                        setTimeout(() => {
                            this.lbltypetxt.nativeElement.focus();
                        }, 100);
                    } else {
                        this.showDropdownLabelBox = false;
                    }
                    retObj.isNew && this.annotateStateSelectChange({ annotation: retObj.selBox, isDlbClick: false });
                }
                this.mousedown = false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        try {
            if (this._selectMetadata) {
                const mouseWithinPointPath = this._boundingBoxCanvas.mouseClickWithinPointPath(
                    this._selectMetadata,
                    event,
                );
                if (mouseWithinPointPath && !this.showDropdownLabelBox) {
                    if (this.boundingBoxState.drag && this.mousedown) {
                        const diff = this._boundingBoxCanvas.getDiffXY(event);
                        this._selectMetadata.img_x = diff.diffX;
                        this._selectMetadata.img_y = diff.diffY;
                        this._boundingBoxCanvas.panRectangle(
                            this._selectMetadata.bnd_box,
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            (isDone) => {
                                if (isDone) {
                                    const meta = cloneDeep(this._selectMetadata);
                                    this._undoRedoService.isMethodChange('pan')
                                        ? this._undoRedoService.appendStages({
                                              meta,
                                              method: 'pan',
                                          })
                                        : this._undoRedoService.replaceStages({
                                              meta,
                                              method: 'pan',
                                          });
                                }
                            },
                        );
                        this.redrawImage(this._selectMetadata);
                    }
                    if (this.boundingBoxState.draw && this.mousedown) {
                        this._boundingBoxCanvas.mouseMoveDrawEnable(event.offsetX, event.offsetY, this._selectMetadata);
                        this.redrawImage(this._selectMetadata);
                    }
                    if (this.boundingBoxState.draw && !this.mousedown) {
                        const { box } = this._boundingBoxCanvas.getCurrentClickBox(
                            event.offsetX,
                            event.offsetY,
                            this._selectMetadata.bnd_box,
                        );

                        if (box !== -1) {
                            this.changeMouseCursorState({ move: true });
                            // const { x1, x2, y1, y2 } = this._selectMetadata.bnd_box[box];
                            // const { offsetX, offsetY } = event;
                            // // 4 cases:
                            // // 1. top left
                            // if (this.checkCloseEnough(offsetX, x1) && this.checkCloseEnough(offsetY, y1)) {
                            //     this.changeMouseCursorState({ resize: true });
                            // }
                            // // 2. top right
                            // else if (this.checkCloseEnough(offsetX, x2) && this.checkCloseEnough(offsetY, y1)) {
                            //     this.changeMouseCursorState({ resize: true });
                            // }
                            // // 2. top center & bottom center
                            // // else if (
                            // //     this.checkCloseEnough(offsetX, (x2 + x1) / 2) &&
                            // //     this.checkCloseEnough(offsetY, (y2 + y1) / 2)
                            // // ) {
                            // //     this.changeMouseCursorState({ resize: true });
                            // // }
                            // // 3. bottom left
                            // else if (this.checkCloseEnough(offsetX, x1) && this.checkCloseEnough(offsetY, y2)) {
                            //     this.changeMouseCursorState({ resize: true });
                            // }
                            // // 4. bottom right
                            // else if (this.checkCloseEnough(offsetX, x2) && this.checkCloseEnough(offsetY, y2)) {
                            //     this.changeMouseCursorState({ resize: true });
                            // }
                        } else {
                            this.changeMouseCursorState({ pointer: true });
                        }
                    }
                } else {
                    this.changeMouseCursorState();
                    if (
                        this.crossh.nativeElement.style.zIndex !== '-1' ||
                        this.crossh.nativeElement.style.visibility !== 'hidden' ||
                        this.crossv.nativeElement.style.zIndex !== '-1' ||
                        this.crossv.nativeElement.style.visibility !== 'hidden'
                    ) {
                        this.crossh.nativeElement.style.zIndex = '-1';
                        this.crossh.nativeElement.style.visibility = 'hidden';
                        this.crossv.nativeElement.style.zIndex = '-1';
                        this.crossv.nativeElement.style.visibility = 'hidden';
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    changeMouseCursorState(mouseCursor?: Partial<MouseCursor>) {
        if (mouseCursor) {
            const { grab, move, pointer, resize } = mouseCursor;
            this.mouseCursor = {
                grab: grab ?? false,
                pointer: pointer ?? false,
                move: move ?? false,
                resize: resize ?? false,
            };
        }
    }

    checkCloseEnough(p1: number, p2: number) {
        const ss = Math.abs(p1 - p2) < this.closeEnough;
        console.log(ss);
        return ss;
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            if (
                ((event.target as Element).className === 'canvasstyle' ||
                    (event.target as Element).className.includes('unclosedOut')) &&
                !(event.relatedTarget as Element)?.className.includes('unclosedOut') &&
                !(event.relatedTarget as Element)?.className.includes('canvasstyle')
            ) {
                this.showDropdownLabelBox = false;
            }
            if (this.boundingBoxState.drag && this.mousedown) {
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.redrawImage(this._selectMetadata);
            }
            this.mousedown = false;
        } catch (err) {
            console.log(err);
        }
    }

    loadImage(bit64STR: string) {
        try {
            this.img.src = bit64STR;
            // this.clearCanvas();
            this.img.onload = () => {
                this._selectMetadata.img_w =
                    this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
                this._selectMetadata.img_h =
                    this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.imgFitToCenter();
                this.emitMetadata();
                // this.redrawImage(
                //     this._selectMetadata.img_x,
                //     this._selectMetadata.img_y,
                //     this._selectMetadata.img_w,
                //     this._selectMetadata.img_h,
                // );
                this._undoRedoService.appendStages({
                    meta: cloneDeep(this._selectMetadata),
                    method: 'draw',
                });
                // this.canvasContext?.drawImage(
                //     this.img,
                //     this._selectMetadata.img_x,
                //     this._selectMetadata.img_y,
                //     this._selectMetadata.img_w,
                //     this._selectMetadata.img_h,
                // );
                // this._boundingBoxCanvas.drawAllBoxOn(this._selectMetadata.bnd_box, this.canvasContext);
                // this.canvas.nativeElement.focus();
            };
        } catch (err) {
            console.log(err);
        }
    }

    keyMoveBox(direction: Direction) {
        try {
            const boundingBox = this._selectMetadata.bnd_box[this.annotateState.annotation];
            boundingBox &&
                this._boundingBoxCanvas.keyboardMoveBox(direction, boundingBox, this._selectMetadata, (isDone) => {
                    if (isDone) {
                        this._undoRedoService.appendStages({
                            meta: cloneDeep(this._selectMetadata),
                            method: 'draw',
                        });
                        this.getBBoxDistanceFromImage();
                        this.redrawImage(this._selectMetadata);
                        this.emitMetadata();
                    }
                });
        } catch (err) {
            console.log(err);
        }
    }

    redrawImage({ img_x, img_y, img_w, img_h }: BboxMetadata) {
        this.clearCanvas();
        this.canvasContext?.drawImage(this.img, img_x, img_y, img_w, img_h);
        this._boundingBoxCanvas.drawAllBoxOn(this._selectMetadata.bnd_box, this.canvasContext);
        // this.canvas.nativeElement.focus();
    }

    clearCanvas() {
        this.canvasContext?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    getBBoxDistanceFromImage() {
        this._boundingBoxCanvas.getBBoxDistfromImg(
            this._selectMetadata.bnd_box,
            this._selectMetadata.img_x,
            this._selectMetadata.img_y,
        );
    }

    getLabelList() {
        this.labelList = [];
        this.allLabelList = [];
        (this._tabStatus[1].label_list ? this._tabStatus[1].label_list : []).forEach((name: string) => {
            this.labelList.push({
                name,
                count: 0,
            });
            this.allLabelList.push({
                name,
                count: 0,
            });
        });
    }

    labelTypeTextChange(event: string) {
        this.labelList = this.allLabelList.filter((label) => label.name.includes(event));
    }

    labelNameClicked(label: string) {
        this.showDropdownLabelBox = false;
        this._onChangeAnnotationLabel.emit({ label, index: this.annotateState.annotation });
    }

    sortingLabelList(labelList: LabelInfo[], annotationList: any[]) {
        labelList.forEach((label, index) => {
            this.labelList[index].count = annotationList.filter((x) => x.label === label.name).length;
        });
        this.labelList.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0));
    }

    currentCursor() {
        const { grab, move, pointer, resize } = this.mouseCursor;
        return grab
            ? 'cursor-grab'
            : move
            ? 'cursor-move'
            : pointer
            ? 'cursor-pointer'
            : resize
            ? 'cursor-e-resize'
            : null;
    }

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
                    this.showDropdownLabelBox = false;
                    this._onChangeAnnotationLabel.emit({ label: value, index: this.annotateState.annotation });
                    this.labelSearch = '';
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

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
