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

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export type ZoomState = {
    scale: number;
    factor: number;
    max_scale: number;
};

const initialState: ZoomState = {
    scale: 1,
    factor: 0.05,
    max_scale: 4,
};

export type WheelDelta = {
    wheelDelta: number;
};

@Injectable({
    providedIn: 'any',
})
export class ZoomService {
    private zoomSubject = new BehaviorSubject<ZoomState>(initialState);
    public zoom$ = this.zoomSubject.asObservable();

    constructor() {}

    setState = (newZoomState: Partial<ZoomState>): void => {
        newZoomState
            ? this.zoomSubject.next({ ...initialState, ...newZoomState })
            : this.zoomSubject.next(initialState);
    };

    resetZoomScale() {
        this.zoomSubject.next(initialState);
    }

    calculateZoomScale(event: WheelEvent & WheelDelta, zoom: ZoomState, canvas: HTMLCanvasElement) {
        let { scale } = zoom;
        const { factor, max_scale } = zoom;
        // let delta = event.deltaY ? event.deltaY / 40 : 0;
        // const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.detail));
        let delta = event.wheelDelta;
        if (delta === undefined) {
            // we are on firefox
            delta = event.detail;
        }
        delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency
        const { scrollLeft, scrollTop } = canvas;
        const offset = { x: scrollLeft, y: scrollTop };
        const image_loc = {
            x: event.pageX + offset.x,
            y: event.pageY + offset.y,
        };
        const zoom_point = { x: image_loc.x / scale, y: image_loc.y / scale };

        // apply zoom
        scale += delta * factor * scale;
        scale = Math.max(1, Math.min(max_scale, scale));

        const zoom_point_new = { x: zoom_point.x * scale, y: zoom_point.y * scale };

        const newScroll = {
            x: zoom_point_new.x - event.pageX,
            y: zoom_point_new.y - event.pageY,
        };

        return {
            ...newScroll,
            scale,
        };
    }

    validateZoomScale(
        {
            canvas: {
                style: { transform },
            },
        }: CanvasRenderingContext2D,
        scale: number,
    ) {
        return transform === `scale(${scale}, ${scale})` ? false : true;
    }
}
