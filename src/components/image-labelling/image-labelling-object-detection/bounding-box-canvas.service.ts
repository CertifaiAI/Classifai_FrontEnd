/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { clone } from 'lodash-es';
import {
    BboxMetadata,
    Boundingbox,
    DiffXY,
    Direction,
    LabelInfo,
    xyCoordinate,
} from 'shared/types/image-labelling/image-labelling.model';
import { Utils } from 'util/utils';

@Injectable({
    providedIn: 'any',
})
export class BoundingBoxCanvasService {
    private globalXY: xyCoordinate = { x: 0, y: 0 };
    private panXY: xyCoordinate = { x: 0, y: 0 };
    private currentClickedBox: { box: number; pos: string } = {
        box: -1,
        pos: 'o',
    };
    private lineOffset: number = 3;
    private anchrSize: number = 2.5;
    private currentDrawing: { x1: number; x2: number; y1: number; y2: number } = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
    };
    private tmpbox!: Boundingbox | null;
    private currentSelectedBndBox: number = -1;
    private util: Utils = new Utils();

    public getDiffXY({ offsetX, offsetY }: MouseEvent): DiffXY {
        try {
            const rtobj: DiffXY = { diffX: 0, diffY: 0 };
            rtobj.diffX = this.globalXY.x + (offsetX - this.panXY.x);
            rtobj.diffY = this.globalXY.y + (offsetY - this.panXY.y);

            return rtobj;
        } catch (err) {
            console.log(
                'ObjectDetection getDiffXY(offsetX: number,offsetY: number): { diffX: number; diffY: number }',
                err.name + ': ',
                err.message,
            );
            return { diffX: -1, diffY: -1 };
        }
    }

    public setCurrentX1Y1(mouseX: number, mouseY: number): void {
        try {
            if (mouseX !== null && mouseY !== null && mouseX !== undefined && mouseY !== undefined) {
                this.currentDrawing.x1 = mouseX;
                this.currentDrawing.y1 = mouseY;
            }
        } catch (err) {
            console.log(
                'ObjectDetection setCurrentX1Y1(MouseX:number, MouseY:number):void',
                err.name + ': ',
                err.message,
            );
        }
    }

    public setCurrentX2Y2(mouseX: number, mouseY: number): void {
        try {
            if (mouseX !== null && mouseY !== null && mouseX !== undefined && mouseY !== undefined) {
                this.currentDrawing.x2 = mouseX;
                this.currentDrawing.y2 = mouseY;
            }
        } catch (err) {
            console.log(
                'ObjectDetection setCurrentX2Y2(MouseX:number, MouseY:number):void',
                err.name + ': ',
                err.message,
            );
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

    public deleteSingleBox(bbox: Boundingbox[], idx: number, callback: (arg: boolean) => void) {
        try {
            bbox.splice(idx, 1);
            this.currentSelectedBndBox = -1;
            this.currentClickedBox = { box: -1, pos: 'o' };
            callback(true);
        } catch (err) {}
    }

    public keyboardMoveBox(
        direction: Direction,
        bBox: Boundingbox,
        { img_w, img_h, img_x, img_y }: BboxMetadata,
        callback: (arg: boolean) => void,
    ) {
        try {
            switch (direction) {
                case 'up':
                    this.moveBoxWithinPointPath(img_x, img_y, img_w, img_h, 0, -3, bBox) &&
                        this.moveBbox(0, 0, -3, -3, bBox);
                    break;
                case 'down':
                    this.moveBoxWithinPointPath(img_x, img_y, img_w, img_h, 0, 3, bBox) &&
                        this.moveBbox(0, 0, 3, 3, bBox);
                    break;
                case 'left':
                    this.moveBoxWithinPointPath(img_x, img_y, img_w, img_h, -3, 0, bBox) &&
                        this.moveBbox(-3, -3, 0, 0, bBox);
                    break;
                case 'right':
                    this.moveBoxWithinPointPath(img_x, img_y, img_w, img_h, 3, 0, bBox) &&
                        this.moveBbox(3, 3, 0, 0, bBox);
                    break;
            }
            callback(true);
        } catch (err) {}
    }

    moveBbox(x1: number, x2: number, y1: number, y2: number, bBox: Boundingbox) {
        bBox.x1 += x1;
        bBox.x2 += x2;
        bBox.y1 += y1;
        bBox.y2 += y2;
    }

    public moveBoxWithinPointPath(
        imgX: number,
        imgY: number,
        imgW: number,
        imgH: number,
        addX: number,
        addY: number,
        box: Boundingbox,
    ): boolean {
        try {
            return box.x1 + addX < imgX ||
                box.x2 + addX > imgX + imgW ||
                box.y1 + addY < imgY ||
                box.y2 + addY > imgY + imgH
                ? false
                : true;
        } catch (err) {
            console.log(
                'ObjectDetection isWithinPointPath(imgx:number, imgy:number, imgw:number, imgh:number, addx:number, addy:number, box:Boundingbox):Boolean',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    private mouseMoveBox(mouseX: number, mouseY: number, currMeta: BboxMetadata): void {
        try {
            const tmpOffsetX: number = mouseX - this.currentDrawing.x1;
            const tmpOffsetY: number = mouseY - this.currentDrawing.y1;
            const isWithinPointPath = this.moveBoxWithinPointPath(
                currMeta.img_x,
                currMeta.img_y,
                currMeta.img_w,
                currMeta.img_h,
                tmpOffsetX,
                tmpOffsetY,
                currMeta.bnd_box[this.currentSelectedBndBox],
            );
            if (isWithinPointPath) {
                this.setCurrentX2Y2(mouseX, mouseY);
                const xOffset: number = this.currentDrawing.x2 - this.currentDrawing.x1;
                const yOffset: number = this.currentDrawing.y2 - this.currentDrawing.y1;
                this.setCurrentX1Y1(this.currentDrawing.x2, this.currentDrawing.y2);
                if (
                    this.currentClickedBox.pos === 'i' ||
                    this.currentClickedBox.pos === 'tl' ||
                    this.currentClickedBox.pos === 'l' ||
                    this.currentClickedBox.pos === 'bl'
                ) {
                    currMeta.bnd_box[this.currentSelectedBndBox].x1 += xOffset;
                }
                if (
                    this.currentClickedBox.pos === 'i' ||
                    this.currentClickedBox.pos === 'tl' ||
                    this.currentClickedBox.pos === 't' ||
                    this.currentClickedBox.pos === 'tr'
                ) {
                    currMeta.bnd_box[this.currentSelectedBndBox].y1 += yOffset;
                }
                if (
                    this.currentClickedBox.pos === 'i' ||
                    this.currentClickedBox.pos === 'tr' ||
                    this.currentClickedBox.pos === 'r' ||
                    this.currentClickedBox.pos === 'br'
                ) {
                    currMeta.bnd_box[this.currentSelectedBndBox].x2 += xOffset;
                }
                if (
                    this.currentClickedBox.pos === 'i' ||
                    this.currentClickedBox.pos === 'bl' ||
                    this.currentClickedBox.pos === 'b' ||
                    this.currentClickedBox.pos === 'br'
                ) {
                    currMeta.bnd_box[this.currentSelectedBndBox].y2 += yOffset;
                }
            }
        } catch (err) {
            console.log(
                'ObjectDetection mouseMoveBox(MouseX:number, MouseY:number, CurrMeta:Metadata):void',
                err.name + ': ',
                err.message,
            );
        }
    }

    public getCurrentSelectedBox(): number {
        try {
            return this.currentSelectedBndBox;
        } catch {
            return -1;
        }
    }

    public setCurrentSelectedbBox(newNUM: number): void {
        try {
            this.currentSelectedBndBox = newNUM;
        } catch (err) {
            console.log('ObjectDetection setCurrentSelectedbBox(newNUM:number):void', err.name + ': ', err.message);
        }
    }

    public mouseUpDrawEnable(
        currMeta: BboxMetadata,
        labelList: LabelInfo[],
        callback: (arg: boolean) => void,
    ): { selBox: number; isNew: boolean } {
        try {
            const ret: { selBox: number; isNew: boolean } = { selBox: -1, isNew: false };
            if (this.currentClickedBox.box === -1 && this.tmpbox !== null) {
                currMeta.bnd_box.push(this.tmpbox);
                this.currentSelectedBndBox = currMeta.bnd_box.length - 1;
                currMeta.bnd_box[this.currentSelectedBndBox].label = labelList.length > 0 ? labelList[0].name : '';
                ret.isNew = true;
                ret.selBox = clone(this.currentSelectedBndBox);
            } else if (this.currentClickedBox.box > -1 && this.tmpbox) {
                if (currMeta.bnd_box[this.currentSelectedBndBox].x1 > currMeta.bnd_box[this.currentSelectedBndBox].x2) {
                    const previousX1: number = clone(currMeta.bnd_box[this.currentSelectedBndBox].x1);
                    currMeta.bnd_box[this.currentSelectedBndBox].x1 = clone(
                        currMeta.bnd_box[this.currentSelectedBndBox].x2,
                    );
                    currMeta.bnd_box[this.currentSelectedBndBox].x2 = previousX1;
                }
                if (currMeta.bnd_box[this.currentSelectedBndBox].y1 > currMeta.bnd_box[this.currentSelectedBndBox].y2) {
                    const previousY1: number = clone(currMeta.bnd_box[this.currentSelectedBndBox].y1);
                    currMeta.bnd_box[this.currentSelectedBndBox].y1 = clone(
                        currMeta.bnd_box[this.currentSelectedBndBox].y2,
                    );
                    currMeta.bnd_box[this.currentSelectedBndBox].y2 = previousY1;
                }
            }
            this.currentClickedBox = { box: -1, pos: 'o' };
            this.setCurrentX1Y1(0, 0);
            this.setCurrentX2Y2(0, 0);
            this.tmpbox = null;
            callback(true);
            return ret;
        } catch (err) {
            console.log('ObjectDetection MouseUpDrawEnable(CurrMeta: Metadata): number', err.name + ': ', err.message);
            return { selBox: -1, isNew: false };
        }
    }

    public panRectangle(boundingBoxes: Boundingbox[], imgX: number, imgY: number, callback: (arg: boolean) => void) {
        try {
            for (const boundingBox of boundingBoxes) {
                const temrectW: number = boundingBox.x2 - boundingBox.x1;
                const temrectH: number = boundingBox.y2 - boundingBox.y1;
                boundingBox.x1 = imgX + boundingBox.distancetoImg.x;
                boundingBox.y1 = imgY + boundingBox.distancetoImg.y;
                boundingBox.x2 = boundingBox.x1 + temrectW;
                boundingBox.y2 = boundingBox.y1 + temrectH;
            }
            callback(true);
        } catch (err) {
            console.log(
                'ObjectDetection panRectangle(bbox:Boundingbox[], img_X:number, img_Y:number)',
                err.name + ': ',
                err.message,
            );
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

    public mouseMoveDrawEnable(mouseX: number, mouseY: number, metadata: BboxMetadata): void {
        try {
            if (this.currentClickedBox.box === -1) {
                this.setCurrentX2Y2(mouseX, mouseY);
            } else {
                this.mouseMoveBox(mouseX, mouseY, metadata);
            }
        } catch (err) {
            console.log(
                'ObjectDetection MouseMoveDrawEnable(MouseX: number,MouseY: number,SelectedMeta: Metadata): void',
                err.name + ': ',
                err.message,
            );
        }
    }

    public mouseDownDrawEnable(mouseX: number, mouseY: number, bBox: Boundingbox[]): number {
        try {
            this.getCurrentClickBox(mouseX, mouseY, bBox);
            this.setCurrentX1Y1(mouseX, mouseY);
            this.setCurrentX2Y2(mouseX, mouseY);
            return this.currentClickedBox.box;
        } catch (err) {
            console.log(
                'ObjectDetection MouseDownDrawEnable(MouseX:number,MouseY:number,BBox:Boundingbox[]):number',
                err.name + ': ',
                err.message,
            );
            return -1;
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

    public changeLabel(bbox: Boundingbox, newLabel: string) {
        bbox && newLabel && (bbox.label = newLabel);
    }

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

    public drawAllBoxOn(
        labelList: LabelInfo[],
        boundingBoxes: Boundingbox[],
        context: CanvasRenderingContext2D | null,
    ) {
        try {
            if (boundingBoxes.length > 0) {
                for (const [i, boundingBox] of boundingBoxes.entries()) {
                    this.setEachBbox(
                        i === this.currentClickedBox.box || i === this.currentSelectedBndBox ? true : false,
                        labelList,
                        boundingBox,
                        context,
                    );
                }
            }
            if (this.currentClickedBox.box === -1 && this.currentSelectedBndBox === -1) {
                for (const boundingBox of boundingBoxes) {
                    boundingBox.color = `rgba(255,255,0,0.8)`;
                    this.drawEachBoxOn(labelList, boundingBox, context, false);
                }
                const { x1, x2, y1, y2 } = this.currentDrawing;
                this.tmpbox = this.generateNewBox(x1, x2, y1, y2);
                this.tmpbox && this.drawEachBoxOn(labelList, this.tmpbox, context, true);
            }
        } catch (err) {
            console.log('redraw(boundbox) ----> ', err.name + ': ', err.message);
        }
    }

    private setEachBbox(
        selected: boolean,
        labelList: LabelInfo[],
        boundingBox: Boundingbox,
        context: CanvasRenderingContext2D | null,
    ) {
        boundingBox.color = selected ? `rgba(0,255,0,1.0)` : `rgba(255,255,0,0.8)`;
        boundingBox.lineWidth = selected ? 2 : 1;
        this.drawEachBoxOn(labelList, boundingBox, context, selected ? true : false);
    }

    private drawEachBoxOn(
        labelList: LabelInfo[],
        box: Boundingbox,
        context: CanvasRenderingContext2D | null,
        isSelected: boolean,
    ): void {
        try {
            if (context) {
                const xCenter = box.x1 + (box.x2 - box.x1) / 2;
                const yCenter = box.y1 + (box.y2 - box.y1) / 2;
                context.strokeStyle = 'white';
                context.fillStyle = 'black';
                context.font = 'bold 12px Arial';
                if (box.label === '') {
                    context.strokeText('', box.x1 + 10, box.y1 + 15);
                    context.fillText('', box.x1 + 10, box.y1 + 15);
                } else if (!labelList.find((x) => x.name === box.label)) {
                    context.strokeText('Text', box.x1 + 10, box.y1 + 15);
                    context.fillText('Text', box.x1 + 10, box.y1 + 15);
                } else {
                    context.strokeText(box.label, box.x1 + 10, box.y1 + 15);
                    context.fillText(box.label, box.x1 + 10, box.y1 + 15);
                }
                context.strokeStyle = box.color;
                context.beginPath();
                context.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
                context.lineWidth = box.lineWidth;
                context.stroke();
                context.fillStyle = box.color;
                if (isSelected) {
                    context.beginPath();
                    context.fillRect(
                        box.x1 - this.anchrSize,
                        box.y1 - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        box.x1 - this.anchrSize,
                        yCenter - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        box.x1 - this.anchrSize,
                        box.y2 - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        xCenter - this.anchrSize,
                        box.y1 - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        xCenter - this.anchrSize,
                        yCenter - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        xCenter - this.anchrSize,
                        box.y2 - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        box.x2 - this.anchrSize,
                        box.y1 - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        box.x2 - this.anchrSize,
                        yCenter - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                    context.fillRect(
                        box.x2 - this.anchrSize,
                        box.y2 - this.anchrSize,
                        2 * this.anchrSize,
                        2 * this.anchrSize,
                    );
                }
            }
        } catch (err) {
            console.log(
                'ObjectDetection drawEachBoxOn(box:Boundingbox, context:CanvasRenderingContext2D, isSelected:boolean):void',
                err.name + ': ',
                err.message,
            );
        }
    }

    private generateNewBox(x1: number, x2: number, y1: number, y2: number): Boundingbox | null {
        try {
            const boxX1: number = x1 < x2 ? x1 : x2;
            const boxY1: number = y1 < y2 ? y1 : y2;
            const boxX2: number = x1 > x2 ? x1 : x2;
            const boxY2: number = y1 > y2 ? y1 : y2;
            if (boxX2 - boxX1 > this.lineOffset && boxY2 - boxY1 > this.lineOffset) {
                const newID: number = this.util.generateUniquesID();
                return {
                    x1: boxX1,
                    y1: boxY1,
                    x2: boxX2,
                    y2: boxY2,
                    lineWidth: 2,
                    color: 'rgba(0,255,0,1.0)',
                    distancetoImg: { x: 0, y: 0 },
                    label: '',
                    id: newID,
                };
            }
            return null;
        } catch (err) {
            console.log(
                'ObjectDetection GenerateNewBox(x1:number,x2:number,y1:number,y2:number):Boundingbox',
                err.name + ': ',
                err.message,
            );
            return null;
        }
    }

    public getBBoxDistfromImg(boundingBoxes: Boundingbox[], imgX: number, imgY: number) {
        try {
            for (const { x1, y1, distancetoImg } of boundingBoxes) {
                const distX: number = x1 - imgX;
                const distY: number = y1 - imgY;
                distancetoImg.x = clone(distX);
                distancetoImg.y = clone(distY);
            }
        } catch (err) {
            console.log(
                'ObjectDetection GetBBoxDistfromImg(bbox:Boundingbox[],imgX:number,imgY:number)',
                err.name + ': ',
                err.message,
            );
        }
    }

    public getCurrentClickBox(mouseX: number, mouseY: number, box: Boundingbox[]): { box: number; pos: string } {
        try {
            this.currentClickedBox = this.mouseClickOnBoxes(mouseX, mouseY, box);
            return this.currentClickedBox;
        } catch (err) {
            console.log(
                'ObjectDetection getCurrentClickBox(MouseX:number, MouseY:number, box:Boundingbox[]):{box:number,pos:string}',
                err.name + ': ',
                err.message,
            );
            return { box: -1, pos: 'o' };
        }
    }

    private mouseClickOnBoxes(mouseX: number, mouseY: number, box: Boundingbox[]): { box: number; pos: string } {
        try {
            for (let i = 0; i < box.length; ++i) {
                const xCenter: number = box[i].x1 + (box[i].x2 - box[i].x1) / 2;
                const yCenter: number = box[i].y1 + (box[i].y2 - box[i].y1) / 2;
                const pos = this.getPosition(mouseX, mouseY, box, xCenter, yCenter, i);
                if (pos !== '') {
                    return { box: i, pos };
                }
            }
            return { box: -1, pos: 'o' };
        } catch (err) {
            console.log(
                'ObjectDetection mouseClickOnBoxes(MouseX:number, MouseY:number, box:Boundingbox[]):{box:number,pos:string}',
                err.name + ': ',
                err.message,
            );
            return { box: -1, pos: 'o' };
        }
    }

    private getPosition(
        mouseX: number,
        mouseY: number,
        box: Boundingbox[],
        xCenter: number,
        yCenter: number,
        i: number,
    ) {
        let pos = '';
        const xPos = this.getXPos(mouseX, box, xCenter, i);
        switch (xPos) {
            case 'l':
                pos = this.getYLPos(mouseY, box, yCenter, i);
                break;
            case 'r':
                pos = this.getYRPos(mouseY, box, yCenter, i);
                break;
            case 'm':
                pos = this.getYMPos(mouseY, box, yCenter, i);
                break;
            case 'i':
                if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
                    pos = 'i';
                }
                break;
        }
        return pos;
    }

    private getXPos(mouseX: number, box: Boundingbox[], xCenter: number, i: number) {
        if (box[i].x1 - this.lineOffset < mouseX && mouseX < box[i].x1 + this.lineOffset) {
            return 'l';
        } else if (box[i].x2 - this.lineOffset < mouseX && mouseX < box[i].x2 + this.lineOffset) {
            return 'r';
        } else if (xCenter - this.lineOffset < mouseX && mouseX < xCenter + this.lineOffset) {
            return 'm';
        } else if (box[i].x1 - this.lineOffset < mouseX && mouseX < box[i].x2 + this.lineOffset) {
            return 'i';
        } else {
            return 'o';
        }
    }

    private getYLPos(mouseY: number, box: Boundingbox[], yCenter: number, i: number) {
        let pos = '';
        if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y1 + this.lineOffset) {
            pos = 'tl';
        } else if (box[i].y2 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
            pos = 'bl';
        } else if (yCenter - this.lineOffset < mouseY && mouseY < yCenter + this.lineOffset) {
            pos = 'l';
        }
        return pos;
    }

    private getYRPos(mouseY: number, box: Boundingbox[], yCenter: number, i: number) {
        let pos = '';

        if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y1 + this.lineOffset) {
            pos = 'tr';
        } else if (box[i].y2 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
            pos = 'br';
        } else if (yCenter - this.lineOffset < mouseY && mouseY < yCenter + this.lineOffset) {
            pos = 'r';
        }
        return pos;
    }

    private getYMPos(mouseY: number, box: Boundingbox[], yCenter: number, i: number) {
        let pos = '';
        if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y1 + this.lineOffset) {
            pos = 't';
        } else if (box[i].y2 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
            pos = 'b';
        } else if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
            pos = 'i';
        }
        return pos;
    }
}
