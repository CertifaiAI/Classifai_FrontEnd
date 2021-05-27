/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { delay } from 'rxjs/operators';
import { LabelledFrame } from './video-timeline.model';

@Component({
    selector: 'video-timeline',
    templateUrl: './video-timeline.component.html',
    styleUrls: ['./video-timeline.component.scss'],
})
export class VideoTimelineComponent implements OnInit, OnChanges {
    // occupiedSpace = [...Array(27)];
    occupiedSpace = [];
    @Input() _totalFrame = 30;
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    totalFrameArr: number[] = [...Array(this._totalFrame)];
    activeFrame = 0;
    activePreview: string = '';

    verticalScroll: boolean = false;
    isPlayingFrame: boolean = false;

    labelledFrame: LabelledFrame[] = [
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/e11763bf97ddbaca99e1a0aea9a5faed-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/fd6a17196b7c19bf492fd7a644700c0c-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/76960c0367bda882ffa044b092e7bf62-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/acfda8d971aee2bc4294666fb0027294-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/9f3a00679779bb034efd50a4fad87674-full.jpg',
        },
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/e11763bf97ddbaca99e1a0aea9a5faed-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/fd6a17196b7c19bf492fd7a644700c0c-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/76960c0367bda882ffa044b092e7bf62-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/acfda8d971aee2bc4294666fb0027294-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/9f3a00679779bb034efd50a4fad87674-full.jpg',
        },
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/3545aa32b30f54bfb79759dd5adabfb0-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/e11763bf97ddbaca99e1a0aea9a5faed-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/b9210967dbc8b5e411d36371f3bed975-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/fd6a17196b7c19bf492fd7a644700c0c-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/38637dc576add631cbc6e238b2944108-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/76960c0367bda882ffa044b092e7bf62-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/acfda8d971aee2bc4294666fb0027294-full.jpg',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
            imageURL:
                'https://www.trulia.com/pictures/thumbs_5/zillowstatic/fp/9f3a00679779bb034efd50a4fad87674-full.jpg',
        },
    ];

    constructor() {}

    ngOnInit() {
        this.activePreview = this.labelledFrame[0].imageURL;
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

            this.activeFrame > this.labelledFrame.length
                ? (this.activePreview = '')
                : (this.activePreview = this.labelledFrame[this.activeFrame].imageURL);
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
        index > this.labelledFrame.length
            ? (this.activePreview = '')
            : (this.activePreview = this.labelledFrame[index].imageURL);
    };

    @HostListener('window:keydown', ['$event'])
    onHoldKey({ shiftKey }: KeyboardEvent) {
        document.getElementById('videoTimeline')?.focus();
        if (shiftKey) {
            this.verticalScroll = true;
        }
    }

    @HostListener('window:keyup', ['$event'])
    onReleaseKey() {
        this.verticalScroll = false;
    }

    clickPlay = async () => {
        this.isPlayingFrame = true;
        this.totalFrameArr.forEach((element, index) => {
            setTimeout(() => {
                this.onClickVideoTImeline(index);
            }, 100 * index);
        });
        this.isPlayingFrame = false;
    };

    playFrame = (index: number) => {};
}
