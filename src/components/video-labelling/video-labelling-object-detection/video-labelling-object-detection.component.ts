/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
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
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { concatMap, first, mergeMap, takeUntil } from 'rxjs/operators';
import { AnnotateActionState, AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { MouseCursorState, MousrCursorService } from 'shared/services/mouse-cursor.service';
import { VideoLabellingActionService } from '../video-labelling-action.service';
import {
    ActionState,
    BboxMetadata,
    Boundingbox,
    ChangeAnnotationLabel,
    CompleteMetadata,
    EventEmitter_ThumbnailDetails,
    LabelInfo,
    LabelledFrame,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
    VideoLabelProps,
} from 'shared/types/video-labelling/video-labelling.model';
import { BoundingBoxCanvasService } from './bounding-box-canvas.service';
import { SharedUndoRedoService } from '../../../shared/services/shared-undo-redo.service';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
import { VideoDataSetLayoutApiService } from '../../../layouts/video-data-set-layout/video-data-set-layout-api.service';
import { VideoLabellingLayoutService } from '../../../layouts/video-labelling-layout/video-labelling-layout.service';
import { ProjectSchema } from '../../../shared/types/dataset-layout/data-set-layout.model';
import { WheelDelta, ZoomService, ZoomState } from '../../../shared/services/zoom.service';
import { CopyPasteService } from '../../../shared/services/copy-paste.service';
import { ShortcutKeyService } from '../../../shared/services/shortcut-key.service';
import { Direction, UndoState } from '../../../shared/types/image-labelling/image-labelling.model';
import { HTMLElementEvent } from '../../../shared/types/field/field.model';
import { VideoLabellingApiService } from '../video-labelling-api.service';
import { Message } from '../../../shared/types/message/message.model';

type iconConfigs = {
    imgPath: string;
    hoverLabel: string;
    alt: string;
    onClick: (arg: any) => void;
};

type JsonSchema = {
    [key: string]: Array<iconConfigs>;
};

@Component({
    selector: 'video-labelling-object-detection',
    templateUrl: './video-labelling-object-detection.component.html',
    styleUrls: ['./video-labelling-object-detection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoLabellingObjectDetectionComponent implements OnInit, OnChanges, OnDestroy {
    constructor(
        private _ref: ChangeDetectorRef,
        private _videoLblStateService: VideoLabellingActionService,
        private _boundingBoxCanvas: BoundingBoxCanvasService,
        private _mouseCursorService: MousrCursorService,
        private _annotateSelectState: AnnotateSelectionService,
        private _sharedUndoRedoService: SharedUndoRedoService,
        private _undoRedoService: UndoRedoService,
        private _videoDataSetService: VideoDataSetLayoutApiService,
        private _videoLblLayoutService: VideoLabellingLayoutService,
        private _copyPasteService: CopyPasteService,
        private _zoomService: ZoomService,
        private _shortcutKeyService: ShortcutKeyService,
        private _videoLblApiService: VideoLabellingApiService,
    ) {}
    private canvasContext!: CanvasRenderingContext2D;
    private unsubscribe$: Subject<any> = new Subject();
    private mouseCursor!: MouseCursorState;
    private boundingBoxState!: ActionState;
    private annotateState!: AnnotateActionState;
    private image: HTMLImageElement = new Image();
    private zoom!: ZoomState;
    private timeWhenLastUpdate!: number;
    private timeFromLastUpdate!: number;
    private frameNumber: number = 0;
    private currentNumberOfFrames: number = 0;
    private mousedown: boolean = false;
    labelSearch: string = '';
    invalidInput: boolean = false;
    labelList: LabelInfo[] = [];
    allLabelList: LabelInfo[] = [];
    activeFrame: number = 0;
    nextIndex: number = 0;
    previousIndex: number = 0;
    nextIndexUnAnnotate!: number;
    previousIndexUnAnnotate!: number;
    annotatedImageIndex!: number;
    unAnnotatedImageIndex!: number;
    isPlayingFrame: boolean = false;
    currentPlayingFrame!: number;
    isMouseDown: boolean = false;
    showDropdownLabelBox: boolean = false;
    subject$: Subject<any> = new Subject();
    subscription?: Subscription;
    selectedProjectName: string = '';
    imgUrl: string = '';
    urlList: string[] = [];
    thumbnailIndex: number = 0;
    timeStamp: number = 0;
    onChangeSchema!: VideoLabelProps;
    thumbnailList: CompleteMetadata[] = [];
    tempList: CompleteMetadata[] = [];
    annotatedImage: CompleteMetadata[] = [];
    unAnnotatedImage: CompleteMetadata[] = [];
    selectedMetaData!: BboxMetadata;
    thumbnail!: Omit<BboxMetadata & PolyMetadata, 'img_src'>;
    videoExtract!: any;
    frameRetrieve!: any;
    id!: number;
    totalUuid: number = 0;
    uuid: string = '';
    projectList: Omit<ProjectSchema, 'projects'> = {
        isUploading: false,
        isFetching: false,
    };
    jsonSchema!: JsonSchema;
    iconIndex!: number;
    selectedVideoPath: string = '';
    currentTimeStamp: number = 0;

    @Input() _totalUuid!: number;
    @Input() _videoLength!: number;
    @Input() _videoPath!: string;
    @Input() _selectMetadata!: BboxMetadata;
    @Input() _imgSrc: string = '';
    @Input() _tabStatus: TabsProps<CompleteMetadata>[] = [];
    @Input() _thumbnailIndex!: number;
    @Output() _onChangeAnnotationLabel: EventEmitter<ChangeAnnotationLabel> = new EventEmitter();
    @Output() _onEnterLabel: EventEmitter<Omit<SelectedLabelProps, 'selectedLabel'>> = new EventEmitter();
    @Output() _onHide: EventEmitter<LabelledFrame> = new EventEmitter();
    @Output() _onChangeMetadata: EventEmitter<BboxMetadata> = new EventEmitter();
    @Output() _onClickVideoFrame: EventEmitter<EventEmitter_ThumbnailDetails> = new EventEmitter();
    @Output() _onSearchAnnotatedImage: EventEmitter<EventEmitter_ThumbnailDetails> = new EventEmitter();
    @Output() _onChangeTabAnnotation: EventEmitter<CompleteMetadata> = new EventEmitter();
    @Output() _onScrollTimeline: EventEmitter<void> = new EventEmitter();
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('floatdiv') floatdiv!: ElementRef<HTMLDivElement>;
    @ViewChild('lbltypetxt') lbltypetxt!: ElementRef<HTMLInputElement>;
    @ViewChild('availablelbl') availablelbl!: ElementRef<HTMLDivElement>;
    @ViewChild('crossH') crossH!: ElementRef<HTMLDivElement>;
    @ViewChild('crossV') crossV!: ElementRef<HTMLDivElement>;

    ngOnInit() {
        this.getLabelList();

        this._videoLblStateService.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ clear, fitCenter, crossLine, ...action }) => {
                if (clear || fitCenter || action.drag || action.draw || action.save || action.keyInfo) {
                    this.showDropdownLabelBox = false; // close dropdown label if user click clear
                    this._ref.detectChanges();
                }
                this.boundingBoxState = { ...action, clear, fitCenter, crossLine };

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

        // retrieving all the uuid from database to establish time line, we can directly get from _thumbnailList
        // if we want first 20 uuid, else have to get all from observable below
        const { projectName, videoPath } = this._videoLblLayoutService.getRouteState(history);
        this.selectedProjectName = projectName;
        this.selectedVideoPath = videoPath;
        this.videoExtraction(this.selectedVideoPath, this.selectedProjectName, this.currentTimeStamp);

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));

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

        this._sharedUndoRedoService.action.subscribe((message) => {
            switch (message) {
                case 'BBOX_UNDO':
                    this.undoAction();
                    break;
                case 'BBOX_REDO':
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
                    this.initializeCanvas();
                    this.imgFitToCenter();
                } else {
                    this.redrawImage(this._selectMetadata);
                }
            }
        }

        if (this.thumbnailIndex) {
            this.updateModifiedData(this.thumbnailIndex);
        }

        this.updateActiveFrame();

        this.bindImagePath();

        // if (this.videoTimelineScroll()){
        //     if (this._totalUuid >= this._videoLength) {
        //         console.log(this._totalUuid);
        //         console.log(this._videoLength);
        //         return;
        //     }
        //     console.log(this._totalUuid);
        //     console.log(this._videoLength);
        //     console.log(this.thumbnailList);
        //     const { projectName } = this._videoLblLayoutService.getRouteState(history);
        //     this.retrieveAllVideoFrame(projectName);
        // }
    }

    videoExtraction(videoPath: string, projectName: string, currentTimeStamp: number): void {
        const videoExtraction$ = this._videoDataSetService.initiateVideoExtraction(
            videoPath,
            projectName,
            currentTimeStamp,
        );
        const videoExtractStatus$ = this._videoDataSetService.videoExtractionStatus(projectName);

        videoExtraction$
            .pipe(
                first(),
                mergeMap(() => videoExtractStatus$),
            )
            .subscribe(
                (response) => {
                    if (response.video_extraction_status === 0) {
                        this.currentTimeStamp = response.current_time_stamp;
                    }
                },
                (error) => {
                    console.error(error);
                },
                () => {
                    this.retrieveAllVideoFrame(this.selectedProjectName);
                },
            );
    }

    retrieveAllVideoFrame(projectName: string) {
        const projLoadingStatus$ = this._videoDataSetService.checkExistProjectStatus(projectName);
        const thumbnail$ = this._videoDataSetService.getThumbnailList;

        this.subscription = this.subject$
            .pipe(
                first(),
                concatMap(() => projLoadingStatus$),
                concatMap(({ uuid_list }) => {
                    return uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [];
                }),
                concatMap((data) => data),
            )
            .subscribe(
                (res) => {
                    // this.thumbnailList = [...this.thumbnailList, res];
                    if (!this.thumbnailList.includes(res)) {
                        this.thumbnailList.push(res);
                    }

                    // this.tempList = [res];
                    // this.thumbnailList.push.apply(this.thumbnailList, this.tempList);

                    // this.thumbnailList = [res.uuid, res.bnd_box, res.img_path];
                    // this.frame = {
                    //     frameURL: this.thumbnailList[0],
                    //     bnd_box: this.thumbnailList[1],
                    //     framePath: this.thumbnailList[2],
                    // };
                    // this.totalFrameArr.push(this.frame);
                },
                () => {
                    /** This is intentional */
                },
                () => {
                    // for (let i = 0; i < this.thumbnailList.length; i++) {
                    //     this.getImageSource({ i, ...this.thumbnailList[i] });
                    // }
                    console.log(this.thumbnailList.length);
                    console.log(this._videoLength);
                    console.log('thumbnail List loading complete');
                },
            );
        this.subject$.next();

        // if (this.thumbnailList.length < this._videoLength) {
        //     console.log(this.thumbnailList.length);
        //     console.log(this._videoLength);
        //     this.videoExtraction(this.selectedVideoPath, this.selectedProjectName, this.currentTimeStamp);
        // }
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `assets/icons/previous.svg`,
                    hoverLabel: `videoTimeLine.previousAnnotatedImage`,
                    alt: `previous arrow`,
                    onClick: () => {
                        this.previousAnnotatedImage();
                    },
                },
                {
                    imgPath: `assets/icons/next.svg`,
                    hoverLabel: 'videoTimeLine.nextAnnotatedImage',
                    alt: `next arrow`,
                    onClick: () => {
                        this.nextAnnotatedImage();
                    },
                },
                {
                    imgPath: `assets/icons/left_double_arrow.svg`,
                    hoverLabel: `videoTimeLine.previousUnannotatedImage`,
                    alt: `left double arrow`,
                    onClick: () => {
                        this.previousUnannotatedImage();
                    },
                },
                {
                    imgPath: `assets/icons/right_double_arrow.svg`,
                    hoverLabel: 'videoTimeLine.nextUnannotatedImage',
                    alt: `right double arrow`,
                    onClick: () => {
                        this.nextUnannotatedImage();
                    },
                },
            ],
        };
    };

    checkCloseToggle = (tab: TabsProps): string | null => {
        let classes = '';
        if (
            !(
                (tab.name === 'label' && this._tabStatus[2].closed) ||
                (tab.name === 'project' && this._tabStatus[1].closed && this._tabStatus[2].closed) ||
                tab.name === 'annotation'
            )
        ) {
            classes = 'flex-content';
        }
        if (tab.closed) {
            classes += ' closed';
        }
        return classes;
    };

    getIndex = (index: number): void => {
        this.iconIndex = index;
    };

    updateActiveFrame() {
        this.activeFrame = this._thumbnailIndex;
    }

    loadImage(bit64STR: string) {
        try {
            this.showDropdownLabelBox = false;
            this.image.src = bit64STR;
            this.image.onload = () => {
                this._selectMetadata.img_w =
                    this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
                this._selectMetadata.img_h =
                    this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.imgFitToCenter();
                this.emitMetadata();
                this.changeMouseCursorState();
                this._undoRedoService.appendStages({
                    meta: cloneDeep(this._selectMetadata),
                    method: 'draw',
                });
            };
        } catch (err) {
            console.log(err);
        }
    }

    displayFrameIndicator = (index: number, annotation: Boundingbox[]): string => {
        let className = '';
        annotation.length > 0 ? (className += ' figure1 ') : (className += ' figure2 ');
        className += this.activeFrame === index && 'cursor row';
        className += ' timelineCell clickable';
        return className;
    };

    @HostListener('mousewheel', ['$event'])
    videoTimelineScroll() {
        const timeLine = this._videoTimelineRef.nativeElement;

        timeLine.addEventListener('wheel', (e) => {
            if (e.deltaY > 0) {
                timeLine.scrollLeft += 20;
            } else {
                timeLine.scrollLeft -= 20;
            }
            e.preventDefault();
        });

        return true;
    }

    onClickVideoTimeLine = (thumbnailIndex: number) => {
        this.thumbnailIndex = thumbnailIndex;
        this.clearCanvas();
        this._onClickVideoFrame.emit({ ...this.thumbnailList[thumbnailIndex], thumbnailIndex });
        this.activeFrame = thumbnailIndex;
    };

    timeIndicator() {
        let indicator = '00.00.000';
        this.currentPlayingFrame = this.activeFrame;

        if (!this.isPlayingFrame && this.timeStamp === 0) {
            return indicator;
        }

        if (this.isPlayingFrame && this.currentPlayingFrame === this.activeFrame) {
            this.timeStamp = this.thumbnailList[this.currentPlayingFrame].video_time_stamp;
        } else {
            this.timeStamp = this.thumbnailList[this.activeFrame].video_time_stamp;
        }

        if (this.timeStamp > 0) {
            if (this.timeStamp < 1000) {
                indicator = '00' + '.' + '00' + '.' + this.timeStamp.toString();
            } else if (this.timeStamp > 1000 && this.timeStamp < 60000) {
                const time = this.timeStamp / 1000;
                const seconds = Math.trunc(time);
                const milliseconds = (time - seconds) * 1000;
                indicator =
                    '00' + '.' + ((seconds < 10 ? '0' : '') + seconds.toString()) + '.' + milliseconds.toFixed(0);
            } else {
                const minutes = Math.floor(this.timeStamp / 60000);
                const time = (this.timeStamp - minutes * 60000) / 1000;
                const seconds = Math.trunc(time);
                const millisecond = (time - seconds) * 1000;
                indicator =
                    (minutes < 10 ? '0' : '') +
                    minutes.toString() +
                    '.' +
                    ((seconds < 10 ? '0' : '') + seconds.toString()) +
                    '.' +
                    millisecond.toFixed(0);
            }
            return indicator;
        }
    }

    clickPlay = () => {
        this.isPlayingFrame = true;

        if (this.frameNumber < this.thumbnailList.length) {
            this.id = window.requestAnimationFrame(this.step);
        } else if (this.frameNumber === this.thumbnailList.length - 1) {
            this.isPlayingFrame = false;
            this.activeFrame = 0;
        } else {
            this.isPlayingFrame = false;
            this.activeFrame = this.frameNumber;
        }
    };

    clickPause = () => {
        if (this.isPlayingFrame) {
            this.isPlayingFrame = false;
            window.cancelAnimationFrame(this.id);
        } else {
            this.clickPlay();
        }
    };

    step = (startTime: number) => {
        if (!this.timeWhenLastUpdate) {
            this.timeWhenLastUpdate = startTime;
        }

        this.timeFromLastUpdate = startTime - this.timeWhenLastUpdate;

        if (this.frameNumber < this.thumbnailList.length) {
            const index = this.frameNumber;
            this.getImageSource({ index, ...this.thumbnailList[index] }, this.selectedProjectName);
            this.image.src = this.imgUrl;
            // this.image.src = this.urlList[this.frameNumber];
            this.activeFrame = this.frameNumber;
            // @ts-ignore
            this.thumbnail = this.thumbnailList[this.frameNumber];
            this.selectedMetaData = { ...this.thumbnail };
            this._selectMetadata.bnd_box = this.selectedMetaData.bnd_box;
            this._onChangeTabAnnotation.emit(this.thumbnail);
            this.image.onload = () => {
                this.canvasContext.drawImage(this.image, 0, 0);
                this.imgFitToCenter();
                this._boundingBoxCanvas.drawAllBoxOn(this.labelList, this._selectMetadata.bnd_box, this.canvasContext);
            };
            this.timeWhenLastUpdate = startTime;
            this.frameNumber = this.frameNumber + 1;

            if (this.frameNumber === this.thumbnailList.length - 1) {
                this.frameNumber = 0;
            }
        }

        this.id = window.requestAnimationFrame(this.step);
    };

    getImageSource = ({ thumbnailIndex, ...thumbnail }: any, projectName = this.selectedProjectName): void => {
        const getImage$ = this._videoLblApiService.getBase64Thumbnail(projectName, thumbnail.uuid);
        getImage$.pipe(first()).subscribe(
            ({ message, img_src }) => {
                if (message === 1) {
                    // const imgUrl = img_src;
                    // this.urlList.push(imgUrl);
                    this.imgUrl = img_src;
                }
            },
            (err: Error) => console.error(err),
            () => console.log('end'),
        );
    };

    initializeCanvas(width: string = '80%') {
        this.canvas.nativeElement.style.width = width;
        this.canvas.nativeElement.style.height = '74%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
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
            this.resetZoom();
            this.canvasContext.canvas.style.transformOrigin = `0 0`;
            this.canvasContext.canvas.style.transform = `scale(1, 1)`;
        } catch (err) {
            console.log(err);
        }
    }

    resetZoom() {
        this._zoomService.resetZoomScale();
    }

    redrawImage({ img_x, img_y, img_w, img_h }: BboxMetadata) {
        this.clearCanvas();
        this.canvasContext.drawImage(this.image, img_x, img_y, img_w, img_h);
        if (this._tabStatus[2].annotation?.length !== 0) {
            this.getLabelList();
            let annotationList: Boundingbox[] = [];
            if (this._tabStatus[2].annotation) {
                if (this._tabStatus[2].annotation[0].bnd_box) {
                    annotationList = this._tabStatus[2].annotation[0].bnd_box;
                }
            }
            this.sortingLabelList(this.labelList, annotationList);
        }
        this._boundingBoxCanvas.drawAllBoxOn(this.labelList, this._selectMetadata.bnd_box, this.canvasContext);
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

    sortingLabelList(labelList: LabelInfo[], annotationList: Boundingbox[]) {
        labelList.forEach(({ name }, index) => {
            this.labelList[index].count = annotationList.filter(({ label }) => label === name).length;
            this.allLabelList[index].count = annotationList.filter(({ label }) => label === name).length;
        });
        this.labelList.sort((a, b) => this.sortAlgo(a, b));
        this.allLabelList.sort((a, b) => this.sortAlgo(a, b));
    }

    sortAlgo(a: LabelInfo, b: LabelInfo) {
        if (a.count < b.count) {
            return 1;
        } else if (b.count < a.count) {
            return -1;
        } else {
            return 0;
        }
    }

    annotateSelectChange(newState: AnnotateActionState) {
        this._annotateSelectState.setState(newState);
    }

    finishDrawBoundingBox(event: MouseEvent) {
        this.getLabelList();
        let annotationList: Boundingbox[] = [];
        if (this._tabStatus[2].annotation) {
            if (this._tabStatus[2].annotation[0].bnd_box) {
                annotationList = this._tabStatus[2].annotation[0].bnd_box;
            }
        }
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

        if (this._thumbnailIndex) {
            if (this._thumbnailIndex < 0) {
                this._thumbnailIndex = 0;
                this.updateModifiedData(this._thumbnailIndex);
            } else {
                this.updateModifiedData(this._thumbnailIndex);
            }
        }
    }

    updateModifiedData(index: number) {
        const update$ = this._videoDataSetService.getThumbnailList(
            this.selectedProjectName,
            this.thumbnailList[index].uuid,
        );

        update$.subscribe((res) => {
            // @ts-ignore
            this.thumbnailList[index] = res;
        });
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            this.crossH.nativeElement.style.visibility = 'hidden';
            this.crossV.nativeElement.style.visibility = 'hidden';
            if (this.boundingBoxState.draw && this.isMouseDown) {
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
            if (this.boundingBoxState.drag && this.isMouseDown) {
                this._boundingBoxCanvas.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.redrawImage(this._selectMetadata);
            }
            this.mousedown = false;
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
                if (
                    mouseWithinPointPath &&
                    !this.showDropdownLabelBox &&
                    this.boundingBoxState.draw &&
                    this.boundingBoxState.crossLine
                ) {
                    this.crossH.nativeElement.style.visibility = 'visible';
                    this.crossV.nativeElement.style.visibility = 'visible';
                    this.crossH.nativeElement.style.top = event.pageY.toString() + 'px';
                    this.crossV.nativeElement.style.left = event.pageX.toString() + 'px';
                } else {
                    this.crossH.nativeElement.style.visibility = 'hidden';
                    this.crossV.nativeElement.style.visibility = 'hidden';
                }
                if (mouseWithinPointPath && !this.showDropdownLabelBox) {
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
                                this.crossH.nativeElement.style.visibility = 'hidden';
                                this.crossV.nativeElement.style.visibility = 'hidden';
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

    @HostListener('mousewheel', ['$event'])
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

    moveBbox(key: string) {
        switch (key) {
            case 'ArrowLeft':
                this.keyMoveBox('left');
                break;
            case 'ArrowRight':
                this.keyMoveBox('right');
                break;
            case 'ArrowUp':
                this.keyMoveBox('up');
                break;
            case 'ArrowDown':
                this.keyMoveBox('down');
                break;
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

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ ctrlKey, metaKey, shiftKey, key }: KeyboardEvent) {
        try {
            const { isActiveModal } = this.boundingBoxState;
            if (!this.mousedown && !isActiveModal && !this.showDropdownLabelBox && this._selectMetadata) {
                if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'copy')) {
                    this.copyImage();
                } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'paste')) {
                    this.pasteImage();
                } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'redo')) {
                    this.redoAction();
                } else if (this._shortcutKeyService.checkKey(ctrlKey, metaKey, shiftKey, key, 'undo')) {
                    this.undoAction();
                } else if (this.annotateState.annotation > -1 && (key === 'Delete' || key === 'Backspace')) {
                    this.deleteSelectedBbox();
                } else if (key === 'd') {
                    this.nextAnnotatedImage();
                } else if (key === 'a') {
                    this.previousAnnotatedImage();
                } else if (key === 'e') {
                    this.nextUnannotatedImage();
                } else if (key === 'q') {
                    this.previousUnannotatedImage();
                } else {
                    this.moveBbox(key);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    nextAnnotatedImage() {
        // @ts-ignore
        this.annotatedImage = this.thumbnailList.filter((ele) => ele.bnd_box.length > 0);

        if (this.activeFrame !== this.annotatedImageIndex) {
            this.nextIndex = this.annotatedImage.findIndex(
                (target) => target.uuid === this.thumbnailList[this.activeFrame].uuid,
            );
            this.annotatedImageIndex = this.thumbnailList.findIndex(
                (ele) => ele.uuid === this.annotatedImage[this.nextIndex].uuid,
            );
            this.emitImageAnnotation(this.annotatedImageIndex);
            this.activeFrame = this.annotatedImageIndex;
            this.previousIndex = this.nextIndex - 1;
            this.nextIndex++;
        }

        if (this.nextIndex <= this.annotatedImage.length - 1) {
            this.annotatedImageIndex = this.thumbnailList.indexOf(this.annotatedImage[this.nextIndex]);
            this.emitImageAnnotation(this.annotatedImageIndex);
            this.activeFrame = this.annotatedImageIndex;
            this.previousIndex = this.nextIndex - 1;
            this.nextIndex++;
        }

        if (this.nextIndex === this.annotatedImage.length - 1) {
            this.nextIndex = 0;
            this.previousIndex = this.nextIndex;
            this.annotatedImageIndex = this.thumbnailList.indexOf(this.annotatedImage[this.nextIndex]);
            this.emitImageAnnotation(this.annotatedImageIndex);
            this.activeFrame = this.annotatedImageIndex;
            this.previousIndex = this.nextIndex - 1;
            this.nextIndex++;
        }
    }

    previousAnnotatedImage() {
        // @ts-ignore
        this.annotatedImage = this.thumbnailList.filter((ele) => ele.bnd_box.length > 0);

        if (this.activeFrame !== this.annotatedImageIndex) {
            this.previousIndex = this.annotatedImage.findIndex(
                (target) => target.uuid === this.thumbnailList[this.activeFrame].uuid,
            );
            this.annotatedImageIndex = this.thumbnailList.findIndex(
                (ele) => ele.uuid === this.annotatedImage[this.previousIndex].uuid,
            );
            this.emitImageAnnotation(this.annotatedImageIndex);
            this.activeFrame = this.annotatedImageIndex;
            this.nextIndex = this.previousIndex + 1;
            this.previousIndex--;
        }

        if (this.activeFrame === this.annotatedImageIndex) {
            this.annotatedImageIndex = this.thumbnailList.indexOf(this.annotatedImage[this.previousIndex]);
            this.emitImageAnnotation(this.annotatedImageIndex);
            this.activeFrame = this.annotatedImageIndex;
            this.nextIndex = this.previousIndex + 1;
            this.previousIndex--;
        }
    }

    nextUnannotatedImage() {
        // @ts-ignore
        this.unAnnotatedImage = this.thumbnailList.filter((ele) => ele.bnd_box.length === 0);

        if (!this.nextIndexUnAnnotate) {
            // @ts-ignore
            this.unAnnotatedImageIndex = this.thumbnailList.findIndex((ele) => ele === this.unAnnotatedImage[0]);
            this.emitImageAnnotation(this.unAnnotatedImageIndex);
            this.nextIndexUnAnnotate = 1;
            this.previousIndexUnAnnotate = this.nextIndexUnAnnotate - 1;
            this.activeFrame = this.unAnnotatedImageIndex;
        } else {
            this.unAnnotatedImageIndex = this.thumbnailList.indexOf(this.unAnnotatedImage[this.nextIndexUnAnnotate]);
            console.log(this.unAnnotatedImageIndex);
            this.emitImageAnnotation(this.unAnnotatedImageIndex);
            this.previousIndexUnAnnotate = this.nextIndexUnAnnotate - 1;
            this.activeFrame = this.unAnnotatedImageIndex;
            this.nextIndexUnAnnotate++;
        }
    }

    previousUnannotatedImage() {
        // @ts-ignore
        this.unAnnotatedImage = this.thumbnailList.filter((ele) => ele.bnd_box.length === 0);

        if (!this.previousIndexUnAnnotate) {
            this.unAnnotatedImageIndex = this.thumbnailList.findIndex((ele) => ele === this.unAnnotatedImage[0]);
            this.emitImageAnnotation(this.unAnnotatedImageIndex);
            this.previousIndexUnAnnotate = this.unAnnotatedImageIndex;
            this.nextIndexUnAnnotate = this.previousIndexUnAnnotate;
            this.activeFrame = this.unAnnotatedImageIndex;
        } else {
            this.unAnnotatedImageIndex = this.thumbnailList.indexOf(
                this.unAnnotatedImage[this.previousIndexUnAnnotate],
            );
            this.emitImageAnnotation(this.unAnnotatedImageIndex);
            this.nextIndexUnAnnotate = this.previousIndexUnAnnotate + 1;
            this.activeFrame = this.unAnnotatedImageIndex;
            this.previousIndexUnAnnotate--;
        }
    }

    emitImageAnnotation(index: number) {
        // @ts-ignore
        this.thumbnail = this.thumbnailList[index];
        this._onSearchAnnotatedImage.emit({ ...this.thumbnail, thumbnailIndex: index });
    }

    deleteSelectedBbox() {
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
    }

    copyImage() {
        this.annotateState.annotation > -1 &&
            this._copyPasteService.copy(this._selectMetadata.bnd_box[this.annotateState.annotation]);
    }

    pasteImage() {
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
    }

    redoAction() {
        if (this._undoRedoService.isAllowRedo()) {
            const rtStages: UndoState = this._undoRedoService.redo();
            this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
            this.redrawImage(this._selectMetadata);
            this.getBBoxDistanceFromImage();
            this.emitMetadata();
        }
    }

    undoAction() {
        if (this._undoRedoService.isAllowUndo()) {
            const rtStages: UndoState = this._undoRedoService.undo();
            this._selectMetadata = cloneDeep(rtStages?.meta as BboxMetadata);
            this.redrawImage(this._selectMetadata);
            this.getBBoxDistanceFromImage();
            this.emitMetadata();
        }
    }

    ngOnDestroy(): void {
        this._annotateSelectState.setState();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.subscription?.unsubscribe();
    }
}
