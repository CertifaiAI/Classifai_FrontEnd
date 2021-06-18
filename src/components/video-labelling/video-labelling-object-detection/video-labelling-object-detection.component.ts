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
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/e11763bf97ddbaca99e1a0aea9a5faed-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/fd6a17196b7c19bf492fd7a644700c0c-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/76960c0367bda882ffa044b092e7bf62-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/acfda8d971aee2bc4294666fb0027294-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/9f3a00679779bb034efd50a4fad87674-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/e11763bf97ddbaca99e1a0aea9a5faed-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/fd6a17196b7c19bf492fd7a644700c0c-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/76960c0367bda882ffa044b092e7bf62-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/acfda8d971aee2bc4294666fb0027294-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/9f3a00679779bb034efd50a4fad87674-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/e11763bf97ddbaca99e1a0aea9a5faed-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/fd6a17196b7c19bf492fd7a644700c0c-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frameURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
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
        this.activePreview.src = this.totalFrameArr[0].frameURL;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._totalFrame.currentValue) {
            this.totalFrameArr = [...Array(changes._totalFrame.currentValue as number)];
        }
    }

    onScroll = ({ deltaY }: WheelEvent) => {
        if (this.verticalScroll) {
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
        this.activeFrame = index;
        index > this.totalFrameArr.length
            ? (this.activePreview.src = '')
            : (this.activePreview.src = this.totalFrameArr[index].frameURL);
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
                        console.log('PAUSING', index);
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
        this.canvas.nativeElement.style.width = '450vw';
        this.canvas.nativeElement.style.height = '50%';
        this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
        this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
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
