/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectorRef } from '@angular/core';
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
    @ViewChild('floatdiv') floatdiv!: ElementRef<HTMLDivElement>;
    @ViewChild('lbltypetxt') lbltypetxt!: ElementRef<HTMLInputElement>;
    @ViewChild('availablelbl') availablelbl!: ElementRef<HTMLDivElement>;
    private canvasContext!: CanvasRenderingContext2D;
    private image: HTMLImageElement = new Image();
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
        private _ref: ChangeDetectorRef,
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
                if (clear || fitCenter || action.drag || action.draw || action.save || action.keyInfo) {
                    this.showDropdownLabelBox = false; // close dropdown label if user click clear
                    this._ref.detectChanges();
                }
                this.boundingBoxState = { ...action, clear, fitCenter };

                fitCenter && this.imgFitToCenter();
                if (clear) {
                    this._selectMetadata.bnd_box = [];
                    this._undoRedoService.appendStages({
                        meta: this._selectMetadata,
                        method: 'draw',
                    });
                    this.redrawImage(this._selectMetadata);
                    this.emitMetadata();
                }
            });

        this._annotateSelectState.labelStaging$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
            this.annotateState = state;
            this._boundingBoxCanvas.setCurrentSelectedbBox(state.annotation);
            /**
             * allow click annotate to highlight respective BB
             * @property _selectMetadata trufy check due to first start project will have no state
             *           but after that it will always it's state being filled
             */
            this._selectMetadata && this.redrawImage(this._selectMetadata);
        });

        this._zoomService.zoom$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => (this.zoom = state));

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._selectMetadata?.previousValue && changes._selectMetadata?.currentValue) {
            this.redrawImage(this._selectMetadata);
        }

        if (changes._imgSrc?.currentValue) {
            this.initializeCanvas();
            this._undoRedoService.clearAllStages();
            this.loadImage(changes._imgSrc.currentValue);
            this._boundingBoxCanvas.setCurrentSelectedbBox(-1);
        }

        if (changes._tabStatus) {
            let adjustImagePosition = true;
            for (const { closed } of this._tabStatus) {
                if (!closed) {
                    adjustImagePosition = false;
                    break;
                }
            }

            if (this.canvas) {
                if (adjustImagePosition === true) {
                    this.initializeCanvas('96%');
                    this.imgFitToCenter();
                } else {
                    this.redrawImage(this._selectMetadata);
                }
            }
        }
    }

    initializeCanvas(width: string = '80%') {
        this.canvas.nativeElement.style.width = width;
        this.canvas.nativeElement.style.height = '90%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
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
            this.resetZoom();
            this.canvasContext.canvas.style.transformOrigin = `0 0`;
            this.canvasContext.canvas.style.transform = `scale(1, 1)`;
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ ctrlKey, metaKey, shiftKey, key }: KeyboardEvent) {
        try {
            const { isActiveModal } = this.boundingBoxState;
            if (!this.mousedown && !isActiveModal && !this.showDropdownLabelBox && this._selectMetadata) {
                if ((ctrlKey || metaKey) && (key === 'c' || key === 'C')) {
                    // copy
                    this.annotateState.annotation > -1 &&
                        this._copyPasteService.copy(this._selectMetadata.bnd_box[this.annotateState.annotation]);
                } else if ((ctrlKey || metaKey) && (key === 'v' || key === 'V')) {
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
                } else if ((ctrlKey || metaKey) && shiftKey && (key === 'z' || key === 'Z')) {
                    // redo
                    if (this._undoRedoService.isAllowRedo()) {
                        const rtStages: UndoState = this._undoRedoService.redo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
                        this.redrawImage(this._selectMetadata);
                        this.getBBoxDistanceFromImage();
                        this.emitMetadata();
                    }
                } else if ((ctrlKey || metaKey) && (key === 'z' || key === 'Z')) {
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

    @HostListener('wheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent & WheelDelta) {
        try {
            const mouseWithinPointPath = this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event);

            if (mouseWithinPointPath) {
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
                    if (this._zoomService.validateZoomScale(this.canvasContext, scale)) {
                        this.canvasContext.canvas.style.transformOrigin = `${event.offsetX}px ${event.offsetY}px`;
                        this.canvasContext.canvas.style.transform = `scale(${scale}, ${scale})`;
                        this._zoomService.setState({ scale });
                    }
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
            if (this.boundingBoxState.draw && this.mousedown) {
                this.finishDrawBoundingBox(event);
            }
            if (this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event)) {
                if (this.boundingBoxState.drag && this.mousedown) {
                    this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
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
                        const { box, pos } = this._boundingBoxCanvas.getCurrentClickBox(
                            event.offsetX,
                            event.offsetY,
                            this._selectMetadata.bnd_box,
                        );

                        if (box !== -1) {
                            // 7 cases:
                            // 1. top left
                            if (pos === 'tl') {
                                this.changeMouseCursorState({ 'nw-resize': true });
                            }
                            // 2. top right
                            else if (pos === 'tr') {
                                this.changeMouseCursorState({ 'ne-resize': true });
                            }
                            // 3. bottom left
                            else if (pos === 'bl') {
                                this.changeMouseCursorState({ 'sw-resize': true });
                            }
                            // 4. bottom right
                            else if (pos === 'br') {
                                this.changeMouseCursorState({ 'se-resize': true });
                            }
                            // 5. left center & right center
                            else if (pos === 'l' || pos === 'r') {
                                this.changeMouseCursorState({ 'w-resize': true });
                            }
                            // 6. top center & bottom center
                            else if (pos === 't' || pos === 'b') {
                                this.changeMouseCursorState({ 'n-resize': true });
                            }
                            // 7. Else
                            else {
                                this.changeMouseCursorState({ move: true });
                            }
                        } else {
                            this.changeMouseCursorState({ crosshair: true });
                        }
                    }
                } else {
                    this.changeMouseCursorState();
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    finishDrawBoundingBox(event: MouseEvent) {
        this.getLabelList();
        const annotationList = this._tabStatus[2].annotation
            ? this._tabStatus[2].annotation[0].bnd_box
                ? this._tabStatus[2].annotation[0].bnd_box
                : []
            : [];
        this.sortingLabelList(this.labelList, annotationList);
        const retObj = this._boundingBoxCanvas.mouseUpDrawEnable(this._selectMetadata, this.labelList, (isDone) => {
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
        if (retObj.isNew || event.type === 'mouseout') {
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

    changeMouseCursorState(mouseCursor?: Partial<MouseCursorState>) {
        this._mouseCursorService.setState(mouseCursor);
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            if (this.boundingBoxState.draw && this.mousedown) {
                this.finishDrawBoundingBox(event);
            }
            if (
                ((event.target as Element).className === 'canvasstyle' ||
                    (event.target as Element).className.includes('unclosedOut')) &&
                !(event.relatedTarget as Element)?.className.includes('unclosedOut') &&
                !(event.relatedTarget as Element)?.className.includes('canvasstyle')
            ) {
                if (this._selectMetadata.bnd_box.filter((bb) => bb.label === '').length !== 0) {
                    this.showDropdownLabelBox = false;
                    this._selectMetadata.bnd_box = this._selectMetadata.bnd_box.filter((bb) => bb.label !== '');
                    this._onChangeMetadata.emit(this._selectMetadata);
                    this.redrawImage(this._selectMetadata);
                    alert('Some bounding boxes will be deleted because they were not labelled.');
                }
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
            this.showDropdownLabelBox = false;
            this.image.src = bit64STR;
            // this.clearCanvas();
            this.image.onload = () => {
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
                //     this.image,
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
        this.canvasContext.drawImage(this.image, img_x, img_y, img_w, img_h);
        if (this._tabStatus[2].annotation?.length !== 0) {
            this.getLabelList();
            const annotationList = this._tabStatus[2].annotation
                ? this._tabStatus[2].annotation[0].bnd_box
                    ? this._tabStatus[2].annotation[0].bnd_box
                    : []
                : [];
            this.sortingLabelList(this.labelList, annotationList);
        }
        this._boundingBoxCanvas.drawAllBoxOn(this.labelList, this._selectMetadata.bnd_box, this.canvasContext);
        // this.canvas.nativeElement.focus();
    }

    clearCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
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
        this._selectMetadata.bnd_box[this.annotateState.annotation].label = label;
        this._undoRedoService.isStateChange(this._selectMetadata.bnd_box) &&
            this._undoRedoService.appendStages({
                meta: this._selectMetadata,
                method: 'draw',
            });
    }

    sortingLabelList(labelList: LabelInfo[], annotationList: Boundingbox[]) {
        labelList.forEach(({ name }, index) => {
            this.labelList[index].count = annotationList.filter(({ label }) => label === name).length;
            this.allLabelList[index].count = annotationList.filter(({ label }) => label === name).length;
        });
        this.labelList.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0));
        this.allLabelList.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0));
    }

    currentCursor() {
        return this._mouseCursorService.changeCursor(this.mouseCursor);
    }

    validateInputLabel = ({ target }: HTMLElementEvent<HTMLTextAreaElement>): void => {
        const { value } = target;
        const valTrimmed = value.trim();
        if (valTrimmed) {
            const isInvalidLabel: boolean = this._tabStatus.some(
                ({ label_list }) => label_list && label_list.length && label_list.some((label) => label === valTrimmed),
            );
            if (!isInvalidLabel) {
                this.invalidInput = false;
                this.showDropdownLabelBox = false;
                this._onChangeAnnotationLabel.emit({ label: value, index: this.annotateState.annotation });
                this._selectMetadata.bnd_box[this.annotateState.annotation].label = value;
                this._undoRedoService.isStateChange(this._selectMetadata.bnd_box) &&
                    this._undoRedoService.appendStages({
                        meta: this._selectMetadata,
                        method: 'draw',
                    });
                this.labelSearch = '';
            } else {
                this.invalidInput = true;
                console.error(`Invalid existing label input`);
            }
        }
    };

    ngOnDestroy(): void {
        this._annotateSelectState.setState();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
