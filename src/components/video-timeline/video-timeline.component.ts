/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
    selector: 'video-timeline',
    templateUrl: './video-timeline.component.html',
    styleUrls: ['./video-timeline.component.scss'],
})
export class VideoTimelineComponent implements OnInit, OnChanges {
    occupiedSpace = [...Array(27)];
    @Input() _totalFrame = 0;
    @ViewChild('videoTimelineRef') _videoTimelineRef!: ElementRef<HTMLDivElement>;
    totalFrameArr: number[] = [];
    activeFrame = 0;
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

    displayFrameIndicator = (index: number): string => {
        let className = '';
        className += index === 0 && ' figure ';
        className += this.activeFrame === index && ' cursor row';
        className += ' timelineCell clickable';
        return className;
    };

    onClickVideoTImeline = (index: number) => {
        this.activeFrame = index;
    };
}
