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
import { timer } from 'rxjs';
import { FrameArray, LabelledFrame } from '../video-labelling.modal';

@Component({
    selector: 'video-labelling-object-detection',
    templateUrl: './video-labelling-object-detection.component.html',
    styleUrls: ['./video-labelling-object-detection.component.scss'],
})
export class VideoLabellingObjectDetectionComponent implements OnInit, OnChanges, AfterViewInit {
    private canvasContext!: CanvasRenderingContext2D;

    occupiedSpace = [];
    @Output() _onHide: EventEmitter<LabelledFrame> = new EventEmitter();
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    @ViewChild('canvasdrawing') canvas!: ElementRef<HTMLCanvasElement>;
    activeFrame = 0;
    activePreview: HTMLImageElement = new Image();
    verticalScroll: boolean = false;
    isPlayingFrame: boolean = false;
    isPausingFrame: boolean = true;
    pauseFrameIndex: number = 0;

    showDetailsIcon: string = `../../../assets/icons/eye_show.svg`;
    hideDetailsIcon: string = `../../../assets/icons/eye_hide.svg`;

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
        {
            frameURL: '../../../assets/video_img/4.jpg',
        },
        {
            frameURL: '../../../assets/video_img/5.jpg',
        },
        {
            frameURL: '../../../assets/video_img/6.jpg',
        },
        {
            frameURL: '../../../assets/video_img/7.jpg',
        },
        {
            frameURL: '../../../assets/video_img/8.jpg',
        },
        {
            frameURL: '../../../assets/video_img/9.jpg',
        },
        {
            frameURL: '../../../assets/video_img/10.jpg',
        },
        {
            frameURL: '../../../assets/video_img/11.jpg',
        },
        {
            frameURL: '../../../assets/video_img/12.jpg',
        },
        {
            frameURL: '../../../assets/video_img/13.jpg',
        },
        {
            frameURL: '../../../assets/video_img/14.jpg',
        },
        {
            frameURL: '../../../assets/video_img/15.jpg',
        },
        {
            frameURL: '../../../assets/video_img/16.jpg',
        },
        {
            frameURL: '../../../assets/video_img/17.jpg',
        },
        {
            frameURL: '../../../assets/video_img/18.jpg',
        },
        {
            frameURL: '../../../assets/video_img/19.jpg',
        },
        {
            frameURL: '../../../assets/video_img/20.jpg',
        },
        {
            frameURL: '../../../assets/video_img/21.jpg',
        },
        {
            frameURL: '../../../assets/video_img/22.jpg',
        },
        {
            frameURL: '../../../assets/video_img/23.jpg',
        },
        {
            frameURL: '../../../assets/video_img/24.jpg',
        },
        {
            frameURL: '../../../assets/video_img/25.jpg',
        },
        {
            frameURL: '../../../assets/video_img/26.jpg',
        },
        {
            frameURL: '../../../assets/video_img/27.jpg',
        },
        {
            frameURL: '../../../assets/video_img/28.jpg',
        },
        {
            frameURL: '../../../assets/video_img/29.jpg',
        },
        {
            frameURL: '../../../assets/video_img/30.jpg',
        },
        {
            frameURL: '../../../assets/video_img/1.jpg',
        },
        {
            frameURL: '../../../assets/video_img/2.jpg',
        },
        {
            frameURL: '../../../assets/video_img/3.jpg',
        },
        {
            frameURL: '../../../assets/video_img/4.jpg',
        },
        {
            frameURL: '../../../assets/video_img/5.jpg',
        },
        {
            frameURL: '../../../assets/video_img/6.jpg',
        },
        {
            frameURL: '../../../assets/video_img/7.jpg',
        },
        {
            frameURL: '../../../assets/video_img/8.jpg',
        },
        {
            frameURL: '../../../assets/video_img/9.jpg',
        },
        {
            frameURL: '../../../assets/video_img/10.jpg',
        },
    ];

    @Input() _totalFrame = this.totalFrameArr.length;

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

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit(): void {
        this.initializeCanvas();
        this.activePreview.src = this.totalFrameArr[0].frameURL;
        this.canvasContext.drawImage(this.activePreview, 450, 10);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._totalFrame.currentValue) {
            this.totalFrameArr = [...Array(changes._totalFrame.currentValue as number)];
        }
    }

    onScroll = ({ deltaY }: WheelEvent) => {
        if (this.verticalScroll) {
            this.canvasContext.clearRect(0, 0, 450, 10);

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

            this.canvasContext.drawImage(this.activePreview, 450, 10);
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

        this.canvasContext.drawImage(this.activePreview, 450, 10);
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

    initializeCanvas(width: string = '70%') {
        this.canvas.nativeElement.style.width = '90vw';
        this.canvas.nativeElement.style.height = '70%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    clearCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: any) {
        if (event.code === 'ShiftLeft') {
            this.verticalScroll = true;
        }

        if (event.code === 'Space') {
            this.clickPause();
        }
    }

    @HostListener('window:keyup', ['$event'])
    onReleaseKey() {
        this.verticalScroll = false;
    }
}
