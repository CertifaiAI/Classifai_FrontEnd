import {
    AfterViewInit,
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
import { cloneDeep } from 'lodash-es';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnnotateActionState, AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { MouseCursorState, MousrCursorService } from 'shared/services/mouse-cursor.service';
import { HTMLElementEvent } from 'shared/types/field/field.model';
import { FrameExtractionService } from '../video-frame-extraction.service';
import { VideoLabellingActionService } from '../video-labelling-action.service';
import { ActionState, BboxMetadata, Boundingbox, FrameArray, LabelInfo, LabelledFrame } from '../video-labelling.modal';
import { BoundingBoxCanvasService } from './bounding-box-canvas.service';

@Component({
    selector: 'video-labelling-object-detection',
    templateUrl: './video-labelling-object-detection.component.html',
    styleUrls: ['./video-labelling-object-detection.component.scss'],
})
export class VideoLabellingObjectDetectionComponent implements OnInit, OnChanges, AfterViewInit {
    totalFrameArr: FrameArray[] = [
        {
            frameURL: '../../../assets/video_img/1.jpg',
        },
        {
            frameURL: '../../../assets/video_img/2.jpg',
        },
        {
            frameURL: '../../../assets/video_img/3.jpg',
        },
    ];

    labelledFrame: LabelledFrame[] = [
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            isShow: true,
            color: 'green',
        },
        {
            frame: [1, 2, 3, 4, 7, 8, 9],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [0, 1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
            color: 'yellow',
        },
    ];

    labelList: LabelInfo[] = [
        {
            name: 'People',
            count: 2,
        },
        {
            name: 'People 2',
            count: 2,
        },
    ];

    @Input() _totalFrame = this.totalFrameArr.length;
    @Input() _selectMetadata!: BboxMetadata;
    @Output() _onHide: EventEmitter<LabelledFrame> = new EventEmitter();
    @Output() _onChangeMetadata: EventEmitter<BboxMetadata> = new EventEmitter();
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('floatdiv') floatdiv!: ElementRef<HTMLDivElement>;
    @ViewChild('lbltypetxt') lbltypetxt!: ElementRef<HTMLInputElement>;
    private canvasContext!: CanvasRenderingContext2D;
    private unsubscribe$: Subject<any> = new Subject();
    private mouseCursor!: MouseCursorState;
    private boundingBoxState!: ActionState;
    private annotateState!: AnnotateActionState;
    // allLabelList: LabelInfo[] = [];
    showDropdownLabelBox: boolean = false;
    invalidInput: boolean = false;
    labelSearch: string = '';
    occupiedSpace = [];
    activeFrame = 0;
    activePreview: HTMLImageElement = new Image();
    verticalScroll: boolean = false;
    isPlayingFrame: boolean = false;
    isPausingFrame: boolean = true;
    pauseFrameIndex: number = 0;
    isMouseDown: boolean = false;

    showDetailsIcon: string = `assets/icons/eye_show.svg`;
    hideDetailsIcon: string = `assets/icons/eye_hide.svg`;

    constructor(
        private _videoLblStateService: VideoLabellingActionService,
        private videoFrameExtractionService: FrameExtractionService,
        private _boundingBoxCanvas: BoundingBoxCanvasService,
        private _mouseCursorService: MousrCursorService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit() {
        this._videoLblStateService.action$
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

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));

        this._annotateSelectState.labelStaging$.pipe(takeUntil(this.unsubscribe$)).subscribe((state) => {
            this.annotateState = state;
            console.log('state', state.annotation);
            this._boundingBoxCanvas.setCurrentSelectedbBox(state.annotation);
            /**
             * allow click annotate to highlight respective BB
             * @property _selectMetadata trufy check due to first start project will have no state
             *           but after that it will always it's state being filled
             */
            // this._selectMetadata && this.redrawImage(this._selectMetadata);
        });

        // this.totalFrameArr = this.videoFrameExtractionService.getBlobList();
    }

    ngAfterViewInit(): void {
        this.initializeCanvas();
        this.activePreview.src = this.totalFrameArr[0].frameURL;

        /**
         * https://stackoverflow.com/questions/37532790/typescript-class-drawimage/37534804#37534804
         */
        this.activePreview.onload = () => {
            this.canvasContext.drawImage(this.activePreview, 0, 0);
            this.imgFitToCenter();
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._selectMetadata?.previousValue && changes._selectMetadata?.currentValue) {
            this.redrawImage(this._selectMetadata);
        }
    }

    onScroll = ({ deltaY }: WheelEvent) => {
        if (this.verticalScroll) {
            this.clearCanvas();

            const scrollTo = this._videoTimelineRef.nativeElement.scrollLeft;
            scrollTo !== undefined &&
                this._videoTimelineRef.nativeElement.scrollTo({
                    ...(deltaY > 0 ? { left: scrollTo + 25 } : { left: scrollTo - 25 }),
                });
            deltaY > 0
                ? this.activeFrame !== this._totalFrame - 1
                    ? (this.activeFrame += 1)
                    : this.activeFrame
                : this.activeFrame !== 0
                ? (this.activeFrame -= 1)
                : this.activeFrame;

            this.activeFrame > this.totalFrameArr.length
                ? (this.activePreview.src = '')
                : (this.activePreview.src = this.totalFrameArr[this.activeFrame].frameURL);

            this.canvasContext.drawImage(this.activePreview, 0, 0);
        }
    };

    displayFrameIndicator = (idx: number, index: number, frame: number[]): string => {
        let className = '';
        frame.forEach((element: number) => {
            index === element ? (idx % 2 === 0 ? (className += ' figure1 ') : (className += ' figure2 ')) : className;
        });
        className += this.activeFrame === index && ' cursor row';
        className += ' timelineCell clickable';
        return className;
    };

    onClickVideoTImeline = (index: number) => {
        this.clearCanvas();
        this.activeFrame = index;
        index > this.totalFrameArr.length
            ? (this.activePreview.src = '')
            : (this.activePreview.src = this.totalFrameArr[index].frameURL);
        this.activePreview.onload = () => {
            this.canvasContext.drawImage(this.activePreview, 0, 0);
            this.imgFitToCenter();
        };
    };

    clickPlay = () => {
        this.isPlayingFrame = true;
        this.isPausingFrame = false;
        let isLooping: boolean = true;
        let timeOut: number = 0;

        for (let index = this.activeFrame; index < this.totalFrameArr.length; index++) {
            timer(100 * timeOut).subscribe((x) => {
                if (isLooping) {
                    if (!this.isPausingFrame) {
                        console.log('Playing...', index);
                        this.onClickVideoTImeline(index);
                        if (index === this.totalFrameArr.length - 1) {
                            this.isPlayingFrame = false;
                            this.isPausingFrame = true;
                            this.activeFrame = 0;
                        }
                    } else {
                        this.isPlayingFrame = false;
                        isLooping = false;
                        this.pauseFrameIndex = index;
                        console.log('Pausing...', index);
                    }
                }
            });
            timeOut++;
        }
    };

    clickPause = () => {
        if (this.isPlayingFrame) {
            this.isPausingFrame = true;
        } else {
            this.clickPlay();
        }
    };

    onHide = (idx: number) => {
        this.labelledFrame[idx].isShow = !this.labelledFrame[idx].isShow;
        this._onHide.emit(this.labelledFrame[idx]);
    };

    initializeCanvas(width: string = '95%') {
        this.canvas.nativeElement.style.width = width;
        this.canvas.nativeElement.style.height = '50%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    onEraseBoundingBox() {
        this.clearCanvas();
        this.canvasContext.beginPath();
        this.canvasContext.drawImage(this.activePreview, 0, 0);
        this.imgFitToCenter();
    }

    clearCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    changeMouseCursorState(mouseCursor?: Partial<MouseCursorState>) {
        this._mouseCursorService.setState(mouseCursor);
    }

    currentCursor() {
        return this._mouseCursorService.changeCursor(this.mouseCursor);
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
            );
            this.redrawImage(this._selectMetadata);
            // this.resetZoom();
            this.canvasContext.canvas.style.transformOrigin = `0 0`;
            this.canvasContext.canvas.style.transform = `scale(1, 1)`;
        } catch (err) {
            console.log(err);
        }
    }

    redrawImage({ img_x, img_y, img_w, img_h }: BboxMetadata) {
        this.clearCanvas();
        this.canvasContext.drawImage(this.activePreview, img_x, img_y, img_w, img_h);
        // if (this._tabStatus[2].annotation?.length !== 0) {
        //     this.getLabelList();
        //     let annotationList: Boundingbox[] = [];
        //     if (this._tabStatus[2].annotation) {
        //         if (this._tabStatus[2].annotation[0].bnd_box) {
        //             annotationList = this._tabStatus[2].annotation[0].bnd_box;
        //         }
        //     }
        //     this.sortingLabelList(this.labelList, annotationList);
        // }
        this._boundingBoxCanvas.drawAllBoxOn(this.labelList, this._selectMetadata.bnd_box, this.canvasContext);
    }

    annotateSelectChange(newState: AnnotateActionState) {
        this._annotateSelectState.setState(newState);
    }

    finishDrawBoundingBox(event: MouseEvent) {
        // this.getLabelList();
        // let annotationList: Boundingbox[] = [];
        // if (this._tabStatus[2].annotation) {
        //     if (this._tabStatus[2].annotation[0].bnd_box) {
        //         annotationList = this._tabStatus[2].annotation[0].bnd_box;
        //     }
        // }
        // this.sortingLabelList(this.labelList, annotationList);
        const retObj = this._boundingBoxCanvas.mouseUpDrawEnable(this._selectMetadata, this.labelList, (isDone) => {
            if (isDone) {
                // this._undoRedoService.isStateChange(this._selectMetadata.bnd_box) &&
                //     this._undoRedoService.appendStages({
                //         meta: cloneDeep(this._selectMetadata),
                //         method: 'draw',
                //     });
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

    getBBoxDistanceFromImage() {
        this._boundingBoxCanvas.getBBoxDistfromImg(
            this._selectMetadata.bnd_box,
            this._selectMetadata.img_x,
            this._selectMetadata.img_y,
        );
    }

    emitMetadata() {
        this._onChangeMetadata.emit(this._selectMetadata);
    }

    labelNameClicked(label: string) {
        console.log('label clicked');
        this.showDropdownLabelBox = false;
        // this._onChangeAnnotationLabel.emit({ label, index: this.annotateState.annotation });
        this._selectMetadata.bnd_box[this.annotateState.annotation].label = label;
        // this._undoRedoService.isStateChange(this._selectMetadata.bnd_box) &&
        //     this._undoRedoService.appendStages({
        //         meta: this._selectMetadata,
        //         method: 'draw',
        //     });
    }

    labelTypeTextChange(event: string) {
        console.log('label added');
        this.labelList.filter((label) => label.name.includes(event));
    }

    validateInputLabel = ({ target }: HTMLElementEvent<HTMLTextAreaElement>): void => {
        const { value } = target;
        const valTrimmed = value.trim();
        if (valTrimmed) {
            // const isInvalidLabel: boolean = this._tabStatus.some(
            //     ({ label_list }) => label_list && label_list.length && label_list.some((label) => label === valTrimmed),
            // );
            const isInvalidLabel = false;
            if (!isInvalidLabel) {
                this.invalidInput = false;
                this.showDropdownLabelBox = false;
                // this._onChangeAnnotationLabel.emit({ label: value, index: this.annotateState.annotation });
                this._selectMetadata.bnd_box[this.annotateState.annotation].label = value;
                // this._undoRedoService.isStateChange(this._selectMetadata.bnd_box) &&
                //     this._undoRedoService.appendStages({
                //         meta: this._selectMetadata,
                //         method: 'draw',
                //     });
                this.labelSearch = '';
            } else {
                this.invalidInput = true;
                console.error(`Invalid existing label input`);
            }
        }
    };

    deleteSelectedBbox() {
        this._boundingBoxCanvas.deleteSingleBox(
            this._selectMetadata.bnd_box,
            this.annotateState.annotation,
            (isDone) => {
                if (isDone) {
                    this.annotateSelectChange({ annotation: -1, isDlbClick: false });
                    this.redrawImage(this._selectMetadata);
                    // this._undoRedoService.appendStages({
                    //     meta: cloneDeep(this._selectMetadata),
                    //     method: 'draw',
                    // });
                    this.emitMetadata();
                }
            },
        );
    }

    doubleClickEvent() {
        // this._undoRedoService.clearRedundantStages();
        this.annotateSelectChange({ annotation: this.annotateState.annotation, isDlbClick: true });
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ ctrlKey, metaKey, shiftKey, key }: KeyboardEvent) {
        try {
            const { isActiveModal } = this.boundingBoxState;
            if (!this.isMouseDown && !isActiveModal && !this.showDropdownLabelBox && this._selectMetadata) {
                if (this.annotateState.annotation > -1 && (key === 'Delete' || key === 'Backspace')) {
                    this.deleteSelectedBbox();
                }
                // if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'copy')) {
                //     this.copyImage();
                // } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'paste')) {
                //     this.pasteImage();
                // } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'redo')) {
                //     this.redoAction();
                // } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'undo')) {
                //     this.undoAction();
                // } else if (this.annotateState.annotation > -1 && (key === 'Delete' || key === 'Backspace')) {
                //     this.deleteSelectedBbox();
                // } else {
                //     this.moveBbox(key);
                // }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(_: MouseEvent) {
        try {
            this.annotateState.annotation > -1 && this.doubleClickEvent();
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        try {
            if (this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event)) {
                this.isMouseDown = true;
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
                this.isMouseDown = false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        try {
            if (this.boundingBoxState.draw && this.isMouseDown) {
                this.finishDrawBoundingBox(event);
            }
            if (this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event)) {
                if (this.boundingBoxState.drag && this.isMouseDown) {
                    this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                }

                this.isMouseDown = false;
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
                if (mouseWithinPointPath) {
                    if (this.boundingBoxState.drag && this.isMouseDown) {
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
                                    // this._undoRedoService.isMethodChange('pan')
                                    //     ? this._undoRedoService.appendStages({
                                    //           meta,
                                    //           method: 'pan',
                                    //       })
                                    //     : this._undoRedoService.replaceStages({
                                    //           meta,
                                    //           method: 'pan',
                                    //       });
                                }
                            },
                        );
                        this.redrawImage(this._selectMetadata);
                    } else if (this.boundingBoxState.drag && !this.isMouseDown) {
                        this.changeMouseCursorState({ grab: true });
                    }
                    if (this.boundingBoxState.draw && this.isMouseDown) {
                        this._boundingBoxCanvas.mouseMoveDrawEnable(event.offsetX, event.offsetY, this._selectMetadata);
                        this.redrawImage(this._selectMetadata);
                    }
                    if (this.boundingBoxState.draw && !this.isMouseDown) {
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
                                // this.crossH.nativeElement.style.visibility = 'hidden';
                                // this.crossV.nativeElement.style.visibility = 'hidden';
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
}
