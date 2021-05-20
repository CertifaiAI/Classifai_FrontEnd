import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

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

    interval: number = 1;
    object1: number[] = [...Array(15)];
    object2: number[] = [10, 11, 12, 13];

    constructor() {}

    ngOnInit() {
        console.log(this.object1);
        console.log(this.object2);
    }

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
                ? (this.activeFrame += this.interval)
                : this.activeFrame
            : this.activeFrame !== 0
            ? (this.activeFrame -= this.interval)
            : this.activeFrame;
    };

    displayFrameIndicator = (index: number): string => {
        let className = '';
        index in this.object2.values() ? (className += ' figure ') : className;
        className += this.activeFrame === index && ' cursor row';
        className += ' timelineCell clickable';
        return className;
    };

    onClickVideoTImeline = (index: number) => {
        this.activeFrame = index;
    };
}
