import { ActionState, BboxMetadata, Boundingbox, Direction, UndoState } from '../image-labelling.model';
import { AnnotateActionState, AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { BoundingBoxCanvasService } from './bounding-box-canvas.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from '../../../shared/services/copy-paste.service';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
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
} from '@angular/core';

@Component({
    selector: 'image-labelling-object-detection',
    templateUrl: './image-labelling-object-detection.component.html',
    styleUrls: ['./image-labelling-object-detection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingObjectDetectionComponent implements OnInit, OnChanges {
    @ViewChild('canvasdrawing') mycanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    private context!: CanvasRenderingContext2D | null;
    private img: HTMLImageElement = new Image();
    private mousedown: boolean = false;
    private boundingBoxState!: ActionState;
    private annotateState!: AnnotateActionState;
    @Input() _selectMetadata!: BboxMetadata;
    @Input() _imgSrc: string = '';
    @Output() _onChangeMetadata: EventEmitter<BboxMetadata> = new EventEmitter();

    constructor(
        private _boundingBoxCanvas: BoundingBoxCanvasService,
        private _imgLblStateService: ImageLabellingActionService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit() {
        this._imgLblStateService.action$.subscribe(
            (val) => ((this.boundingBoxState = val), this.isFitCenter(), this.isClearCanvas()),
        );
        this._annotateSelectState.labelStaging$.subscribe(
            (state) => ((this.annotateState = state), this.annotateStateOnChange()),
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        try {
            console.log(changes);
            changes._imgSrc.currentValue
                ? (this.initCanvas(),
                  (this.context = this.mycanvas?.nativeElement?.getContext('2d')
                      ? this.mycanvas.nativeElement.getContext('2d')
                      : null),
                  this._undoRedoService.clearAllStages(),
                  this.loadImages(changes._imgSrc.currentValue))
                : {};
        } catch (err) {}
    }

    emitMetadata() {
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    annotateStateMakeChange(newState: AnnotateActionState | null) {
        newState !== null && this._annotateSelectState.setState(newState);
    }

    rulesMakeChange(
        scroll: boolean | null,
        fitToscreen: boolean | null,
        clearScreen: boolean | null,
        // dbClick: boolean | null,
    ) {
        try {
            const tempRules: ActionState = cloneDeep(this.boundingBoxState);
            scroll !== null ? (tempRules.scroll = scroll) : {};
            fitToscreen !== null ? (tempRules.fitCenter = fitToscreen) : {};
            clearScreen !== null ? (tempRules.clear = clearScreen) : {};
            // dbClick !== null ? (tempRules.dbClick = dbClick) : {};
            this._imgLblStateService.setState(tempRules);
        } catch (err) {}
    }

    isClearCanvas() {
        try {
            this.boundingBoxState.clear &&
                ((this._selectMetadata.bnd_box = []),
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                ),
                this.rulesMakeChange(null, null, false),
                this.emitMetadata());
        } catch (err) {}
    }

    isFitCenter() {
        try {
            this.boundingBoxState.fitCenter && this.imgFitToCenter();
        } catch (err) {}
    }

    annotateStateOnChange() {
        this.annotateState && this._boundingBoxCanvas.setCurrentSelectedbBox(this.annotateState.annotation);
    }

    imgFitToCenter() {
        try {
            const tmpObj = this._boundingBoxCanvas.calScaleTofitScreen(
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                this.mycanvas.nativeElement.offsetWidth,
                this.mycanvas.nativeElement.offsetHeight,
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
                    } else {
                        return {};
                    }
                },
            );
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
            this.emitMetadata();
            this.rulesMakeChange(null, false, null);
        } catch (err) {}
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent(event: KeyboardEvent) {
        try {
            if (!this.mousedown) {
                const { isActiveModal } = this.boundingBoxState;
                if (event.ctrlKey && (event.key === 'c' || event.key === 'C') && !isActiveModal) {
                    // copy
                    // this.boundingBoxState.selectedBox > -1
                    this.annotateState.annotation > -1 &&
                        this._copyPasteService.copy(this._selectMetadata.bnd_box[this.annotateState.annotation]);
                    // ? this._copyPasteService.copy(this._selectMetadata.bnd_box[this.boundingBoxState.selectedBox])
                } else if (event.ctrlKey && (event.key === 'v' || event.key === 'V') && !isActiveModal) {
                    // paste
                    this._copyPasteService.isAvailable() &&
                        (this._selectMetadata.bnd_box.push(this._copyPasteService.paste() as Boundingbox),
                        // this.rulesMakeChange(null, this._selectMetadata.bnd_box.length - 1, null, null, null),
                        this.annotateStateMakeChange({
                            annotation: this._selectMetadata.bnd_box.length - 1,
                            isDlbClick: false,
                        }),
                        this._boundingBoxCanvas.getBBoxDistfromImg(
                            this._selectMetadata.bnd_box,
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                        ));

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
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
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
                        this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
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
                    this._boundingBoxCanvas.deleteSingleBox(
                        this._selectMetadata.bnd_box,
                        // this.boundingBoxState.selectedBox,
                        this.annotateState.annotation,
                        (isDone: boolean) => {
                            isDone
                                ? (this.annotateStateMakeChange({ annotation: -1, isDlbClick: false }),
                                  // ? (this.rulesMakeChange(null, -1, null, null, null),
                                  this._undoRedoService.appendStages({
                                      meta: cloneDeep(this._selectMetadata),
                                      method: 'draw',
                                  }),
                                  this.emitMetadata())
                                : {};
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

    @HostListener('dblclick', ['$event'])
    toggleEvent(event: MouseEvent) {
        try {
            this.annotateState.annotation > -1 &&
                (this._undoRedoService.clearRedundantStages(),
                // this.rulesMakeChange(null, null, null, true),
                this.annotateStateMakeChange({ annotation: this.annotateState.annotation, isDlbClick: true }));
        } catch (err) {}
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent) {
        try {
            // let delta = event.deltaY ? event.deltaY / 40 : 0;
            const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.detail));
            if (delta && this.boundingBoxState.scroll) {
                this.zoomImage(delta);
            }
        } catch (err) {
            console.log('MouseScroll(event: WheelEvent)', err.name + ': ', err.message);
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
                this.rulesMakeChange(false, null, null);
                // this.boundingBoxState.scroll = false;
                if (this.boundingBoxState.drag) {
                    this._boundingBoxCanvas.setPanXY(event.offsetX, event.offsetY);
                }
                if (this.boundingBoxState.draw) {
                    const tmpBox: number = this._boundingBoxCanvas.mouseDownDrawEnable(
                        event.offsetX,
                        event.offsetY,
                        this._selectMetadata.bnd_box,
                    );
                    // this.rulesMakeChange(null, tmpBox, null, null, null);
                    this.annotateStateMakeChange({ annotation: tmpBox, isDlbClick: false });
                    this.redrawImages(
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                        this._selectMetadata.img_w,
                        this._selectMetadata.img_h,
                    );
                }
            }
        } catch (err) {
            console.log('MouseDown(event: MouseEvent)', err.name + ': ', err.message);
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
                    const retObj = this._boundingBoxCanvas.mouseUpDrawEnable(
                        this._selectMetadata,
                        (isDone: boolean) => {
                            isDone
                                ? this._undoRedoService.isStateChange(this._selectMetadata.bnd_box)
                                    ? this._undoRedoService.appendStages({
                                          meta: cloneDeep(this._selectMetadata),
                                          method: 'draw',
                                      })
                                    : {}
                                : {};
                        },
                    );
                    retObj.isNew ? this.annotateStateMakeChange({ annotation: retObj.selBox, isDlbClick: false }) : {};
                }
                this.mousedown = false;
                this.rulesMakeChange(true, null, null);
                this._boundingBoxCanvas.getBBoxDistfromImg(
                    this._selectMetadata.bnd_box,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                );
                this.emitMetadata();
            }
        } catch (err) {
            console.log('MouseUp(event: MouseEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        try {
            if (this._selectMetadata) {
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
                                } else {
                                    return {};
                                }
                            },
                        );
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                    }
                    if (this.boundingBoxState.draw && this.mousedown) {
                        this._boundingBoxCanvas.mouseMoveDrawEnable(event.offsetX, event.offsetY, this._selectMetadata);
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                    }
                } else {
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
            console.log('MouseMove(event: MouseEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            if (this.boundingBoxState.drag && this.mousedown) {
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
            }
            this.mousedown = false;
        } catch (err) {
            console.log('MouseOut(event: MouseEvent)', err.name + ': ', err.message);
        }
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
            // this.clearcanvas();
            this.img.onload = () => {
                this._selectMetadata.img_w =
                    this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
                this._selectMetadata.img_h =
                    this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.imgFitToCenter();
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
                // this.context?.drawImage(
                //     this.img,
                //     this._selectMetadata.img_x,
                //     this._selectMetadata.img_y,
                //     this._selectMetadata.img_w,
                //     this._selectMetadata.img_h,
                // );
                // this._boundingBoxCanvas.drawAllBoxOn(this._selectMetadata.bnd_box, this.context);
                // this.mycanvas.nativeElement.focus();
            };
        } catch (err) {}
    }

    keyMoveBox(direction: Direction) {
        try {
            this._boundingBoxCanvas.keyboardMoveBox(
                direction,
                // this._selectMetadata.bnd_box[this.boundingBoxState.selectedBox],
                this._selectMetadata.bnd_box[this.annotateState.annotation],
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
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

    redrawImages(newX: number, newY: number, newW: number, newH: number) {
        try {
            this.clearcanvas();
            this.context?.drawImage(this.img, newX, newY, newW, newH);
            this._boundingBoxCanvas.drawAllBoxOn(this._selectMetadata.bnd_box, this.context);
            this.mycanvas.nativeElement.focus();
        } catch (err) {}
    }

    clearcanvas() {
        try {
            this.context?.clearRect(0, 0, this.mycanvas.nativeElement.width, this.mycanvas.nativeElement.height);
        } catch (err) {}
    }

    zoomImage(del: number) {
        try {
            if (del > 0) {
                // zoom up
                this._selectMetadata.img_w *= 1.1;
                this._selectMetadata.img_h *= 1.1;
                this._boundingBoxCanvas.scaleAllBoxes(
                    1.1,
                    this._selectMetadata.bnd_box,
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
                    this._boundingBoxCanvas.scaleAllBoxes(
                        0.9,
                        this._selectMetadata.bnd_box,
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
            this._copyPasteService.isAvailable() && this._copyPasteService.clear();
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
        } catch (err) {}
    }
}
