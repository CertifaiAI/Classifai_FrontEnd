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
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MouseCursorState, MousrCursorService } from 'shared/services/mouse-cursor.service';
import { FrameExtractionService } from '../video-frame-extraction.service';
import { VideoLabellingActionService } from '../video-labelling-action.service';
import { ActionState, BboxMetadata, FrameArray, LabelledFrame } from '../video-labelling.modal';
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

    @Input() _totalFrame = this.totalFrameArr.length;
    @Input() _selectMetadata!: BboxMetadata;
    @Output() _onHide: EventEmitter<LabelledFrame> = new EventEmitter();
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    private canvasContext!: CanvasRenderingContext2D;
    private unsubscribe$: Subject<any> = new Subject();
    private mouseCursor!: MouseCursorState;
    private boundingBoxState!: ActionState;
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
    ) {}

    ngOnInit() {
        this._videoLblStateService.action$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ clear, fitCenter, ...action }) => {
                if (clear) {
                    this.onEraseBoundingBox();
                }
                this.boundingBoxState = { ...action, clear, fitCenter };
            });

        this._mouseCursorService.mouseCursor$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.mouseCursor = state));

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
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._totalFrame.currentValue) {
            this.totalFrameArr = [...Array(changes._totalFrame.currentValue as number)];
        }

        if (this.canvas) {
            console.log('CALLED');
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
        };
    };

    // clickPlay = () => {
    //     this.isPlayingFrame = true;
    //     this.isPausingFrame = false;
    //     let isLooping: boolean = true;
    //     let timeOut: number = 0;

    //     for (let index = this.activeFrame; index < this.totalFrameArr.length; index++) {
    //         timer(300 * timeOut).subscribe((x) => {
    //             this.clearCanvas();
    //             this.activePreview.src = this.totalFrameArr[index].frameURL;
    //             this.canvasContext.drawImage(this.activePreview, 0, 0);
    //         });
    //         timeOut++;
    //     }
    // }

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
        this.canvas.nativeElement.style.height = '45%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    onEraseBoundingBox() {
        this.clearCanvas();
        this.canvasContext.beginPath();
        this.canvasContext.drawImage(this.activePreview, 0, 0);
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

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        if (this.boundingBoxState.draw) {
            this.changeMouseCursorState({ crosshair: true });
            this._boundingBoxCanvas.setPanXY(event.offsetX, event.offsetY);
            this._boundingBoxCanvas.getMousePosA(event, this.canvasContext);
        }
        this.isMouseDown = true;
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        if (this.boundingBoxState.draw) {
            this._boundingBoxCanvas.getMousePosB(event, this.canvasContext);
            this._boundingBoxCanvas.drawBoundingBox(this.canvasContext);
        }
        this.isMouseDown = false;
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        if (this._selectMetadata) {
            const mouseWithinPointPath = this._boundingBoxCanvas.mouseClickWithinPointPath(this._selectMetadata, event);
            if (mouseWithinPointPath) {
                if (this.boundingBoxState.draw) {
                    this.changeMouseCursorState({ crosshair: true });
                }
            } else {
                this.changeMouseCursorState();
            }
        }
    }
}
