/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'any',
})
export class BoundingBoxCanvasService {
    locA: { x: number; y: number } = {
        x: 0,
        y: 0,
    };
    locB: { x: number; y: number } = {
        x: 0,
        y: 0,
    };

    getMousePosA(event: MouseEvent, context: CanvasRenderingContext2D) {
        const rect = context.canvas.getBoundingClientRect();
        this.locA = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    getMousePosB(event: MouseEvent, context: CanvasRenderingContext2D) {
        const rect = context.canvas.getBoundingClientRect();
        this.locB = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    drawBoundingBox = (context: CanvasRenderingContext2D) => {
        context.fillStyle = '#000000';
        context.rect(this.locA.x, this.locA.y, this.locB.x - this.locA.x, this.locB.y - this.locA.y);
        context.strokeStyle = 'rgba(0,255,0,1.0)';
        context.lineWidth = 2;
        context.stroke();
    };
}
