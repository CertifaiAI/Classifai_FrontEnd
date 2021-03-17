import { ActionState, Direction, Polygons, PolyMetadata, UndoState } from '../image-labelling.model';
import { AnnotateActionState, AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from 'src/shared/services/copy-paste.service';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { MouseCursorState, MousrCursorService } from 'src/shared/services/mouse-cursor.service';
import { SegmentationCanvasService } from './segmentation-canvas.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UndoRedoService } from 'src/shared/services/undo-redo.service';
import { WheelDelta, ZoomService, ZoomState } from 'src/shared/services/zoom.service';
import {
    ChangeDetectionStrategy,
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

@Component({
    selector: 'image-labelling-segmentation',
    templateUrl: './image-labelling-segmentation.component.html',
    styleUrls: ['./image-labelling-segmentation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingSegmentationComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    private canvasContext!: CanvasRenderingContext2D | null;
    private image: HTMLImageElement = new Image();
    private isMouseWithinPoint: boolean = false;
    private altKey: boolean = false;
    private ctrlKey: boolean = false;
    private segState!: ActionState;
    private annotateState!: AnnotateActionState;
    private unsubscribe$: Subject<any> = new Subject();
    private zoom!: ZoomState;
    mouseCursor!: MouseCursorState;
    mousedown: boolean = false;
    @Input() _selectMetadata!: PolyMetadata;
    @Input() _imgSrc: string = '';
    @Output() _onChangeMetadata: EventEmitter<PolyMetadata> = new EventEmitter();

    constructor(
        private _segCanvasService: SegmentationCanvasService,
        private _imgLblStateService: ImageLabellingActionService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
        private _zoomService: ZoomService,
        private _mouseCursorService: MousrCursorService,
    ) {}

    ngOnInit(): void {
        this._imgLblStateService.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ clear, fitCenter, ...action }) => {
                this.segState = { ...action, clear, fitCenter };
                fitCenter && this.imgFitToCenter();
                if (clear) {
                    this._selectMetadata.polygons = [];
                    this.redrawImage(this._selectMetadata);
                    this.emitMetadata();
                }
            });

        this._annotateSelectState.labelStaging$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
            this.annotateState = state;
            this._segCanvasService.setSelectedPolygon(state.annotation);
        });

        this._zoomService.zoom$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => (this.zoom = state));

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._imgSrc?.currentValue) {
            this.initializeCanvas();
            this._undoRedoService.clearAllStages();
            this.loadImage(changes._imgSrc.currentValue);
            this._segCanvasService.setSelectedPolygon(-1);
        }
    }

    initializeCanvas() {
        this.canvas.nativeElement.style.width = '80%';
        this.canvas.nativeElement.style.height = '90%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d');
    }

    loadImage(base64: string) {
        this.image.src = base64;
        this.image.onload = () => {
            this._selectMetadata.img_w =
                this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
            this._selectMetadata.img_h =
                this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
            this._segCanvasService.setGlobalXY(this._selectMetadata);
            this.imgFitToCenter();
            this.emitMetadata();
            this.changeMouseCursorState();
            this._undoRedoService.appendStages({ meta: cloneDeep(this._selectMetadata), method: 'draw' });
        };
    }

    emitMetadata() {
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    annotateStateChange(newState?: AnnotateActionState) {
        newState && this._annotateSelectState.setState(newState);
    }

    resetZoom() {
        this._zoomService.resetZoomScale();
    }

    imgFitToCenter() {
        try {
            const tmpObj = this._segCanvasService.calScaleToFitScreen(this._selectMetadata, this.canvas.nativeElement);
            this._selectMetadata.img_w *= tmpObj.factor;
            this._selectMetadata.img_h *= tmpObj.factor;
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._segCanvasService.scalePolygons(this._selectMetadata, tmpObj);
            this._segCanvasService.setGlobalXY({ img_x: tmpObj.newX, img_y: tmpObj.newY });
            this._segCanvasService.panPolygons(this._selectMetadata, false, (isDone) => {
                if (isDone) {
                    const meta = cloneDeep(this._selectMetadata);
                    this._undoRedoService.isMethodChange('zoom')
                        ? this._undoRedoService.appendStages({
                              meta,
                              method: 'zoom',
                          })
                        : this._undoRedoService.replaceStages({
                              meta,
                              method: 'zoom',
                          });
                }
            });
            this.redrawImage(this._selectMetadata);
            if (this.canvasContext) {
                this.resetZoom();
                this.canvasContext.canvas.style.transformOrigin = `0 0`;
                this.canvasContext.canvas.style.transform = `scale(1, 1)`;
            }
        } catch (err) {
            console.log('imgFitToCenter', err);
        }
    }

    redrawImage({ img_x, img_y, img_w, img_h }: PolyMetadata) {
        try {
            this.clearcanvas();
            if (this.canvasContext) {
                this.canvasContext.drawImage(this.image, img_x, img_y, img_w, img_h);

                this._segCanvasService.drawAllPolygon(
                    this._selectMetadata,
                    this.canvasContext,
                    this.annotateState.annotation,
                );
                // this.canvas.nativeElement.focus();
            }
        } catch (err) {
            console.log('redrawImage', err);
        }
    }

    clearcanvas() {
        const { width, height } = this.canvas.nativeElement;
        this.canvasContext?.clearRect(0, 0, width, height);
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent & WheelDelta) {
        try {
            this.isMouseWithinPoint = this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);

            if (this.isMouseWithinPoint && this.canvasContext) {
                const { scale, x, y } = this._zoomService.calculateZoomScale(
                    event,
                    this.zoom,
                    this.canvas.nativeElement,
                );

                // prevent canvas scaling on UI but scroll state is false
                if (this.segState.scroll) {
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
            console.log('mouseScroll', err);
        }
    }

    // @HostListener('dblclick', ['$event'])
    // toggleEvent(_: MouseEvent) {
    //     try {
    //         if (this.annotateState.annotation > -1) {
    //             this._undoRedoService.clearRedundantStages();
    //             this.annotateStateChange({ annotation: -1, isDlbClick: true });
    //         }
    //     } catch (err) {
    //         console.log('toggleEvent', err);
    //     }
    // }

    @HostListener('dblclick', ['$event'])
    canvasDblClickEvent(_: MouseEvent) {
        const { isActiveModal, draw } = this.segState;
        if (
            !isActiveModal &&
            draw &&
            // !this.isMouseWithinPoint &&
            this.canvasContext &&
            this.canvasContext.canvas.style.pointerEvents !== 'none'
        ) {
            if (this._segCanvasService.isNewPolygon()) {
                this._segCanvasService.drawNewPolygon(
                    this._selectMetadata,
                    this.image,
                    this.canvasContext,
                    this.canvas.nativeElement,
                    true,
                );
                this._segCanvasService.validateXYDistance(this._selectMetadata);
            }
        }
    }

    @HostListener('window:keydown', ['$event'])
    canvasKeyDownEvent({ ctrlKey, shiftKey, key }: KeyboardEvent) {
        try {
            const { isActiveModal, draw } = this.segState;
            // this.ctrlKey = ctrlKey;
            if (
                !isActiveModal &&
                draw &&
                // !this.isMouseWithinPoint &&
                this.canvasContext &&
                this.canvasContext.canvas.style.pointerEvents !== 'none'
            ) {
                if (this._segCanvasService.isNewPolygon()) {
                    const { annotation } = this.annotateState;
                    switch (key) {
                        case 'Enter':
                            this._segCanvasService.drawNewPolygon(
                                this._selectMetadata,
                                this.image,
                                this.canvasContext,
                                this.canvas.nativeElement,
                                true,
                            );
                            // this.annotateStateChange({ annotation, isDlbClick: false });
                            // this._segCanvasService.setSelectedPolygon(annotation);
                            this._segCanvasService.validateXYDistance(this._selectMetadata);
                            // this.ClearallBoundingboxList(this.seg.Metadata[this.seg.getCurrentSelectedimgidx()].polygons);
                            // this.RefreshBoundingBoxList();

                            // let selectedpoly: MetadataPoly = this.seg.Metadata[this.seg.getCurrentSelectedimgidx()];
                            // this.ResetClippath(selectedpoly.img_x, selectedpoly.img_y, selectedpoly.img_w, selectedpoly.img_h);
                            // this.appendQueue(this.seg.getCurrentSelectedimgidx());
                            // this.appendCache(this.seg.Metadata[this.seg.getCurrentSelectedimgidx()]);
                            // this.stages.SaveStages({
                            //     stage: this.seg.Metadata[this.seg.getCurrentSelectedimgidx()],
                            //     method: 'draw',
                            // });

                            this.emitMetadata();
                            break;
                        case 'Escape':
                            this._segCanvasService.resetDrawing(
                                this._selectMetadata,
                                this.image,
                                this.canvasContext,
                                this.canvas.nativeElement,
                            );
                            // this._segCanvasService.setSelectedPolygon(annotation);
                            break;
                    }
                } else {
                    switch (key) {
                        case 'Delete':
                        case 'Backspace':
                            // delete single annotation
                            this._segCanvasService.deleteSinglePolygon(
                                this._selectMetadata,
                                this.annotateState.annotation,
                                (isDone) => {
                                    if (isDone) {
                                        this.annotateStateChange();
                                        this.redrawImage(this._selectMetadata);
                                        this._undoRedoService.appendStages({
                                            meta: cloneDeep(this._selectMetadata),
                                            method: 'draw',
                                        });
                                        this.emitMetadata();
                                    }
                                },
                            );
                            break;
                    }
                }
                const direction =
                    key === 'ArrowLeft'
                        ? 'left'
                        : key === 'ArrowRight'
                        ? 'right'
                        : key === 'ArrowUp'
                        ? 'up'
                        : key === 'ArrowDown' && 'down';
                direction && this.keyMoveBox(direction);
                // this.canvasContext.canvas.focus();
            }
            if (!this.isMouseWithinPoint) {
                if (ctrlKey && (key === 'c' || key === 'C')) {
                    // copy
                    this.annotateState.annotation > -1 &&
                        this._copyPasteService.copy(this._selectMetadata.polygons[this.annotateState.annotation]);
                } else if (ctrlKey && (key === 'v' || key === 'V')) {
                    // paste
                    if (this._copyPasteService.isAvailable()) {
                        this._selectMetadata.polygons.push(this._copyPasteService.paste() as Polygons);
                        // this.rulesMakeChange(null, this._selectMetadata.bnd_box.length - 1, null, null, null),
                        this.annotateStateChange({
                            annotation: this._selectMetadata.polygons.length - 1,
                            isDlbClick: false,
                        });
                        this._segCanvasService.validateXYDistance(this._selectMetadata);
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
                        this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
                        this.redrawImage(this._selectMetadata);
                        this.emitMetadata();
                    }
                } else if (ctrlKey && (key === 'z' || key === 'Z')) {
                    // undo
                    if (this._undoRedoService.isAllowUndo()) {
                        const rtStages: UndoState = this._undoRedoService.undo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
                        this.redrawImage(this._selectMetadata);
                        this.emitMetadata();
                    }
                }
            }
        } catch (err) {
            console.log('canvasKeyDownEvent', err);
        }
    }

    keyMoveBox(direction: Direction) {
        try {
            const polygon = this._selectMetadata.polygons[this.annotateState.annotation];
            polygon &&
                this.canvasContext &&
                this._segCanvasService.keyboardMovePolygon(
                    this._selectMetadata,
                    direction,
                    this.annotateState.annotation,
                    this.image,
                    this.canvasContext,
                    this.canvas.nativeElement,
                    (isDone) => {
                        if (isDone) {
                            this._undoRedoService.appendStages({
                                meta: cloneDeep(this._selectMetadata),
                                method: 'draw',
                            });
                            this._segCanvasService.validateXYDistance(this._selectMetadata);
                            this.redrawImage(this._selectMetadata);
                            this.emitMetadata();
                        }
                    },
                );
        } catch (err) {
            console.log('keyMoveBox', err);
        }
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        try {
            this.isMouseWithinPoint = this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);

            if (this.isMouseWithinPoint) {
                this.mousedown = true;
                if (this.segState.drag) {
                    this.changeMouseCursorState({ grabbing: true });
                    this._segCanvasService.setPanXY(event);
                }
                if (this.segState.draw && this.canvasContext && this.mousedown) {
                    const tmpPoly = this._segCanvasService.mouseDownDraw(
                        event,
                        this._selectMetadata,
                        this.canvas.nativeElement,
                        this.image,
                        this.canvasContext,
                        this.ctrlKey,
                        this.altKey,
                    );
                    this.annotateStateChange({ annotation: tmpPoly, isDlbClick: false });

                    const mouseWithinShape = this.mouseMoveDrawCanvas(event);
                } else if (this.segState.draw && !this.mousedown) {
                    this.redrawImage(this._selectMetadata);
                }
            } else {
                this.mousedown = false;
            }
        } catch (err) {
            console.log('mouseDown', err);
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        try {
            this.isMouseWithinPoint = this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);
            const isNewPolygon = this._segCanvasService.isNewPolygon();
            // this._selectMetadata as truefy value
            // as user can click on image but img not yet loaded onto screen
            // but mouse has already moving into canvas, thus getting error
            if (this._selectMetadata && this.isMouseWithinPoint && this.mousedown) {
                if (this.segState.drag) {
                    this._segCanvasService.setGlobalXY(this._selectMetadata);
                }
                if (this.segState.draw && !isNewPolygon && this.annotateState.annotation > -1) {
                    if (this._undoRedoService.isStateChange(this._selectMetadata.polygons)) {
                        this._undoRedoService.appendStages({
                            meta: cloneDeep(this._selectMetadata),
                            method: 'draw',
                        });
                        // this._segCanvasService.setGlobalXY({ img_x: -1, img_y: -1 });
                        this._segCanvasService.validateXYDistance(this._selectMetadata);
                        this.emitMetadata();
                    }
                }
            }
            this.mousedown = false;
        } catch (err) {
            console.log('mouseUp', err);
        }
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        try {
            // this._selectMetadata as truefy value
            // as user can click on image but img not yet loaded onto screen
            // but mouse has already moving into canvas, thus getting error
            this.isMouseWithinPoint =
                this._selectMetadata && this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);
            if (this.isMouseWithinPoint) {
                if (this.segState.drag && this.mousedown) {
                    const diffAxis = this._segCanvasService.getDiffXY(event);
                    // const { x, y } = this._segCanvasService.getGlobalXY();
                    // const { diffX, diffY } = {
                    //     diffX: diffAxis.diffX + x,
                    //     diffY: diffAxis.diffY + y,
                    // };
                    this._selectMetadata.img_x = diffAxis.diffX;
                    this._selectMetadata.img_y = diffAxis.diffY;
                    this._segCanvasService.panPolygons(this._selectMetadata, false, (isDone) => {
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
                    });
                    this.redrawImage(this._selectMetadata);
                } else if (this.segState.drag && !this.mousedown) {
                    this.changeMouseCursorState({ grab: true });
                }
                if (this.segState.draw && this.canvasContext) {
                    const mouseWithinShape = this.mouseMoveDrawCanvas(event);
                    if (mouseWithinShape) {
                        this.changeMouseCursorState({ move: true });
                    } else {
                        this.changeMouseCursorState({ crosshair: true });
                    }
                }
            } else {
                this.changeMouseCursorState();

                // console.log(this.crossh);
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
        } catch (err) {
            console.log('mouseMove', err);
        }
    }

    mouseMoveDrawCanvas(event: MouseEvent) {
        const mouseWithinShape =
            this.canvasContext &&
            this._segCanvasService.mouseMoveDraw(
                this._selectMetadata,
                this.image,
                this.canvasContext,
                this.canvas.nativeElement,
                event,
                this.ctrlKey,
                this.mousedown,
                (method) => {
                    // if (method === 'pan') {
                    //     this._undoRedoService.isMethodChange('pan')
                    //         ? this._undoRedoService.appendStages({
                    //               meta: this._selectMetadata,
                    //               method: 'pan',
                    //           })
                    //         : this._undoRedoService.replaceStages({
                    //               meta: this._selectMetadata,
                    //               method: 'pan',
                    //           });
                    // }
                    // this._segCanvasService.validateXYDistance(this._selectMetadata);
                    this.redrawImage(this._selectMetadata);
                    this.emitMetadata();
                },
            );
        return mouseWithinShape;
    }

    changeMouseCursorState(mouseCursor?: Partial<MouseCursorState>) {
        this._mouseCursorService.setState(mouseCursor);
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(_: MouseEvent) {
        try {
            if (this.segState.drag && this.isMouseWithinPoint && this.mousedown) {
                this._segCanvasService.setGlobalXY(this._selectMetadata);
                this.redrawImage(this._selectMetadata);
            }
            this.isMouseWithinPoint = false;
        } catch (err) {
            console.log('mouseOut', err);
        }
    }

    currentCursor() {
        return this._mouseCursorService.changeCursor(this.mouseCursor);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
