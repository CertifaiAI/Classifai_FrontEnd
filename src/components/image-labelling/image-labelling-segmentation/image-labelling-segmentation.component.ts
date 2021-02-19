import { ActionState, Direction, Method, Polygons, PolyMetadata, UndoState } from '../image-labelling.model';
import { AnnotateActionState, AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { cloneDeep } from 'lodash-es';
import { CopyPasteService } from 'src/shared/services/copy-paste.service';
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
    @ViewChild('canvasdrawing') mycanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    private context!: CanvasRenderingContext2D | null;
    private image: HTMLImageElement = new Image();
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
        private _imgLblStateService: ImageLabellingActionService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit(): void {
        this._imgLblStateService.action$.subscribe(
            (val) => ((this.segState = val), this.isFitCenter(), this.isClearCanvas()),
        );
        this._annotateSelectState.labelStaging$.subscribe(
            (state) => ((this.annotateState = state), this.annotateStateOnChange()),
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._imgSrc.currentValue) {
            this.initializeCanvas();
            this.loadImages(changes._imgSrc.currentValue);
        }
    }

    initializeCanvas() {
        this.mycanvas.nativeElement.style.width = '80%';
        this.mycanvas.nativeElement.style.height = '90%';
        this.mycanvas.nativeElement.width = this.mycanvas.nativeElement.offsetWidth;
        this.mycanvas.nativeElement.height = this.mycanvas.nativeElement.offsetHeight;
        this.context = this.mycanvas.nativeElement.getContext('2d');
    }

    loadImages(base64: string) {
        this.image.src = base64;
        this.image.onload = () => {
            // tslint:disable-next-line: prefer-const
            let { img_w, img_h, img_ori_w, img_ori_h } = this._selectMetadata;
            img_w = img_w < 1 ? img_ori_w : img_w;
            img_h = img_h < 1 ? img_ori_h : img_h;

            this._segCanvasService.setGlobalXY(this._selectMetadata);
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
        this.annotateState && this._segCanvasService.setSelectedPolygon(this.annotateState.annotation);
    }

    rulesMakeChange(scroll?: boolean, fitToScreen?: boolean, clearScreen?: boolean) {
        try {
            const tempRules = cloneDeep(this.segState);
            scroll && (tempRules.scroll = scroll);
            fitToScreen && (tempRules.fitCenter = fitToScreen);
            clearScreen && (tempRules.clear = clearScreen);
            this._imgLblStateService.setState(tempRules);
        } catch (err) {
            console.log('rulesMakeChange', err);
        }
    }

    imgFitToCenter() {
        try {
            const tmpObj = this._segCanvasService.calScaleToFitScreen(
                this._selectMetadata,
                this.mycanvas.nativeElement,
            );
            // tslint:disable-next-line: prefer-const
            let { img_w, img_h, img_x, img_y } = this._selectMetadata;
            img_w *= tmpObj.factor;
            img_h *= tmpObj.factor;
            this._segCanvasService.scalePolygons(this._selectMetadata, tmpObj);
            img_x = tmpObj.newX;
            img_y = tmpObj.newY;
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
            this.redrawImages(this._selectMetadata);
            this.emitMetadata();
        } catch (err) {
            console.log('imgFitToCenter', err);
        }
    }

    isClearCanvas() {
        try {
            if (this.segState.clear) {
                this._selectMetadata.polygons = [];
                this.redrawImages(this._selectMetadata);
                this.rulesMakeChange(undefined, undefined, false);
                this.emitMetadata();
            }
        } catch (err) {
            console.log('isClearCanvas', err);
        }
    }

    isFitCenter() {
        this.segState.fitCenter && this.imgFitToCenter();
    }

    redrawImages({ img_x, img_y, img_w, img_h }: PolyMetadata) {
        try {
            this.clearcanvas();
            if (this.context) {
                this.context.drawImage(this.image, img_x, img_y, img_w, img_h);

                this._segCanvasService.drawAllPolygon(
                    this._selectMetadata,
                    this.context,
                    this.annotateState.annotation,
                );
                this.mycanvas.nativeElement.focus();
            }
        } catch (err) {
            console.log('redrawImages', err);
        }
    }

    clearcanvas() {
        const { width, height } = this.mycanvas.nativeElement;
        this.context?.clearRect(0, 0, width, height);
    }

    keyMoveBox(direction: Direction) {
        try {
            this.context &&
                this._segCanvasService.keyboardMovePolygon(
                    this._selectMetadata,
                    direction,
                    this.annotateState.annotation,
                    this.context,
                    this.image,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    (isCompleted) => {
                        if (isCompleted) {
                            this._undoRedoService.appendStages({
                                meta: cloneDeep(this._selectMetadata),
                                method: 'draw',
                            });
                            this.emitMetadata();
                        }
                    },
                );
        } catch (err) {
            console.log('keyMoveBox', err);
        }
    }

    zoomImage(delta: number) {
        try {
            if (delta > 0) {
                const factor = 1.1;
                // tslint:disable-next-line: prefer-const
                let { img_w, img_h, img_x, img_y } = this._selectMetadata;
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
                    img_w *= factor;
                    img_h *= factor;
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
            this.redrawImages(this._selectMetadata);
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

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ ctrlKey, shiftKey, key }: KeyboardEvent) {
        try {
            if (!this.mousedown) {
                const { isActiveModal } = this.segState;
                if (ctrlKey && (key === 'c' || key === 'C') && !isActiveModal) {
                    // copy
                    this.annotateState.annotation > -1 &&
                        this._copyPasteService.copy(this._selectMetadata.polygons[this.annotateState.annotation]);
                } else if (ctrlKey && (key === 'v' || key === 'V') && !isActiveModal) {
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
                    this.mycanvas.nativeElement.focus();
                } else if (ctrlKey && shiftKey && (key === 'z' || key === 'Z') && !isActiveModal) {
                    // redo
                    if (this._undoRedoService.isAllowRedo()) {
                        const rtStages: UndoState = this._undoRedoService.redo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
                        this.redrawImages(this._selectMetadata);
                        this.emitMetadata();
                    }
                } else if (ctrlKey && (key === 'z' || key === 'Z') && !isActiveModal) {
                    // undo
                    if (this._undoRedoService.isAllowUndo()) {
                        const rtStages: UndoState = this._undoRedoService.undo();
                        this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
                        this.redrawImages(this._selectMetadata);
                        this.emitMetadata();
                    }
                } else if (!isActiveModal && (key === 'Delete' || key === 'Backspace')) {
                    // delete single annotation
                    this._segCanvasService.deleteSinglePolygon(
                        this._selectMetadata,
                        // this.boundingBoxState.selectedBox,
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
                } else {
                    key === 'ArrowLeft' && !isActiveModal
                        ? this.keyMoveBox('left')
                        : key === 'ArrowRight' && !isActiveModal
                        ? this.keyMoveBox('right')
                        : key === 'ArrowUp' && !isActiveModal
                        ? this.keyMoveBox('up')
                        : key === 'ArrowDown' && !isActiveModal && this.keyMoveBox('down');
                }
            }
        } catch (err) {
            console.log('keyStrokeEvent', err);
        }
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        try {
            const isMouseClickWithinPoint = this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata,
                event,
            );

            if (isMouseClickWithinPoint) {
                this.mousedown = true;
                if (this.segState.drag) {
                    this._segCanvasService.setPanXY(event);
                }
                if (this.segState.draw && this.context) {
                    const tmpPoly = this._segCanvasService.whenMouseDownEvent(
                        event,
                        this._selectMetadata,
                        this.mycanvas.nativeElement,
                        this.image,
                        this.context,
                        this.isctrlHold,
                        this.altdown,
                    );
                    this.annotateStateMakeChange(cloneDeep({ annotation: tmpPoly, isDlbClick: false }));
                    this.redrawImages(this._selectMetadata);
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
                this.mousedown = true;
                if (
                    (this.segState.drag && this.mousedown) ||
                    (this._segCanvasService.isNewPolygon() && this.isctrlHold && this.mousedown)
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
            const isMouseClickWithinPoint =
                this._selectMetadata && this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);
            if (isMouseClickWithinPoint) {
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
                    this.redrawImages(this._selectMetadata);
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
                        this.image,
                        this.context,
                        this.mycanvas.nativeElement.width,
                        this.mycanvas.nativeElement.height,
                        event.offsetX,
                        event.offsetY,
                        this.isctrlHold,
                        this.mousedown,
                        (method) => {
                            this.redrawImages(this._selectMetadata);
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
                }
            } else {
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
            if (this.segState.drag && this.mousedown) {
                this._segCanvasService.setGlobalXY(this._selectMetadata);
                this.redrawImages(this._selectMetadata);
            }
            this.mousedown = false;
        } catch (err) {
            console.log('mouseOut', err);
        }
    }
}
