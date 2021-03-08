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
    private mouseCursor: MouseCursor = {
        move: false,
        pointer: false,
        grab: false,
    };
    private scale = 1;
    private factor = 0.05;
    private max_scale = 4;
    @Input() _selectMetadata!: BboxMetadata;
    @Input() _imgSrc: string = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Output() _onChangeMetadata: EventEmitter<BboxMetadata> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();

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
                    this.redrawImages(this._selectMetadata);
                    this.emitMetadata();
                }
            });

        this._annotateSelectState.labelStaging$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (state) => (
                    (this.annotateState = state),
                    this.annotateStateChange({ annotation: this.annotateState.annotation })
                ),
            );
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._selectMetadata?.currentValue) {
            this.redrawImages(this._selectMetadata);
        }

        if (changes._imgSrc?.currentValue) {
            this.initializeCanvas();
            this._undoRedoService.clearAllStages();
            this.loadImage(changes._imgSrc.currentValue);
            this.annotateStateChange({ annotation: -1 });
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

    annotateStateMakeChange(newState: AnnotateActionState) {
        this._annotateSelectState.setState(newState);
    }

    annotateStateChange({ annotation }: Pick<AnnotateActionState, 'annotation'>) {
        this._boundingBoxCanvas.setCurrentSelectedbBox(annotation);
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
                () => {},
            );
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._boundingBoxCanvas.setGlobalXY(tmpObj.newX, tmpObj.newY);
            this._boundingBoxCanvas.moveAllBbox(
                this._selectMetadata.bnd_box,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                (isDone: boolean) => {
                    if (isDone) {
                        const meta = cloneDeep(this._selectMetadata);
                        return this._undoRedoService.isMethodChange('zoom')
                            ? this._undoRedoService.appendStages({
                                  meta,
                                  method: 'zoom',
                              })
                            : this._undoRedoService.replaceStages({
                                  meta,
                                  method: 'zoom',
                              });
                    }
                },
            );
            this.redrawImages(this._selectMetadata);
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
                        const pastedMetadata = this._copyPasteService.paste<Boundingbox>();
                        pastedMetadata && this._selectMetadata.bnd_box.push(pastedMetadata);
                        this.annotateStateMakeChange({
                            annotation: this._selectMetadata.bnd_box.length - 1,
                            isDlbClick: false,
                        });
                        this._boundingBoxCanvas.getBBoxDistfromImg(
                            this._selectMetadata.bnd_box,
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                        );
                    }

                    this._undoRedoService.appendStages({
                        meta: cloneDeep(this._selectMetadata),
                        method: 'draw',
                    });
                    this.emitMetadata();
                    this.canvas.nativeElement.focus();
                } else if (ctrlKey && shiftKey && (key === 'z' || key === 'Z')) {
                    // redo
                    if (this._undoRedoService.isAllowRedo()) {
                        const rtStages: UndoState = this._undoRedoService.redo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
                        this.redrawImages(this._selectMetadata);
                        this.emitMetadata();
                    }
                } else if (ctrlKey && (key === 'z' || key === 'Z')) {
                    // undo
                    if (this._undoRedoService.isAllowUndo()) {
                        const rtStages: UndoState = this._undoRedoService.undo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
                        this.redrawImages(this._selectMetadata);
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
                                this.annotateStateMakeChange({ annotation: -1, isDlbClick: false });
                                this.redrawImages(this._selectMetadata);
                                this._undoRedoService.appendStages({
                                    meta: cloneDeep(this._selectMetadata),
                                    method: 'draw',
                                });
                                this.emitMetadata();
                            }
                        },
                    );
                } else {
                    key === 'ArrowLeft'
                        ? this.keyMoveBox('left')
                        : key === 'ArrowRight'
                        ? this.keyMoveBox('right')
                        : key === 'ArrowUp'
                        ? this.keyMoveBox('up')
                        : key === 'ArrowDown' && this.keyMoveBox('down');
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
                this.annotateStateMakeChange({ annotation: this.annotateState.annotation, isDlbClick: true }));
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent & { wheelDelta: number }) {
        try {
            const mouseWithinPointPath = this._boundingBoxCanvas.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            );

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
            if (
                this._boundingBoxCanvas.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                this.mousedown = true;
                if (this.boundingBoxState.drag) {
                    this._boundingBoxCanvas.setPanXY(event.offsetX, event.offsetY);
                }
                if (this.boundingBoxState.draw) {
                    const tmpBox: number = this._boundingBoxCanvas.mouseDownDrawEnable(
                        event.offsetX,
                        event.offsetY,
                        this._selectMetadata.bnd_box,
                    );
                    this.annotateStateMakeChange({ annotation: tmpBox, isDlbClick: false });
                    this.redrawImages(this._selectMetadata);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        try {
            if (
                this._boundingBoxCanvas.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
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
                            this._boundingBoxCanvas.getBBoxDistfromImg(
                                this._selectMetadata.bnd_box,
                                this._selectMetadata.img_x,
                                this._selectMetadata.img_y,
                            );
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
                        setTimeout(() => {
                            this.lbltypetxt.nativeElement.focus();
                        }, 100);
                    } else {
                        this.showDropdownLabelBox = false;
                    }
                    retObj.isNew && this.annotateStateMakeChange({ annotation: retObj.selBox, isDlbClick: false });
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
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                );
                if (mouseWithinPointPath && !this.showDropdownLabelBox) {
                    if (this.boundingBoxState.drag && this.mousedown) {
                        const diff: {
                            diffX: number;
                            diffY: number;
                        } = this._boundingBoxCanvas.getdiffXY(event.offsetX, event.offsetY);
                        this._selectMetadata.img_x = diff.diffX;
                        this._selectMetadata.img_y = diff.diffY;
                        this._boundingBoxCanvas.panRectangle(
                            this._selectMetadata.bnd_box,
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            (isDone: boolean) => {
                                if (isDone) {
                                    const meta = cloneDeep(this._selectMetadata);
                                    return this._undoRedoService.isMethodChange('pan')
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
                        this.redrawImages(this._selectMetadata);
                    }
                    if (this.boundingBoxState.draw && this.mousedown) {
                        this._boundingBoxCanvas.mouseMoveDrawEnable(event.offsetX, event.offsetY, this._selectMetadata);
                        this.redrawImages(this._selectMetadata);
                    }
                    if (this.boundingBoxState.draw && !this.mousedown) {
                        const { box } = this._boundingBoxCanvas.getCurrentClickBox(
                            event.offsetX,
                            event.offsetY,
                            this._selectMetadata.bnd_box,
                        );

                        if (box !== -1) {
                            this.mouseCursor = {
                                grab: false,
                                pointer: false,
                                move: true,
                            };
                        } else {
                            this.mouseCursor = {
                                grab: false,
                                pointer: true,
                                move: false,
                            };
                        }
                    }
                } else {
                    this.mouseCursor = {
                        grab: false,
                        pointer: false,
                        move: false,
                    };
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

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            if (
                (event.target as Element).className === 'canvasstyle' &&
                !(event.relatedTarget as Element)?.className.includes('unclosedOut')
            ) {
                this.showDropdownLabelBox = false;
            }
            if (this.boundingBoxState.drag && this.mousedown) {
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.redrawImages(this._selectMetadata);
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
                // this.redrawImages(
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
            this._boundingBoxCanvas.keyboardMoveBox(
                direction,
                this._selectMetadata.bnd_box[this.annotateState.annotation],
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                (isDone) => {
                    if (isDone) {
                        this._undoRedoService.appendStages({
                            meta: cloneDeep(this._selectMetadata),
                            method: 'draw',
                        });
                        this._boundingBoxCanvas.getBBoxDistfromImg(
                            this._selectMetadata.bnd_box,
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                        );
                        this.redrawImages(this._selectMetadata);
                        this.emitMetadata();
                    }
                },
            );
        } catch (err) {
            console.log(err);
        }
    }

    redrawImages({ img_x, img_y, img_w, img_h }: BboxMetadata) {
        this.clearCanvas();
        this.canvasContext?.drawImage(this.img, img_x, img_y, img_w, img_h);
        this._boundingBoxCanvas.drawAllBoxOn(this._selectMetadata.bnd_box, this.canvasContext);
        this.canvas.nativeElement.focus();
    }

    clearCanvas() {
        this.canvasContext?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
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
        const { grab, move, pointer } = this.mouseCursor;
        return grab ? 'cursor-grab' : move ? 'cursor-move' : pointer ? 'cursor-pointer' : null;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
