/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
    HostListener,
    Output,
    EventEmitter,
} from '@angular/core';
import { LabelledFrame, FrameArray } from './video-timeline.model';
import { timer } from 'rxjs';

@Component({
    selector: 'video-timeline',
    templateUrl: './video-timeline.component.html',
    styleUrls: ['./video-timeline.component.scss'],
})
export class VideoTimelineComponent implements OnInit, OnChanges {
    // occupiedSpace = [...Array(27)];
    occupiedSpace = [];
    @Output() _onHide: EventEmitter<LabelledFrame> = new EventEmitter();
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    activeFrame = 0;
    activePreview: string = '';
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
        },
        {
            frame: [1, 2, 3, 4, 7, 8, 9],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            isShow: true,
        },
    ];

    constructor() {}

    ngOnInit() {
        this.activePreview = this.totalFrameArr[0].frameURL;
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
                ? (this.activePreview = '')
                : (this.activePreview = this.totalFrameArr[this.activeFrame].frameURL);
        }
    };

    displayFrameIndicator = (index: number, frame: any): string => {
        let className = '';
        frame.forEach((element: number) => {
            index === element ? (className += ' figure ') : className;
        });
        className += this.activeFrame === index && ' cursor row';
        className += ' timelineCell clickable';
        return className;
    };

    onClickVideoTImeline = (index: number) => {
        this.activeFrame = index;
        index > this.totalFrameArr.length
            ? (this.activePreview = '')
            : (this.activePreview = this.totalFrameArr[index].frameURL);
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

        if (this.labelledFrame[idx].isShow) {
            //document.getElementById('eye_' + idx).src = '../../assets/icons/eye_show.svg';
        } else {
            //document.getElementById('eye_' + idx).src = '../../assets/icons/eye_hide.svg';
        }
    };

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
