import { AnnotateActionState, AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { BoundingBoxCanvasService } from './bounding-box-canvas.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from '../../../shared/services/copy-paste.service';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { MouseCursorState, MousrCursorService } from 'src/shared/services/mouse-cursor.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
import { WheelDelta, ZoomService, ZoomState } from 'src/shared/services/zoom.service';
import {
    ActionState,
    BboxMetadata,
    Boundingbox,
    ChangeAnnotationLabel,
    CompleteMetadata,
    Direction,
    LabelInfo,
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
    private mouseCursor!: MouseCursorState;
    private zoom!: ZoomState;
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
        private _zoomService: ZoomService,
        private _mouseCursorService: MousrCursorService,
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

        this._zoomService.zoom$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => (this.zoom = state));

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));
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

    annotateSelectChange(newState: AnnotateActionState) {
        this._annotateSelectState.setState(newState);
    }

    resetZoom() {
        this._zoomService.resetZoomScale();
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
                this.resetZoom();
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
                        this.annotateSelectChange({
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
                                this.annotateSelectChange({ annotation: -1, isDlbClick: false });
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
                this.annotateSelectChange({ annotation: this.annotateState.annotation, isDlbClick: true }));
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent & WheelDelta) {
        try {
            const mouseWithinPointPath = this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event);

            if (mouseWithinPointPath && this.canvasContext) {
                const { scale, x, y } = this._zoomService.calculateZoomScale(
                    event,
                    this.zoom,
                    this.canvas.nativeElement,
                );

                // prevent canvas scaling on UI but scroll state is false
                if (this.boundingBoxState.scroll) {
                    this._mouseCursorService.changeCursor(this.mouseCursor, event);
                    // this.canvas.nativeElement.style.transformOrigin = '0 0';
                    // this.canvas.nativeElement.style.transform = `scale(${this.scale}, ${this.scale})`;
                    // this.canvas.nativeElement.scrollTop = newScroll.y;
                    // this.canvas.nativeElement.scrollLeft = newScroll.x;
                    this.canvasContext.canvas.style.transformOrigin = `${event.offsetX}px ${event.offsetY}px`;
                    this.canvasContext.canvas.style.transform = `scale(${scale}, ${scale})`;
                    this._zoomService.setState({ scale });
                }

                this.canvasContext.canvas.scrollTop = y;
                this.canvasContext.canvas.scrollLeft = x;

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
                    this.changeMouseCursorState({ grabbing: true });
                    this._boundingBoxCanvas.setPanXY(event.offsetX, event.offsetY);
                }
                if (this.boundingBoxState.draw) {
                    const tmpBox = this._boundingBoxCanvas.mouseDownDrawEnable(
                        event.offsetX,
                        event.offsetY,
                        this._selectMetadata.bnd_box,
                    );
                    this.annotateSelectChange({ annotation: tmpBox, isDlbClick: false });
                    this.redrawImage(this._selectMetadata);
                }
            } else {
                this.mousedown = false;
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
                        // Positioning the floating div at the bottom right corner of bounding box
                        let posFromTop = event.offsetY * (100 / document.documentElement.clientHeight) + 8.5;
                        let posFromLeft = event.offsetX * (100 / document.documentElement.clientWidth) + 2.5;
                        // Re-adjustment of floating div position if it is outside of the canvas
                        if (posFromTop < 9) {
                            posFromTop = 9;
                        }
                        if (posFromTop > 76) {
                            posFromTop = 76;
                        }
                        if (posFromLeft < 2.5) {
                            posFromLeft = 2.5;
                        }
                        if (posFromLeft > 66) {
                            posFromLeft = 66;
                        }
                        this.floatdiv.nativeElement.style.top = posFromTop.toString() + 'vh';
                        this.floatdiv.nativeElement.style.left = posFromLeft.toString() + 'vw';
                        this.showDropdownLabelBox = true;
                        this.labelSearch = '';
                        this.invalidInput = false;
                        setTimeout(() => {
                            this.lbltypetxt.nativeElement.focus();
                        }, 100);
                    } else {
                        this.showDropdownLabelBox = false;
                    }
                    retObj.isNew && this.annotateSelectChange({ annotation: retObj.selBox, isDlbClick: false });
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
                    } else if (this.boundingBoxState.drag && !this.mousedown) {
                        this.changeMouseCursorState({ grab: true });
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
                            this.changeMouseCursorState({ crosshair: true });
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

    changeMouseCursorState(mouseCursor?: Partial<MouseCursorState>) {
        this._mouseCursorService.setState(mouseCursor);
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
                this.changeMouseCursorState();
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
        return this._mouseCursorService.changeCursor(this.mouseCursor);
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
