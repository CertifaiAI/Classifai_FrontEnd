/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { clone } from 'lodash-es';
import { BboxMetadata, Boundingbox, xyCoordinate } from '../video-labelling.modal';
@Injectable({
    providedIn: 'any',
})
export class BoundingBoxCanvasService {
    private globalXY: xyCoordinate = { x: 0, y: 0 };
    private panXY: xyCoordinate = { x: 0, y: 0 };

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

    public mouseClickWithinPointPath(
        { img_x, img_y, img_w, img_h }: BboxMetadata,
        { offsetX, offsetY }: MouseEvent,
    ): boolean {
        try {
            return offsetX > img_x && offsetX < img_x + img_w && offsetY > img_y && offsetY < img_y + img_h
                ? true
                : false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    public setPanXY(newX: number, newY: number): boolean {
        try {
            return newX && newY ? ((this.panXY.x = newX), (this.panXY.y = newY), true) : false;
        } catch (err) {
            console.log('ObjectDetection setPanXY(newX: number, newY: number):boolean', err.name + ': ', err.message);
            return false;
        }
    }

    public calScaleTofitScreen(
        imgW: number,
        imgH: number,
        canvasW: number,
        canvasH: number,
    ): {
        factor: number;
        newX: number;
        newY: number;
    } {
        try {
            const obj = { factor: -1, newX: -1, newY: -1 };
            obj.factor = Math.min(canvasW / imgW, canvasH / imgH);
            obj.factor = obj.factor - obj.factor * 0.05;
            obj.newX = canvasW / 2 - (imgW / 2) * obj.factor;
            obj.newY = canvasH / 2 - (imgH / 2) * obj.factor;
            return obj;
        } catch (err) {
            return { factor: -1, newX: -1, newY: -1 };
        }
    }

    public scaleAllBoxes(
        scalefactor: number,
        boxes: Boundingbox[],
        imgX: number,
        imgY: number,
        callback?: (arg: boolean) => void,
    ) {
        try {
            for (const box of boxes) {
                const newW: number = (box.x2 - box.x1) * scalefactor;
                const newH: number = (box.y2 - box.y1) * scalefactor;
                const X1: number = box.distancetoImg.x * scalefactor + imgX;
                const Y1: number = box.distancetoImg.y * scalefactor + imgY;
                const X2: number = X1 + newW;
                const Y2: number = Y1 + newH;
                box.x1 = clone(X1);
                box.y1 = clone(Y1);
                box.x2 = clone(X2);
                box.y2 = clone(Y2);
                const newdistancex: number = box.x1 - imgX;
                const newdistanceY: number = box.y1 - imgY;
                box.distancetoImg.x = clone(newdistancex);
                box.distancetoImg.y = clone(newdistanceY);
            }
            callback && callback(true);
        } catch (err) {
            console.log(
                'ObjectDetection scaleAllBoxes(scalefactor: number,boxes:Boundingbox[],imgX:number,imgY:number)',
                err.name + ': ',
                err.message,
            );
        }
    }

    public setGlobalXY(newX: number, newY: number): boolean {
        try {
            return newX && newY ? ((this.globalXY.x = newX), (this.globalXY.y = newY), true) : false;
        } catch (err) {
            console.log(
                'ObjectDetection SetGlobalXY(newX: number, newY: number):boolean',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    public moveAllBbox(boundingBoxes: Boundingbox[], imgX: number, imgY: number, callback?: (arg: boolean) => void) {
        try {
            for (const boundingBox of boundingBoxes) {
                const temRectWidth: number = boundingBox.x2 - boundingBox.x1;
                const temRectHeight: number = boundingBox.y2 - boundingBox.y1;
                boundingBox.x1 = clone(imgX + boundingBox.distancetoImg.x);
                boundingBox.y1 = clone(imgY + boundingBox.distancetoImg.y);
                boundingBox.x2 = clone(boundingBox.x1 + temRectWidth);
                boundingBox.y2 = clone(boundingBox.y1 + temRectHeight);
            }
            callback && callback(true);
        } catch (err) {}
    }
}
