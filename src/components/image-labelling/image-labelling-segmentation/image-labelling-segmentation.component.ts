/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

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
import { cloneDeep } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    ActionState,
    ChangeAnnotationLabel,
    CompleteMetadata,
    Direction,
    LabelInfo,
    Polygons,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
    UndoState,
} from 'shared/types/image-labelling/image-labelling.model';
import { AnnotateActionState, AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { CopyPasteService } from 'shared/services/copy-paste.service';
import { MouseCursorState, MousrCursorService } from 'shared/services/mouse-cursor.service';
import { ShortcutKeyService } from 'shared/services/shortcut-key.service';
import { UndoRedoService } from 'shared/services/undo-redo.service';
import { ZoomState, ZoomService, WheelDelta } from 'shared/services/zoom.service';
import { SharedUndoRedoService } from 'shared/services/shared-undo-redo.service';
import { SegmentationCanvasService } from './segmentation-canvas.service';
import { ImageLabellingActionService } from '../image-labelling-action.service';
import { LabelColorServices } from '../../../shared/services/label-color.services';
import { HTMLElementEvent } from '../../../shared/types/field/field.model';

interface ExtendedMouseEvent extends MouseEvent {
    layerX: number;
    layerY: number;
}

@Component({
    selector: 'image-labelling-segmentation',
    templateUrl: './image-labelling-segmentation.component.html',
    styleUrls: ['./image-labelling-segmentation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingSegmentationComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('floatdiv') floatdiv!: ElementRef<HTMLDivElement>;
    @ViewChild('lbltypetxt') lbltypetxt!: ElementRef<HTMLInputElement>;
    @ViewChild('availablelbl') availablelbl!: ElementRef<HTMLDivElement>;
    private canvasContext!: CanvasRenderingContext2D;
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
    showDropdownLabelBox: boolean = false;
    labelSearch: string = '';
    labelList: LabelInfo[] = [];
    allLabelList: LabelInfo[] = [];
    mouseEvent: MouseEvent | undefined;
    labelColorList!: Map<string, string>;
    invalidInput: boolean = false;
    intervalId!: NodeJS.Timeout;
    @Input() _selectMetadata!: PolyMetadata;
    @Input() _imgSrc: string = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Input() _projectName!: string;
    @Input() _refreshAllLabelColor!: boolean;
    @Output() _onChangeMetadata: EventEmitter<PolyMetadata> = new EventEmitter();
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _clickAbilityToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() _onCompleteRefresh: EventEmitter<boolean> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();
    @ViewChild('crossH') crossH!: ElementRef<HTMLDivElement>;
    @ViewChild('crossV') crossV!: ElementRef<HTMLDivElement>;

    constructor(
        private _segCanvasService: SegmentationCanvasService,
        private _imgLblStateService: ImageLabellingActionService,
        private _undoRedoService: UndoRedoService,
        private _copyPasteService: CopyPasteService,
        private _annotateSelectState: AnnotateSelectionService,
        private _zoomService: ZoomService,
        private _mouseCursorService: MousrCursorService,
        private _shortcutKeyService: ShortcutKeyService,
        private _sharedUndoRedoService: SharedUndoRedoService,
        private _labelColorListService: LabelColorServices,
    ) {}

    ngOnInit(): void {
        this.getLabelList();
        this._imgLblStateService.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ clear, fitCenter, ...action }) => {
                this.segState = { ...action, clear, fitCenter };
                fitCenter && this.imgFitToCenter();
                if (clear) {
                    this._selectMetadata.polygons = [];
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

            /**
             * allow click annotate to highlight respective BB
             * @property _selectMetadata trufy check due to freshly loaded project will have no selected drawn item state
             *           but after that it will always has it's state being filled
             */
            if (this._selectMetadata) {
                this._segCanvasService.setSelectedPolygon(state.annotation, this._selectMetadata);
                this.redrawImage(this._selectMetadata);
            }
        });

        this._zoomService.zoom$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => (this.zoom = state));

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));

        this._sharedUndoRedoService.action.subscribe((message) => {
            switch (message) {
                case 'SEG_UNDO':
                    this.undoAction();
                    break;
                case 'SEG_REDO':
                    this.redoAction();
                    break;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._selectMetadata?.previousValue && changes._selectMetadata?.currentValue) {
            this.redrawImage(this._selectMetadata);
        }
        if (changes._imgSrc?.currentValue) {
            this.initializeCanvas();
            this._undoRedoService.clearAllStages();
            this._segCanvasService.setSelectedPolygon(-1);
            this.loadImage(changes._imgSrc.currentValue);
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
                    this.initializeCanvas();
                    this.imgFitToCenter();
                } else {
                    this.redrawImage(this._selectMetadata);
                }
            }
        }

        if (changes._refreshAllLabelColor) {
            if (this._refreshAllLabelColor) {
                setTimeout(() => this.updateLabelColor());
            }
        }
    }

    initializeCanvas() {
        this.canvas.nativeElement.style.width = '80%';
        this.canvas.nativeElement.style.height = '90%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    loadImage(base64: string) {
        this.image.src = base64;
        this.image.onload = () => {
            const { img_x, img_y } = this._selectMetadata;
            this._selectMetadata.img_w =
                this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
            this._selectMetadata.img_h =
                this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
            this._segCanvasService.setGlobalXY({
                offsetX: img_x,
                offsetY: img_y,
            });
            this.imgFitToCenter();
            this.emitMetadata();
            this.changeMouseCursorState();
            // this._undoRedoService.appendStages({ meta: cloneDeep(this._selectMetadata), method: 'draw' });
        };
    }

    emitMetadata() {
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    annotateStateChange(newState?: Partial<AnnotateActionState>) {
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
            this._segCanvasService.setGlobalXY({ offsetX: tmpObj.newX, offsetY: tmpObj.newY });
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
            this.resetZoom();
            this.canvasContext.canvas.style.transformOrigin = `0 0`;
            this.canvasContext.canvas.style.transform = `scale(1, 1)`;
        } catch (err) {
            console.log('imgFitToCenter', err);
        }
    }

    redrawImage({ img_x, img_y, img_w, img_h }: PolyMetadata) {
        this.clearcanvas();
        this.canvasContext.drawImage(this.image, img_x, img_y, img_w, img_h);
        if (this._tabStatus[2].annotation?.length !== 0) {
            this.getLabelList();
            const annotationList = this._tabStatus[2].annotation ? this._tabStatus[2].annotation[0].polygons ?? [] : [];
            this.sortingLabelList(this.labelList, annotationList);
        }
        this.labelColorList = this._labelColorListService.getLabelColorList(this._projectName);
        this._segCanvasService.drawAllPolygon(
            this._selectMetadata,
            this.canvasContext,
            this.annotateState.annotation,
            this.labelColorList,
        );
    }

    /**
     * @function responsible for cleaning up the canvas
     */
    clearcanvas() {
        const { width, height } = this.canvas.nativeElement;
        this.canvasContext.clearRect(0, 0, width, height);
    }

    @HostListener('wheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent & WheelDelta) {
        try {
            this.isMouseWithinPoint = this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);

            if (this.isMouseWithinPoint) {
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
            console.log('mouseScroll', err);
        }
    }

    validateEndDrawPolygon(
        { isActiveModal, draw }: ActionState,
        isMouseWithinPoint: boolean,
        canvasContext: CanvasRenderingContext2D,
    ) {
        return !isActiveModal && draw && isMouseWithinPoint && canvasContext.canvas.style.pointerEvents !== 'none';
    }

    @HostListener('dblclick', ['$event'])
    canvasDblClickEvent(event: ExtendedMouseEvent) {
        if (this.validateEndDrawPolygon(this.segState, this.isMouseWithinPoint, this.canvasContext)) {
            if (this._segCanvasService.isNewPolygon()) {
                this.completingPolygon();
            }
            if (this.segState.draw) {
                const mouseWithinShape = this.mouseMoveDrawCanvas(event);
                if (mouseWithinShape) {
                    this.annotateStateChange({ annotation: this.annotateState.annotation, isDlbClick: true });
                }
            }
        }
    }

    @HostListener('window:keydown', ['$event'])
    canvasKeyDownEvent({ ctrlKey, metaKey, shiftKey, key }: KeyboardEvent) {
        try {
            if (this.validateEndDrawPolygon(this.segState, this.isMouseWithinPoint, this.canvasContext)) {
                if (this._segCanvasService.isNewPolygon()) {
                    switch (key) {
                        case 'Enter':
                            this.completingPolygon();
                            break;
                        case 'Escape':
                            this.resetDrawingPolygon();
                            break;
                        case 'Backspace':
                            this.removeLastPointPolygon();
                            break;
                    }
                } else {
                    switch (key) {
                        case 'Delete':
                        case 'Backspace':
                            this.deletePolygon();
                            break;
                    }
                }
                this.movePolygon(key);
            }

            if (ctrlKey) {
                this._imgLblStateService.setState({ draw: false, drag: true, scroll: true });
                this.intervalId = setInterval(() => {
                    this._segCanvasService.panPolygons(this._selectMetadata, true, () => {
                        /** This is intentional */
                    });
                    this._segCanvasService.drawNewPolygon(
                        this._selectMetadata,
                        this.image,
                        this.canvasContext,
                        this.canvas.nativeElement,
                        false,
                    );
                }, 100);
            }

            if (key === 'x' || key === 'X') {
                clearInterval(this.intervalId);
                this._segCanvasService.setGlobalXY(this.mouseEvent as ExtendedMouseEvent);
                this._imgLblStateService.setState({ draw: true, drag: false, scroll: false });
            }

            if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'copy')) {
                this.copyPolygon();
            } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'paste')) {
                this.pastePolygon();
            } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'redo')) {
                if (!this._segCanvasService.isNewPolygon()) {
                    this.redoAction();
                }
            } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'undo')) {
                if (!this._segCanvasService.isNewPolygon()) {
                    this.undoAction();
                }
            }
        } catch (err) {
            console.log('canvasKeyDownEvent', err);
        }
    }

    completingPolygon() {
        this._segCanvasService.drawNewPolygon(
            this._selectMetadata,
            this.image,
            this.canvasContext,
            this.canvas.nativeElement,
            true,
        );
        this.positioningLabelListPopup(this._selectMetadata.polygons);
        this.annotateStateChange({ annotation: this._selectMetadata.polygons.length - 1 });
        this._segCanvasService.validateXYDistance(this._selectMetadata);
        this._undoRedoService.appendStages({
            meta: cloneDeep(this._selectMetadata),
            method: 'draw',
        });
        this.redrawImage(this._selectMetadata);
        this.emitMetadata();
    }

    resetDrawingPolygon() {
        this._segCanvasService.resetDrawing(
            this._selectMetadata,
            this.image,
            this.canvasContext,
            this.canvas.nativeElement,
        );
    }

    removeLastPointPolygon() {
        this._segCanvasService.removeLastPoint(
            this._selectMetadata,
            this.canvasContext,
            this.image,
            this.canvas.nativeElement,
        );
        this.redrawImage(this._selectMetadata);
        this.mouseMoveDrawCanvas(this.mouseEvent as ExtendedMouseEvent);
    }

    deletePolygon() {
        this._segCanvasService.deleteSinglePolygon(this._selectMetadata, this.annotateState.annotation, (isDone) => {
            if (isDone) {
                this.annotateStateChange();
                this.redrawImage(this._selectMetadata);
                this._undoRedoService.appendStages({
                    meta: cloneDeep(this._selectMetadata),
                    method: 'draw',
                });
                this.emitMetadata();
            }
        });
    }

    movePolygon(key: string) {
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

    copyPolygon() {
        this.annotateState.annotation > -1 &&
            this._copyPasteService.copy(this._selectMetadata.polygons[this.annotateState.annotation]);
    }

    pastePolygon() {
        if (this._copyPasteService.isAvailable()) {
            this._selectMetadata.polygons.push(this._copyPasteService.paste() as Polygons);
            this.annotateStateChange({
                annotation: this._selectMetadata.polygons.length - 1,
            });
            this._segCanvasService.validateXYDistance(this._selectMetadata);
        }

        this._undoRedoService.appendStages({
            meta: cloneDeep(this._selectMetadata),
            method: 'draw',
        });
        this.emitMetadata();
    }

    redoAction() {
        if (this._undoRedoService.isAllowRedo()) {
            const rtStages: UndoState = this._undoRedoService.redo();
            this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
            this.redrawImage(this._selectMetadata);
            this.emitMetadata();
        }
    }

    undoAction() {
        if (this._undoRedoService.isAllowUndo()) {
            const rtStages: UndoState = this._undoRedoService.undo();
            this._selectMetadata = cloneDeep(rtStages?.meta as PolyMetadata);
            this.redrawImage(this._selectMetadata);
            this.emitMetadata();
        }
    }

    keyMoveBox(direction: Direction) {
        try {
            const polygon = this._selectMetadata.polygons[this.annotateState.annotation];
            polygon &&
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
    mouseDown(event: ExtendedMouseEvent) {
        try {
            this.isMouseWithinPoint = this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);

            if (this.isMouseWithinPoint) {
                this.mousedown = true;
                if (this.segState.drag) {
                    this.changeMouseCursorState({ grabbing: true });
                    // this._segCanvasService.setGlobalXY(event);
                    this._segCanvasService.setPanXY(event);
                    /**
                     * @function initializeCanvas needed due to a mysterious bug where the black area keeps changing
                     *            and leading to more black area covering canvas image
                     *            therefore, reassign value to canvas's width & height
                     * @function redrawImage update & remove not needed items on canvas
                     */
                    this.initializeCanvas();
                    this.redrawImage(this._selectMetadata);
                }
                if (this.segState.draw) {
                    this.getLabelList();
                    const annotationList = this._tabStatus[2].annotation
                        ? this._tabStatus[2].annotation[0].polygons ?? []
                        : [];
                    this.sortingLabelList(this.labelList, annotationList);
                    this.showDropdownLabelBox = false;
                    // needed when mouse down then mouse move to get correct coordinate
                    const polyIndex = this._segCanvasService.mouseDownDraw(
                        event,
                        this._selectMetadata,
                        this.canvas.nativeElement,
                        this.image,
                        this.canvasContext,
                        this.ctrlKey,
                        this.altKey,
                        this.labelList,
                    );

                    if (polyIndex > -1) {
                        this._segCanvasService.setGlobalXY(event);
                    } else {
                        const { img_x, img_y } = this._selectMetadata;
                        this._segCanvasService.setGlobalXY({ offsetX: img_x, offsetY: img_y });
                    }

                    this.annotateStateChange({ annotation: polyIndex });
                    this.redrawImage(this._selectMetadata);
                    // continuously show the seg line, prevents mouse down draw but line disappear
                    this.mouseMoveDrawCanvas(event);
                }
                // mousedown resize
                else if (this.segState.draw && !this.mousedown) {
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
            if (this._selectMetadata && this.isMouseWithinPoint) {
                if (this.mousedown) {
                    const { img_x, img_y } = this._selectMetadata;
                    if (this.segState.drag) {
                        // needed to prevent mouse drag move image to glitch due to wrong global axis
                        // needing global axis follows image's axis
                        this._segCanvasService.setGlobalXY({ offsetX: img_x, offsetY: img_y });
                    }
                    if (this.segState.draw && !isNewPolygon && this.annotateState.annotation > -1) {
                        if (this._undoRedoService.isStateChange(this._selectMetadata.polygons)) {
                            this._undoRedoService.appendStages({
                                meta: cloneDeep(this._selectMetadata),
                                method: 'draw',
                            });
                            // needed to prevent mouse drag move image to glitch due to wrong global axis
                            // needing global axis follows image's axis
                            this._segCanvasService.setGlobalXY({ offsetX: img_x, offsetY: img_y });
                            this._segCanvasService.validateXYDistance(this._selectMetadata);
                            this.redrawImage(this._selectMetadata);
                            this.emitMetadata();
                        }
                    }
                } else {
                    const { pointIndex, polygonIndex } = this._segCanvasService.getClickPoint();
                    if (this.segState.draw && polygonIndex > -1 && pointIndex > -1) {
                        if (this._undoRedoService.isStateChange(this._selectMetadata.polygons)) {
                            this._undoRedoService.appendStages({
                                meta: cloneDeep(this._selectMetadata),
                                method: 'draw',
                            });
                            // this._segCanvasService.setGlobalXY({ img_x: -1, img_y: -1 });
                            this._segCanvasService.resetClickPoint();
                            this._segCanvasService.validateXYDistance(this._selectMetadata);
                            this.redrawImage(this._selectMetadata);
                            this.emitMetadata();
                        }
                    } // mouse move polygon then mouse up logic
                    else if (this.segState.draw) {
                        // this._segCanvasService.setGlobalXY({ offsetX: -1, offsetY: -1 });
                        this._segCanvasService.validateXYDistance(this._selectMetadata);
                        this.redrawImage(this._selectMetadata);
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
    mouseMove(event: ExtendedMouseEvent) {
        try {
            // this._selectMetadata as truefy value
            // as user can click on image but img not yet loaded onto screen
            // but mouse has already moving into canvas, thus getting error
            this.isMouseWithinPoint =
                this._selectMetadata && this._segCanvasService.mouseClickWithinPointPath(this._selectMetadata, event);
            if (
                this.isMouseWithinPoint &&
                !this.showDropdownLabelBox &&
                this.segState.draw &&
                this.segState.crossLine
            ) {
                this.crossH.nativeElement.style.visibility = 'visible';
                this.crossV.nativeElement.style.visibility = 'visible';
                this.crossH.nativeElement.style.top = event.pageY.toString() + 'px';
                this.crossV.nativeElement.style.left = event.pageX.toString() + 'px';
            } else {
                this.crossH.nativeElement.style.visibility = 'hidden';
                this.crossV.nativeElement.style.visibility = 'hidden';
            }
            if (this.isMouseWithinPoint) {
                if (this.segState.drag && this.mousedown) {
                    const { diffX, diffY } = this._segCanvasService.getDiffXY(event);
                    this._selectMetadata.img_x = diffX;
                    this._selectMetadata.img_y = diffY;
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
                    // !! must not have below setGlobalXY due to causing wrong axis
                    // this._segCanvasService.setGlobalXY(event);
                }
                if (this.segState.draw) {
                    // this._segCanvasService.setPanXY(event);
                    this.mouseEvent = event;
                    const mouseWithinShape = this.mouseMoveDrawCanvas(event);
                    if (mouseWithinShape) {
                        this.crossH.nativeElement.style.visibility = 'hidden';
                        this.crossV.nativeElement.style.visibility = 'hidden';
                        this.changeMouseCursorState({ move: true });
                    } else {
                        this.changeMouseCursorState({ crosshair: true });
                    }
                }
            } else {
                this.changeMouseCursorState();
                this.mousedown = false;
            }
        } catch (err) {
            console.log('mouseMove', err);
        }
    }

    mouseMoveDrawCanvas(event: ExtendedMouseEvent) {
        const mouseWithinShape = this._segCanvasService.mouseMoveDraw(
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
            },
        );
        return mouseWithinShape;
    }

    changeMouseCursorState(mouseCursor?: Partial<MouseCursorState>) {
        this._mouseCursorService.setState(mouseCursor);
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            this.crossH.nativeElement.style.visibility = 'hidden';
            this.crossV.nativeElement.style.visibility = 'hidden';
            if (this.segState.drag && this.isMouseWithinPoint && this.mousedown) {
                this._segCanvasService.setGlobalXY(event);
                this.redrawImage(this._selectMetadata);
            }
            if (
                ((event.target as Element).className === 'canvasstyle' ||
                    (event.target as Element).className.includes('unclosedOut')) &&
                !(event.relatedTarget as Element)?.className.includes('unclosedOut') &&
                !(event.relatedTarget as Element)?.className.includes('canvasstyle')
            ) {
                this.showDropdownLabelBox = false;
                if (this._selectMetadata.polygons.filter((poly) => !poly.label).length !== 0) {
                    this._selectMetadata.polygons = this._selectMetadata.polygons.filter((poly) => poly.label !== '');
                    this._onChangeMetadata.emit(this._selectMetadata);
                    this.redrawImage(this._selectMetadata);
                    alert('Some bounding boxes will be deleted because they were not labelled.');
                }
            }
            this.isMouseWithinPoint = false;
        } catch (err) {
            console.log('mouseOut', err);
        }
    }

    currentCursor() {
        return this._mouseCursorService.changeCursor(this.mouseCursor);
    }

    positioningLabelListPopup(polygons: Polygons[]) {
        const offsetX =
            polygons[this._selectMetadata.polygons.length - 1].coorPt[
                this._selectMetadata.polygons[this._selectMetadata.polygons.length - 1].coorPt.length - 1
            ].x;
        const offsetY =
            polygons[this._selectMetadata.polygons.length - 1].coorPt[
                this._selectMetadata.polygons[this._selectMetadata.polygons.length - 1].coorPt.length - 1
            ].y;
        // Positioning the floating div at the bottom right corner of bounding box
        let posFromTop = offsetY * (100 / document.documentElement.clientHeight) + 8.5;
        let posFromLeft = offsetX * (100 / document.documentElement.clientWidth) + 2.5;
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
        // this.invalidInput = false;
        setTimeout(() => {
            this.lbltypetxt.nativeElement.focus();
        }, 100);
    }

    getLabelList() {
        this.labelList = [];
        this.allLabelList = [];
        (this._tabStatus[1].label_list ?? []).forEach((name: string) => {
            const labels = {
                name,
                count: 0,
            };
            this.labelList.push(labels);
            this.allLabelList.push(labels);
        });
    }

    sortingLabelList(labelList: LabelInfo[], annotationList: Polygons[]) {
        labelList.forEach(({ name }, index) => {
            this.labelList[index].count = annotationList.filter(({ label }) => label === name).length;
            this.allLabelList[index].count = annotationList.filter(({ label }) => label === name).length;
        });
        this.labelList.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0));
        this.allLabelList.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0));
    }

    labelNameClicked(label: string) {
        this.showDropdownLabelBox = false;
        this._onChangeAnnotationLabel.emit({ label, index: this.annotateState.annotation });
        this._selectMetadata.polygons[this.annotateState.annotation].label = label;
        this._undoRedoService.isStateChange(this._selectMetadata.polygons) &&
            this._undoRedoService.appendStages({
                meta: this._selectMetadata,
                method: 'draw',
            });
        this._selectMetadata.polygons = this._selectMetadata.polygons.map((poly) => ({
            ...poly,
            color: this.labelColorList.get(poly.label) as string,
        }));
        this.emitMetadata();
    }

    labelTypeTextChange(event: string) {
        this.labelList = this.allLabelList.filter((label) => label.name.includes(event));
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
                this._selectMetadata.polygons[this.annotateState.annotation].label = value;
                this._undoRedoService.isStateChange(this._selectMetadata.polygons) &&
                    this._undoRedoService.appendStages({
                        meta: this._selectMetadata,
                        method: 'draw',
                    });
                const label_lists = this._tabStatus
                    .map(({ label_list }) => (label_list ? label_list : []))
                    .filter((tab) => tab.length > 0)[0];
                this._onEnterLabel.emit({ action: 1, label_list: label_lists ? [...label_lists, value] : [value] });
                this.labelSearch = '';
            } else {
                this.invalidInput = true;
                console.error(`Invalid existing label input`);
            }
        }
    };

    cancelClickAbilityToggleStatus() {
        this._clickAbilityToggle.emit(false);
    }

    updateLabelColor() {
        const labelsId: number[] = [];
        for (const [_, { id }] of this._selectMetadata.polygons.entries()) {
            labelsId.push(id);
        }
        this._selectMetadata.polygons = this._selectMetadata.polygons.map((poly) => ({
            ...poly,
            color: this.labelColorList.get(poly.label) as string,
            region: String(labelsId.indexOf(poly.id) + 1),
        }));
        this.redrawImage(this._selectMetadata);
        this.emitMetadata();
        this._onCompleteRefresh.emit();
    }

    ngOnDestroy(): void {
        this._annotateSelectState.setState();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
