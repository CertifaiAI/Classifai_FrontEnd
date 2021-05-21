import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LabelledFrame } from './video-timeline.model';

@Component({
    selector: 'video-timeline',
    templateUrl: './video-timeline.component.html',
    styleUrls: ['./video-timeline.component.scss'],
})
export class VideoTimelineComponent implements OnInit, OnChanges {
    // occupiedSpace = [...Array(27)];
    occupiedSpace = [];
    @Input() _totalFrame = 100;
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    totalFrameArr: number[] = [...Array(this._totalFrame)];
    activeFrame = 0;

    labelledFrame: LabelledFrame[] = [
        {
            frame: [5, 6, 7, 8],
            object: 'Person 1',
        },
        {
            frame: [1, 2, 3, 4],
            object: 'Person 2',
        },
    ];

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._totalFrame.currentValue) {
            this.totalFrameArr = [...Array(changes._totalFrame.currentValue as number)];
        }
    }

    onScroll = ({ deltaY }: WheelEvent) => {
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

    onClickVideoTImeline = (index: number, object: any) => {
        console.log('CLICKED FRAME', index, 'OBJECT', object);
        this.activeFrame = index;
    };
}
