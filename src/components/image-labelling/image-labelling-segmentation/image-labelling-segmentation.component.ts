import { ActionState, Direction, Polygons, PolyMetadata, UndoState } from '../image-labelling.model';
import { AnnotateActionState, AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from 'src/shared/services/copy-paste.service';
import { ImageLabellingStateService } from '../image-labelling-state.service';
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
    @ViewChild('canvasdrawing') mycanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    private context!: CanvasRenderingContext2D | null;
    private img: HTMLImageElement = new Image();
    private mousedown: boolean = false;
    private altdown: boolean = false;
    private isctrlHold: boolean = false;
    private segState!: ActionState;
    private annotateState!: AnnotateActionState;
    @Input() _selectMetadata!: PolyMetadata;
    @Input() _imgSrc: string = '';
    @Output() _onChangeMetadata: EventEmitter<PolyMetadata> = new EventEmitter();

    constructor(
        private _segCanvasService: SegmentationCanvasService,
        private _imgLblStateService: ImageLabellingStateService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit(): void {
        //     this._imgLblStateService.segmentation$.subscribe(
        //         (val) => ((this.segState = val), this.isFitCenter(), this.isClearCanvas()),
        //     );
    }

    ngOnChanges(changes: SimpleChanges): void {
        try {
            console.log(changes);
            changes._imgSrc.currentValue
                ? (this.initCanvas(),
                  (this.context = this.mycanvas?.nativeElement?.getContext('2d')
                      ? this.mycanvas.nativeElement.getContext('2d')
                      : null),
                  this.loadImages(changes._imgSrc.currentValue))
                : {};
        } catch (err) {}
    }

    initCanvas() {
        try {
            this.mycanvas.nativeElement.style.width = '80%';
            this.mycanvas.nativeElement.style.height = '90%';
            this.mycanvas.nativeElement.width = this.mycanvas.nativeElement.offsetWidth;
            this.mycanvas.nativeElement.height = this.mycanvas.nativeElement.offsetHeight;
        } catch (err) {}
    }

    loadImages(bit64STR: string) {
        try {
            this.img.src = bit64STR;
            this.img.onload = () => {
                this._selectMetadata.img_w =
                    this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
                this._selectMetadata.img_h =
                    this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
                this._segCanvasService.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.imgFitToCenter();
                this._undoRedoService.appendStages({
                    meta: cloneDeep(this._selectMetadata),
                    method: 'draw',
                });
            };
        } catch (err) {}
    }

    emitMetadata() {
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    annotateStateMakeChange(newState?: AnnotateActionState) {
        newState && this._annotateSelectState.mutateState(newState);
    }

    annotateStateOnChange() {
        this.annotateState && this._segCanvasService.setSelectedPolygon(cloneDeep(this.annotateState.annotation));
    }

    rulesMakeChange(scroll?: boolean, fitToscreen?: boolean, clearScreen?: boolean) {
        try {
            const tempRules: ActionState = cloneDeep(this.segState);
            scroll && (tempRules.scroll = scroll);
            fitToscreen && (tempRules.fitCenter = fitToscreen);
            clearScreen && (tempRules.clear = clearScreen);
            this._imgLblStateService.setState(tempRules);
        } catch (err) {}
    }

    imgFitToCenter() {
        try {
            const tmpObj = this._segCanvasService.calScaleTofitScreen(
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                this.mycanvas.nativeElement.offsetWidth,
                this.mycanvas.nativeElement.offsetHeight,
            );
            this._selectMetadata.img_w *= tmpObj.factor;
            this._selectMetadata.img_h *= tmpObj.factor;
            this._segCanvasService.scalePolygons(
                this._selectMetadata,
                tmpObj.factor,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
            );
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._segCanvasService.setGlobalXY(tmpObj.newX, tmpObj.newY);
            this._segCanvasService.panPolygons(
                this._selectMetadata,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                false,
            );
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
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
            this.emitMetadata();
        } catch (err) {}
    }

    isClearCanvas() {
        try {
            this.segState.clear &&
                ((this._selectMetadata.polygons = []),
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                ),
                this.rulesMakeChange(undefined, undefined, false),
                this.emitMetadata());
        } catch (err) {}
    }

    isFitCenter() {
        try {
            this.segState.fitCenter && this.imgFitToCenter();
        } catch (err) {}
    }

    redrawImages(newX: number, newY: number, newW: number, newH: number) {
        try {
            this.clearcanvas();
            if (this.context) {
                this.context?.drawImage(this.img, newX, newY, newW, newH);

                this._segCanvasService.drawAllPolygons(
                    this._selectMetadata,
                    this.context,
                    this.annotateState.annotation,
                );
                this.mycanvas.nativeElement.focus();
            }
        } catch (err) {}
    }

    clearcanvas() {
        try {
            this.context?.clearRect(0, 0, this.mycanvas.nativeElement.width, this.mycanvas.nativeElement.height);
        } catch (err) {}
    }

    keyMoveBox(direction: Direction) {
        try {
            this.context &&
                this._segCanvasService.keyboardMovePolygon(
                    this._selectMetadata,
                    direction,
                    this.annotateState.annotation,
                    this.context,
                    this.img,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    (isDone: boolean) => {
                        isDone
                            ? (this._undoRedoService.appendStages({
                                  meta: cloneDeep(this._selectMetadata),
                                  method: 'draw',
                              }),
                              this.emitMetadata())
                            : {};
                    },
                );
        } catch (err) {}
    }

    zoomImage(del: number) {
        try {
            if (del > 0) {
                // zoom up
                this._selectMetadata.img_w *= 1.1;
                this._selectMetadata.img_h *= 1.1;
                this._segCanvasService.scalePolygons(
                    this._selectMetadata,
                    1.1,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    (isDone: boolean) => {
                        isDone
                            ? (this._undoRedoService.appendStages({
                                  meta: cloneDeep(this._selectMetadata),
                                  method: 'zoom',
                              }),
                              this.emitMetadata())
                            : {};
                    },
                );
            } else {
                // zoom down
                if (this._selectMetadata.img_w * 0.9 > 100 && this._selectMetadata.img_h * 0.9 > 100) {
                    this._selectMetadata.img_w *= 0.9;
                    this._selectMetadata.img_h *= 0.9;
                    this._segCanvasService.scalePolygons(
                        this._selectMetadata,
                        0.9,
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                        (isDone: boolean) => {
                            if (isDone) {
                                const meta = cloneDeep(this._selectMetadata);
                                this.emitMetadata();
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
                        },
                    );
                }
            }
            this._copyPasteService.isAvailable() ? this._copyPasteService.clear() : {};
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
        } catch (err) {}
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent) {
        try {
            // let delta = event.deltaY ? event.deltaY / 40 : 0;
            const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.detail));
            if (delta && this.segState.scroll) {
                this.zoomImage(delta);
            }
        } catch (err) {
            console.log('MouseScroll(event: WheelEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(event: MouseEvent) {
        try {
            this.annotateState.annotation > -1
                ? (this._undoRedoService.clearRedundantStages(),
                  this.annotateStateMakeChange({ annotation: this.annotateState.annotation, isDlbClick: true }))
                : {};
        } catch (err) {}
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent(event: KeyboardEvent) {
        try {
            if (!this.mousedown) {
                const { isActiveModal } = this.segState;
                if (event.ctrlKey && (event.key === 'c' || event.key === 'C') && !isActiveModal) {
                    // copy
                    // this.boundingBoxState.selectedBox > -1
                    this.annotateState.annotation > -1
                        ? this._copyPasteService.copy(this._selectMetadata.polygons[this.annotateState.annotation])
                        : // ? this._copyPasteService.copy(this._selectMetadata.bnd_box[this.boundingBoxState.selectedBox])
                          {};
                } else if (event.ctrlKey && (event.key === 'v' || event.key === 'V') && !isActiveModal) {
                    // paste
                    this._copyPasteService.isAvailable()
                        ? (this._selectMetadata.polygons.push(this._copyPasteService.paste() as Polygons),
                          // this.rulesMakeChange(null, this._selectMetadata.bnd_box.length - 1, null, null, null),
                          this.annotateStateMakeChange({
                              annotation: this._selectMetadata.polygons.length - 1,
                              isDlbClick: false,
                          }),
                          this._segCanvasService.validateXYDistance(
                              this._selectMetadata,
                              this._selectMetadata.img_x,
                              this._selectMetadata.img_y,
                          ))
                        : {};
                    this._undoRedoService.appendStages({
                        meta: cloneDeep(this._selectMetadata),
                        method: 'draw',
                    });
                    this.emitMetadata();
                    this.mycanvas.nativeElement.focus();
                } else if (
                    event.ctrlKey &&
                    event.shiftKey &&
                    (event.key === 'z' || event.key === 'Z') &&
                    !isActiveModal
                ) {
                    // redo
                    if (this._undoRedoService.isAllowRedo()) {
                        const rtStages: UndoState = this._undoRedoService.redo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                        this.emitMetadata();
                    }
                } else if (event.ctrlKey && (event.key === 'z' || event.key === 'Z') && !isActiveModal) {
                    // undo
                    if (this._undoRedoService.isAllowUndo()) {
                        const rtStages: UndoState = this._undoRedoService.undo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                        this.emitMetadata();
                    }
                } else if (!isActiveModal && (event.key === 'Delete' || event.key === 'Backspace')) {
                    // delete single annotation
                    this._segCanvasService.deleteSinglePolygon(
                        this._selectMetadata,
                        // this.boundingBoxState.selectedBox,
                        this.annotateState.annotation,
                        (isDone: boolean) => {
                            isDone &&
                                (this.annotateStateMakeChange({ annotation: -1, isDlbClick: false }),
                                // ? (this.rulesMakeChange(null, -1, null, null, null),
                                this._undoRedoService.appendStages({
                                    meta: cloneDeep(this._selectMetadata),
                                    method: 'draw',
                                }),
                                this.emitMetadata());
                        },
                    );
                } else {
                    event.key === 'ArrowLeft' && !isActiveModal
                        ? this.keyMoveBox('left')
                        : event.key === 'ArrowRight' && !isActiveModal
                        ? this.keyMoveBox('right')
                        : event.key === 'ArrowUp' && !isActiveModal
                        ? this.keyMoveBox('up')
                        : event.key === 'ArrowDown' && !isActiveModal && this.keyMoveBox('down');
                }
            }
        } catch (err) {}
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        if (
            this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            )
        ) {
            this.mousedown = true;
            if (this.segState.drag) {
                this._segCanvasService.setPanXY(event.offsetX, event.offsetY);
            }
            if (this.segState.draw && this.context) {
                const tmpPoly: number = this._segCanvasService.whenMouseDownEvent(
                    event.offsetX,
                    event.offsetY,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this.mycanvas.nativeElement.width,
                    this.mycanvas.nativeElement.height,
                    this._selectMetadata,
                    this.img,
                    this.context,
                    this.isctrlHold,
                    this.altdown,
                );
                this.annotateStateMakeChange(cloneDeep({ annotation: tmpPoly, isDlbClick: false }));
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
            }
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        if (
            this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            )
        ) {
            this.mousedown = true;
            if (
                (this.segState.drag && this.mousedown) ||
                (this._segCanvasService.isNewPolygon() && this.isctrlHold && this.mousedown)
            ) {
                this._segCanvasService.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
            }
            if (this.segState.draw && !this._segCanvasService.isNewPolygon() && this.annotateState.annotation > -1) {
                if (this._undoRedoService.isStatgeChange(this._selectMetadata.polygons)) {
                    this._undoRedoService.appendStages({
                        meta: cloneDeep(this._selectMetadata),
                        method: 'draw',
                    });
                }
            }
            this._segCanvasService.setGlobalXY(-1, -1);
            this._segCanvasService.validateXYDistance(
                this._selectMetadata,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
            );
            this.emitMetadata();
        }
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        if (
            this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            )
        ) {
            this.mousedown = true;
            if (this.segState.drag && this.mousedown) {
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
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
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
            if (this.segState.draw && this.mousedown && this.context) {
                this._segCanvasService.whenMouseMoveEvent(
                    this._selectMetadata,
                    this.img,
                    this.context,
                    this.mycanvas.nativeElement.width,
                    this.mycanvas.nativeElement.height,
                    event.offsetX,
                    event.offsetY,
                    this.isctrlHold,
                    this.mousedown,
                    (met: string) => {
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                        if (met === 'pan') {
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
            }
        } else {
            console.log(this.crossh);
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

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        if (this.segState.drag && this.mousedown) {
            this._segCanvasService.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
        }
        this.mousedown = false;
    }
}
