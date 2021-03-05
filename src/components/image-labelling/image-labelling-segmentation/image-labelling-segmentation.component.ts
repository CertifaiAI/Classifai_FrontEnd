import { ActionState, Direction, MouseCursor, Polygons, PolyMetadata, UndoState } from '../image-labelling.model';
import { AnnotateActionState, AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from 'src/shared/services/copy-paste.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { SegmentationCanvasService } from './segmentation-canvas.service';
import { UndoRedoService } from 'src/shared/services/undo-redo.service';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
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
export class ImageLabellingSegmentationComponent implements OnInit, OnChanges {
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
    mouseCursor: MouseCursor = {
        move: false,
        pointer: false,
        grab: false,
    };
    @Input() _selectMetadata!: PolyMetadata;
    @Input() _imgSrc: string = '';
    @Output() _onChangeMetadata: EventEmitter<PolyMetadata> = new EventEmitter();

    constructor(
        private _segCanvasService: SegmentationCanvasService,
        private _imgLblStateService: ImageLabellingActionService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit(): void {
        this._imgLblStateService.action$.pipe(distinctUntilChanged()).subscribe((val) => {
            this.segState = val;
            val.fitCenter && this.isFitCenter();
            val.clear && this.isClearCanvas(this._selectMetadata);
        });
        this._annotateSelectState.labelStaging$
            .pipe(distinctUntilChanged())
            .subscribe((state) => ((this.annotateState = state), this.annotateStateOnChange()));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._imgSrc?.currentValue) {
            this.initializeCanvas();
            this.loadImage(changes._imgSrc.currentValue);
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
            // tslint:disable-next-line: prefer-const
            let { img_w, img_h, img_ori_w, img_ori_h } = this._selectMetadata;
            this._selectMetadata.img_w = img_w < 1 ? img_ori_w : img_w;
            this._selectMetadata.img_h = img_h < 1 ? img_ori_h : img_h;
            // this._segCanvasService.setGlobalXY(this._selectMetadata);
            this.imgFitToCenter();
            this._undoRedoService.appendStages({ meta: cloneDeep(this._selectMetadata), method: 'draw' });
        };
    }

    emitMetadata() {
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    annotateStateMakeChange(newState?: AnnotateActionState) {
        newState && this._annotateSelectState.setState(newState);
    }

    annotateStateOnChange() {
        this.annotateState && this._segCanvasService.setSelectedPolygonIndex(this.annotateState.annotation);
    }

    // rulesMakeChange(scroll?: boolean, fitToScreen?: boolean, clearScreen?: boolean) {
    //     try {
    //         const tempRules = clone(this.segState);
    //         scroll && (tempRules.scroll = scroll);
    //         fitToScreen && (tempRules.fitCenter = fitToScreen);
    //         clearScreen && (tempRules.clear = clearScreen);
    //         this._imgLblStateService.setState(tempRules);
    //     } catch (err) {
    //         console.log('rulesMakeChange', err);
    //     }
    // }

    imgFitToCenter() {
        try {
            const tmpObj = this._segCanvasService.calScaleToFitScreen(this._selectMetadata, this.canvas.nativeElement);
            this._selectMetadata.img_w *= tmpObj.factor;
            this._selectMetadata.img_h *= tmpObj.factor;
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._segCanvasService.scalePolygons(this._selectMetadata, tmpObj);

            const { img_x, img_y } = this._selectMetadata;
            this._segCanvasService.setGlobalXY({ img_x: tmpObj.newX, img_y: tmpObj.newY });
            this._segCanvasService.panPolygons(this._selectMetadata, img_x, img_y, false);
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
            this.redrawImage(this._selectMetadata);
            this.emitMetadata();
        } catch (err) {
            console.log('imgFitToCenter', err);
        }
    }

    isClearCanvas(metadata: PolyMetadata) {
        try {
            if (this.segState.clear) {
                metadata.polygons = [];
                this.redrawImage(metadata);
                // this.rulesMakeChange(undefined, undefined, false);
                this.emitMetadata();
            }
        } catch (err) {
            console.log('isClearCanvas', err);
        }
    }

    isFitCenter() {
        this.segState.fitCenter && this.imgFitToCenter();
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
                this.canvas.nativeElement.focus();
            }
        } catch (err) {
            console.log('redrawImage', err);
        }
    }

    clearcanvas() {
        const { width, height } = this.canvas.nativeElement;
        this.canvasContext?.clearRect(0, 0, width, height);
    }

    zoomImage(delta: number) {
        try {
            if (delta > 0) {
                const factor = 1.1;
                const { img_x, img_y } = this._selectMetadata;
                // zoom up
                this._selectMetadata.img_w *= factor;
                this._selectMetadata.img_h *= factor;
                this._segCanvasService.scalePolygons(
                    this._selectMetadata,
                    { factor, newX: img_x, newY: img_y },
                    (isCompleted) => {
                        if (isCompleted) {
                            this._undoRedoService.appendStages({
                                meta: cloneDeep(this._selectMetadata),
                                method: 'zoom',
                            });
                            this.emitMetadata();
                        }
                    },
                );
            } else {
                // zoom down
                const factor = 0.9;
                // tslint:disable-next-line: prefer-const
                let { img_w, img_h, img_x, img_y } = this._selectMetadata;
                const widthExceedHeight = img_w * factor > 100 && img_h * factor > 100;
                if (widthExceedHeight) {
                    this._selectMetadata.img_w *= factor;
                    this._selectMetadata.img_h *= factor;
                    this._segCanvasService.scalePolygons(
                        this._selectMetadata,
                        { factor, newX: img_x, newY: img_y },
                        (isCompleted) => {
                            if (isCompleted) {
                                const clonedMeta = cloneDeep(this._selectMetadata);
                                this.emitMetadata();
                                this._undoRedoService.isMethodChange('zoom')
                                    ? this._undoRedoService.appendStages({
                                          meta: clonedMeta,
                                          method: 'zoom',
                                      })
                                    : this._undoRedoService.replaceStages({
                                          meta: clonedMeta,
                                          method: 'zoom',
                                      });
                            }
                        },
                    );
                }
            }
            this._copyPasteService.isAvailable() && this._copyPasteService.clear();
            this.redrawImage(this._selectMetadata);
        } catch (err) {
            console.log('zoomImage', err);
        }
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll({ detail, deltaY }: WheelEvent) {
        try {
            // let delta = event.deltaY ? event.deltaY / 40 : 0;
            const delta = Math.max(-1, Math.min(1, -deltaY || -detail));
            if (delta && this.segState.scroll) {
                this.zoomImage(delta);
            }
        } catch (err) {
            console.log('mouseScroll', err);
        }
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(_: MouseEvent) {
        try {
            if (this.annotateState.annotation > -1) {
                this._undoRedoService.clearRedundantStages();
                this.annotateStateMakeChange({ annotation: this.annotateState.annotation, isDlbClick: true });
            }
        } catch (err) {
            console.log('toggleEvent', err);
        }
    }

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
                const { width, height } = this.canvas.nativeElement;
                const { annotation } = this.annotateState;
                this._segCanvasService.drawNewPolygon(
                    this._selectMetadata,
                    this.image,
                    this.canvasContext,
                    width,
                    height,
                    true,
                );
                this._segCanvasService.setSelectedPolygonIndex(annotation);
                this._segCanvasService.validateXYDistance(this._selectMetadata);
            }
        }
    }

    @HostListener('window:keydown', ['$event'])
    canvasKeyDownEvent({ ctrlKey, shiftKey, key }: KeyboardEvent) {
        try {
            const { isActiveModal, draw } = this.segState;
            if (
                !isActiveModal &&
                draw &&
                // !this.isMouseWithinPoint &&
                this.canvasContext &&
                this.canvasContext.canvas.style.pointerEvents !== 'none'
            ) {
                if (this._segCanvasService.isNewPolygon()) {
                    const { width, height } = this.canvas.nativeElement;
                    const { annotation } = this.annotateState;
                    switch (key) {
                        case 'Enter':
                            this._segCanvasService.drawNewPolygon(
                                this._selectMetadata,
                                this.image,
                                this.canvasContext,
                                width,
                                height,
                                true,
                            );
                            this._segCanvasService.setSelectedPolygonIndex(annotation);
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
                                this.canvasContext,
                                this.image,
                                width,
                                height,
                            );
                            this._segCanvasService.setSelectedPolygonIndex(annotation);
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
                                (isCompleted: boolean) => {
                                    if (isCompleted) {
                                        this.annotateStateMakeChange({ annotation: -1, isDlbClick: false });
                                        // ? (this.rulesMakeChange(null, -1, null, null, null),
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
                this.canvasContext.canvas.focus();
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
                        this.annotateStateMakeChange({
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
                    this.canvas.nativeElement.focus();
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
            } else {
                key === 'ArrowLeft'
                    ? this.keyMoveBox('left')
                    : key === 'ArrowRight'
                    ? this.keyMoveBox('right')
                    : key === 'ArrowUp'
                    ? this.keyMoveBox('up')
                    : key === 'ArrowDown' && this.keyMoveBox('down');
            }
        } catch (err) {
            console.log('canvasKeyDownEvent', err);
        }
    }

    keyMoveBox(direction: Direction) {
        try {
            this.canvasContext &&
                this._segCanvasService.keyboardMovePolygon(
                    this._selectMetadata,
                    direction,
                    this.annotateState.annotation,
                    this.canvasContext,
                    this.image,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    (isCompleted) => {
                        this._undoRedoService.appendStages({
                            meta: cloneDeep(this._selectMetadata),
                            method: 'draw',
                        });
                        if (isCompleted) {
                            console.log(isCompleted);
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
                if (this.segState.drag) {
                    this._segCanvasService.setPanXY(event);
                }
                if (this.segState.draw && this.canvasContext) {
                    const tmpPoly = this._segCanvasService.mouseDownDraw(
                        event,
                        this._selectMetadata,
                        this.canvas.nativeElement,
                        this.image,
                        this.canvasContext,
                        this.ctrlKey,
                        this.altKey,
                    );
                    this.annotateStateMakeChange({ annotation: tmpPoly, isDlbClick: false });
                    this.redrawImage(this._selectMetadata);
                }
            }
        } catch (err) {
            console.log('mouseDown', err);
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        try {
            // this._selectMetadata as truefy value
            // as user can click on image but img not yet loaded onto screen
            // but mouse has already moving into canvas, thus getting error
            const isMouseClickWithinPoint =
                this._selectMetadata && this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);
            if (isMouseClickWithinPoint) {
                if (
                    this.segState.drag ||
                    (this._segCanvasService.isNewPolygon() && this.ctrlKey && this.isMouseWithinPoint)
                ) {
                    this._segCanvasService.setGlobalXY(this._selectMetadata);
                }
                if (
                    this.segState.draw &&
                    !this._segCanvasService.isNewPolygon() &&
                    this.annotateState.annotation > -1
                ) {
                    if (this._undoRedoService.isStateChange(this._selectMetadata.polygons)) {
                        this._undoRedoService.appendStages({
                            meta: cloneDeep(this._selectMetadata),
                            method: 'draw',
                        });
                    }
                }
                this._segCanvasService.setGlobalXY({ img_x: -1, img_y: -1 });
                this._segCanvasService.validateXYDistance(this._selectMetadata);
                this.emitMetadata();
            }
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
                if (this.segState.drag) {
                    const diffX = event.offsetX - this._segCanvasService.getPanX();
                    const diffy = event.offsetY - this._segCanvasService.getPanY();
                    this._selectMetadata.img_x = this._segCanvasService.getGlobalX() + diffX;
                    this._selectMetadata.img_y = this._segCanvasService.getGlobalY() + diffy;
                    this._segCanvasService.panPolygons(
                        this._selectMetadata,
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                        false,
                    );
                    this.redrawImage(this._selectMetadata);
                    this._undoRedoService.isMethodChange('pan')
                        ? this._undoRedoService.appendStages({
                              meta: this._selectMetadata,
                              method: 'pan',
                          })
                        : this._undoRedoService.replaceStages({
                              meta: this._selectMetadata,
                              method: 'pan',
                          });
                }
                if (this.segState.draw && this.canvasContext) {
                    const mouseWithinShape = this._segCanvasService.mouseMoveDraw(
                        this._selectMetadata,
                        this.image,
                        this.canvasContext,
                        this.canvas.nativeElement.width,
                        this.canvas.nativeElement.height,
                        event.offsetX,
                        event.offsetY,
                        this.ctrlKey,
                        this.isMouseWithinPoint,
                        (method) => {
                            this.redrawImage(this._selectMetadata);
                            if (method === 'pan') {
                                this._undoRedoService.isMethodChange('pan')
                                    ? this._undoRedoService.appendStages({
                                          meta: this._selectMetadata,
                                          method: 'pan',
                                      })
                                    : this._undoRedoService.replaceStages({
                                          meta: this._selectMetadata,
                                          method: 'pan',
                                      });
                            }
                        },
                    );
                    if (mouseWithinShape) {
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

    @HostListener('mouseout', ['$event'])
    mouseOut(_: MouseEvent) {
        try {
            if (this.segState.drag && this.isMouseWithinPoint) {
                this._segCanvasService.setGlobalXY(this._selectMetadata);
                this.redrawImage(this._selectMetadata);
            }
            this.isMouseWithinPoint = false;
        } catch (err) {
            console.log('mouseOut', err);
        }
    }

    currentCursor() {
        const { grab, move, pointer } = this.mouseCursor;
        return grab ? 'cursor-grab' : move ? 'cursor-move' : pointer ? 'cursor-pointer' : null;
    }
}
