import { BoundingBoxActionState, UndoState, labelState } from './../image-labelling-layout.model';
import { BoundingBoxCanvasService } from '../../../shared/services/bounding-box-canvas.service';
import { BoundingBoxStateService } from '../../../shared/services/bounding-box-state.service';
import { CopyPasteService } from '../../../shared/services/copy-paste.service';
import { AnnotateSelectionService } from '../../../shared/services/annotate-selection.service';
import { Metadata, BoundingBox } from '../../../shared/type-casting/meta-data/meta-data';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
import { cloneDeep } from 'lodash-es';
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
    private boundingBoxState!: BoundingBoxActionState;
    private annotateState!: labelState;
    @Input() _selectMetadata!: Metadata;
    @Input() _imgSrc: string = '';

    constructor(
        private _boundingBoxCanvas: BoundingBoxCanvasService,
        private _bbState: BoundingBoxStateService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit() {
        this._bbState.boundingBox$.subscribe(
            (val) => (
                (this.boundingBoxState = val),
                // this._boundingBoxCanvas.setCurrentSelectedbBox(this.boundingBoxState.selectedBox),
                this.isFitCenter(),
                this.isClearCanvas()
            ),
        );
        this._annotateSelectState.labelStaging$.subscribe(
            (state) => ((this.annotateState = state), this.annotateStateOnChange()),
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        try {
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

    annotateStateMakeChange(newState: labelState | null) {
        newState ? this._annotateSelectState.mutateState(newState) : {};
    }

    rulesMakeChange(
        scroll: boolean | null,
        fitToscreen: boolean | null,
        clearScreen: boolean | null,
        dbClick: boolean | null,
    ) {
        try {
            const tempRules: BoundingBoxActionState = cloneDeep(this.boundingBoxState);
            scroll !== null ? (tempRules.scroll = scroll) : {};
            fitToscreen !== null ? (tempRules.fitCenter = fitToscreen) : {};
            clearScreen !== null ? (tempRules.clear = clearScreen) : {};
            dbClick !== null ? (tempRules.dbClick = dbClick) : {};
            this._bbState.setState(tempRules);
        } catch (err) {}
    }

    isClearCanvas() {
        try {
            this.boundingBoxState.clear
                ? ((this._selectMetadata.bnd_box = []),
                  this.redrawImages(
                      this._selectMetadata.img_x,
                      this._selectMetadata.img_y,
                      this._selectMetadata.img_w,
                      this._selectMetadata.img_h,
                  ),
                  this.rulesMakeChange(null, null, false, null))
                : {};
        } catch (err) {}
    }

    isFitCenter() {
        try {
            this.boundingBoxState.fitCenter ? this.imgFitToCenter() : {};
        } catch (err) {}
    }

    annotateStateOnChange() {
        this.annotateState
            ? this._boundingBoxCanvas.setCurrentSelectedbBox(cloneDeep(this.annotateState.selectedAnnotate))
            : {};
        // this.annotateState
        //     ? (this._boundingBoxCanvas.setCurrentSelectedbBox(cloneDeep(this.annotateState.selectedAnnotate)),
        //       this.annotateState.label && this.annotateState.selectedAnnotate > -1
        //           ? this._boundingBoxCanvas.changeLabel(
        //                 this._selectMetadata.bnd_box[this.annotateState.selectedAnnotate],
        //                 cloneDeep(this.annotateState.label!),
        //             )
        //           : {})
        //     : {};
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
                    isDone
                        ? this._undoRedoService.isMethodChange('zoom')
                            ? this._undoRedoService.appendStages({
                                  meta: cloneDeep(this._selectMetadata),
                                  method: 'zoom',
                              })
                            : this._undoRedoService.replaceStages({
                                  meta: cloneDeep(this._selectMetadata),
                                  method: 'zoom',
                              })
                        : {};
                },
            );
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
            this.rulesMakeChange(null, false, null, null);
        } catch (err) {}
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent(event: KeyboardEvent) {
        try {
            if (!this.mousedown) {
                if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
                    // copy
                    // this.boundingBoxState.selectedBox > -1
                    this.annotateState.selectedAnnotate > -1
                        ? this._copyPasteService.copy(this._selectMetadata.bnd_box[this.annotateState.selectedAnnotate])
                        : // ? this._copyPasteService.copy(this._selectMetadata.bnd_box[this.boundingBoxState.selectedBox])
                          {};
                } else if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
                    // paste
                    this._copyPasteService.isAvailable()
                        ? (this._selectMetadata.bnd_box.push(this._copyPasteService.paste() as BoundingBox),
                          // this.rulesMakeChange(null, this._selectMetadata.bnd_box.length - 1, null, null, null),
                          this.annotateStateMakeChange({
                              selectedAnnotate: this._selectMetadata.bnd_box.length - 1,
                          }),
                          this._boundingBoxCanvas.getBBoxDistfromImg(
                              this._selectMetadata.bnd_box,
                              this._selectMetadata.img_x,
                              this._selectMetadata.img_y,
                          ))
                        : {};
                    this._undoRedoService.appendStages({
                        meta: cloneDeep(this._selectMetadata),
                        method: 'draw',
                    });
                    this.mycanvas.nativeElement.focus();
                } else if (event.ctrlKey && event.shiftKey && (event.key === 'z' || event.key === 'Z')) {
                    // redo
                    if (this._undoRedoService.isAllowRedo()) {
                        const rtStages: UndoState = this._undoRedoService.redo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as Metadata);
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                    }
                } else if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
                    // undo
                    console.log('child undo');
                    if (this._undoRedoService.isAllowUndo()) {
                        const rtStages: UndoState = this._undoRedoService.undo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as Metadata);
                        this.redrawImages(
                            this._selectMetadata.img_x,
                            this._selectMetadata.img_y,
                            this._selectMetadata.img_w,
                            this._selectMetadata.img_h,
                        );
                    }
                } else if (event.key === 'Delete' || event.key === 'Backspace') {
                    // delete single annotation
                    this._boundingBoxCanvas.deleteSingleBox(
                        this._selectMetadata.bnd_box,
                        // this.boundingBoxState.selectedBox,
                        this.annotateState.selectedAnnotate,
                        (isDone: boolean) => {
                            isDone
                                ? (this.annotateStateMakeChange({ selectedAnnotate: -1 }),
                                  /** ? (this.rulesMakeChange(null, -1, null, null, null),*/
                                  this._undoRedoService.appendStages({
                                      meta: cloneDeep(this._selectMetadata),
                                      method: 'draw',
                                  }))
                                : {};
                        },
                    );
                } else {
                    event.key === 'ArrowLeft'
                        ? this.keyMoveBox('left')
                        : event.key === 'ArrowRight'
                        ? this.keyMoveBox('right')
                        : event.key === 'ArrowUp'
                        ? this.keyMoveBox('up')
                        : event.key === 'ArrowDown'
                        ? this.keyMoveBox('down')
                        : {};
                }
            }
        } catch (err) {}
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(event: MouseEvent) {
        try {
            this.annotateState.selectedAnnotate > -1
                ? (this._undoRedoService.clearRedundantStages(), this.rulesMakeChange(null, null, null, true))
                : {};
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
                this.rulesMakeChange(false, null, null, null);
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
                    this.annotateStateMakeChange({ selectedAnnotate: tmpBox });
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
                    this._boundingBoxCanvas.mouseUpDrawEnable(this._selectMetadata, (isDone: boolean) => {
                        isDone
                            ? this._undoRedoService.isStatgeChange(this._selectMetadata.bnd_box)
                                ? this._undoRedoService.appendStages({
                                      meta: cloneDeep(this._selectMetadata),
                                      method: 'draw',
                                  })
                                : {}
                            : {};
                    });
                }
                this.mousedown = false;
                this.rulesMakeChange(true, null, null, null);
                this._boundingBoxCanvas.getBBoxDistfromImg(
                    this._selectMetadata.bnd_box,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                );
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
                                isDone
                                    ? this._undoRedoService.isMethodChange('pan')
                                        ? this._undoRedoService.appendStages({
                                              meta: cloneDeep(this._selectMetadata),
                                              method: 'pan',
                                          })
                                        : this._undoRedoService.replaceStages({
                                              meta: cloneDeep(this._selectMetadata),
                                              method: 'pan',
                                          })
                                    : {};
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
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
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

    keyMoveBox(direction: string) {
        try {
            this._boundingBoxCanvas.keyboardMoveBox(
                direction,
                // this._selectMetadata.bnd_box[this.boundingBoxState.selectedBox],
                this._selectMetadata.bnd_box[this.annotateState.selectedAnnotate],
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                (isDone: boolean) => {
                    isDone
                        ? this._undoRedoService.appendStages({
                              meta: cloneDeep(this._selectMetadata),
                              method: 'draw',
                          })
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
                            ? this._undoRedoService.appendStages({
                                  meta: cloneDeep(this._selectMetadata),
                                  method: 'zoom',
                              })
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
                            isDone
                                ? this._undoRedoService.isMethodChange('zoom')
                                    ? this._undoRedoService.appendStages({
                                          meta: cloneDeep(this._selectMetadata),
                                          method: 'zoom',
                                      })
                                    : this._undoRedoService.replaceStages({
                                          meta: cloneDeep(this._selectMetadata),
                                          method: 'zoom',
                                      })
                                : {};
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
}
