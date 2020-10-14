import { Injectable } from '@angular/core';
import { xyCoordinate, BoundingBox, Metadata } from '../../classes/CustomType';
import { utils } from '../../classes/utils';

@Injectable({
    providedIn: 'any',
})
export class BoundingBoxService {
    private globalXY: xyCoordinate = { x: 0, y: 0 };
    private panXY: xyCoordinate = { x: 0, y: 0 };
    private currentClickedBox: { box: number; pos: string } = {
        box: -1,
        pos: 'o',
    };
    private lineOffset: number = 3;
    private anchrSize: number = 2.5;
    private utility: utils = new utils();
    private currentDrawing: { x1: number; x2: number; y1: number; y2: number } = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
    };
    private tmpbox!: BoundingBox | null;
    private currentSelectedBndBox: number = -1;
    constructor() {}

    public getdiffXY(offsetX: number, offsetY: number): { diffX: number; diffY: number } {
        try {
            let rtobj: { diffX: number; diffY: number } = { diffX: 0, diffY: 0 };
            if (offsetX !== null && offsetX !== undefined && offsetY !== null && offsetY !== undefined) {
                rtobj.diffX = this.globalXY.x + (offsetX - this.panXY.x);
                rtobj.diffY = this.globalXY.y + (offsetY - this.panXY.y);
            }
            return rtobj;
        } catch (err) {
            console.log(
                'ObjectDetection GetdiffXY(offsetX: number,offsetY: number): { diffX: number; diffY: number }',
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

    public moveAllBbox(bbox: BoundingBox[], imgX: number, imgY: number) {
        try {
            for (var i = 0; i < bbox.length; ++i) {
                let temRectWidth: number = bbox[i].x2 - bbox[i].x1;
                let temRectHeight: number = bbox[i].y2 - bbox[i].y1;
                bbox[i].x1 = this.utility.deepCloneVariable(imgX + bbox[i].distancetoImg.x);
                bbox[i].y1 = this.utility.deepCloneVariable(imgY + bbox[i].distancetoImg.y);
                bbox[i].x2 = this.utility.deepCloneVariable(bbox[i].x1 + temRectWidth);
                bbox[i].y2 = this.utility.deepCloneVariable(bbox[i].y1 + temRectHeight);
            }
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
            let obj = { factor: -1, newX: -1, newY: -1 };
            obj.factor = Math.min(canvasW / imgW, canvasH / imgH);
            obj.factor = obj.factor - obj.factor * 0.05;
            obj.newX = canvasW / 2 - (imgW / 2) * obj.factor;
            obj.newY = canvasH / 2 - (imgH / 2) * obj.factor;
            return obj;
        } catch (err) {
            return { factor: -1, newX: -1, newY: -1 };
        }
    }

    private mouseMoveBox(mouseX: number, mouseY: number, currMeta: Metadata): void {
        try {
            let tmpOffsetX: number = mouseX - this.currentDrawing.x1;
            let tmpOffsetY: number = mouseY - this.currentDrawing.y1;
            if (
                this.moveBoxWithinPointPath(
                    currMeta.img_x,
                    currMeta.img_y,
                    currMeta.img_w,
                    currMeta.img_h,
                    tmpOffsetX,
                    tmpOffsetY,
                    currMeta.bnd_box[this.currentSelectedBndBox],
                )
            ) {
                this.setCurrentX2Y2(mouseX, mouseY);
                let xOffset: number = this.currentDrawing.x2 - this.currentDrawing.x1;
                let yOffset: number = this.currentDrawing.y2 - this.currentDrawing.y1;
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

    public setCurrentSelectedbBox(newNUM: number): void {
        try {
            newNUM ? (this.currentSelectedBndBox = newNUM) : {};
        } catch (err) {
            console.log('ObjectDetection setCurrentSelectedbBox(newNUM:number):void', err.name + ': ', err.message);
        }
    }

    public mouseUpDrawEnable(currMeta: Metadata): number {
        try {
            let drawcode: number = -1;
            console.log(this.tmpbox);
            if (this.currentClickedBox.box === -1 && this.tmpbox !== null) {
                currMeta.bnd_box.push(this.tmpbox);
                this.currentSelectedBndBox = currMeta.bnd_box.length - 1;
                currMeta.bnd_box[this.currentSelectedBndBox].label = 'default';
                drawcode = 1;
            } else {
                if (currMeta.bnd_box[this.currentSelectedBndBox].x1 > currMeta.bnd_box[this.currentSelectedBndBox].x2) {
                    let previousX1: number = this.utility.deepCloneVariable(
                        currMeta.bnd_box[this.currentSelectedBndBox].x1,
                    );
                    currMeta.bnd_box[this.currentSelectedBndBox].x1 = this.utility.deepCloneVariable(
                        currMeta.bnd_box[this.currentSelectedBndBox].x2,
                    );
                    currMeta.bnd_box[this.currentSelectedBndBox].x2 = previousX1;
                }
                if (currMeta.bnd_box[this.currentSelectedBndBox].y1 > currMeta.bnd_box[this.currentSelectedBndBox].y2) {
                    let previousY1: number = this.utility.deepCloneVariable(
                        currMeta.bnd_box[this.currentSelectedBndBox].y1,
                    );
                    currMeta.bnd_box[this.currentSelectedBndBox].y1 = this.utility.deepCloneVariable(
                        currMeta.bnd_box[this.currentSelectedBndBox].y2,
                    );
                    currMeta.bnd_box[this.currentSelectedBndBox].y2 = previousY1;
                }
                drawcode = 0;
            }
            this.currentClickedBox = { box: -1, pos: 'o' };
            this.setCurrentX1Y1(0, 0);
            this.setCurrentX2Y2(0, 0);
            this.tmpbox = null;
            return drawcode;
        } catch (err) {
            console.log('ObjectDetection MouseUpDrawEnable(CurrMeta: Metadata): number', err.name + ': ', err.message);
            return -1;
        }
    }

    public panRectangle(bbox: BoundingBox[], img_X: number, img_Y: number) {
        try {
            for (let i = 0; i < bbox.length; ++i) {
                let temrectW: number = bbox[i].x2 - bbox[i].x1;
                let temrectH: number = bbox[i].y2 - bbox[i].y1;
                bbox[i].x1 = img_X + bbox[i].distancetoImg.x;
                bbox[i].y1 = img_Y + bbox[i].distancetoImg.y;
                bbox[i].x2 = bbox[i].x1 + temrectW;
                bbox[i].y2 = bbox[i].y1 + temrectH;
            }
        } catch (err) {
            console.log(
                'ObjectDetection panRectangle(bbox:Boundingbox[], img_X:number, img_Y:number)',
                err.name + ': ',
                err.message,
            );
        }
    }

    public scaleAllBoxes(scalefactor: number, boxes: BoundingBox[], imgX: number, imgY: number) {
        try {
            for (let i = 0; i < boxes.length; ++i) {
                console.log(boxes[i]);
                let newW: number = (boxes[i].x2 - boxes[i].x1) * scalefactor;
                let newH: number = (boxes[i].y2 - boxes[i].y1) * scalefactor;
                let X1: number = boxes[i].distancetoImg.x * scalefactor + imgX;
                let Y1: number = boxes[i].distancetoImg.y * scalefactor + imgY;
                let X2: number = X1 + newW;
                let Y2: number = Y1 + newH;
                boxes[i].x1 = this.utility.deepCloneVariable(X1);
                boxes[i].y1 = this.utility.deepCloneVariable(Y1);
                boxes[i].x2 = this.utility.deepCloneVariable(X2);
                boxes[i].y2 = this.utility.deepCloneVariable(Y2);
                let newdistancex: number = boxes[i].x1 - imgX;
                let newdistanceY: number = boxes[i].y1 - imgY;
                boxes[i].distancetoImg.x = this.utility.deepCloneVariable(newdistancex);
                boxes[i].distancetoImg.y = this.utility.deepCloneVariable(newdistanceY);
            }
        } catch (err) {
            console.log(
                'ObjectDetection scaleAllBoxes(scalefactor: number,boxes:Boundingbox[],imgX:number,imgY:number)',
                err.name + ': ',
                err.message,
            );
        }
    }

    public mouseMoveDrawEnable(mouseX: number, mouseY: number, selectedMeta: Metadata): void {
        try {
            if (this.currentClickedBox.box === -1) {
                this.setCurrentX2Y2(mouseX, mouseY);
            } else {
                this.mouseMoveBox(mouseX, mouseY, selectedMeta);
            }
        } catch (err) {
            console.log(
                'ObjectDetection MouseMoveDrawEnable(MouseX: number,MouseY: number,SelectedMeta: Metadata): void',
                err.name + ': ',
                err.message,
            );
        }
    }

    public mouseDownDrawEnable(mouseX: number, mouseY: number, bBox: BoundingBox[]): number {
        try {
            this.getCurrentClickBox(mouseX, mouseY, bBox);
            this.setCurrentX1Y1(mouseX, mouseY);
            this.setCurrentX2Y2(mouseX, mouseY);
            if (this.currentClickedBox.box !== -1) {
                this.currentSelectedBndBox = this.currentClickedBox.box;
            } else {
                this.currentSelectedBndBox = -1;
            }
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
            if (newX !== undefined && newX !== null && newY !== undefined && newY !== null) {
                this.panXY.x = newX;
                this.panXY.y = newY;
                return true;
            }
            return false;
        } catch (err) {
            console.log('ObjectDetection setPanXY(newX: number, newY: number):boolean', err.name + ': ', err.message);
            return false;
        }
    }

    public setGlobalXY(newX: number, newY: number): boolean {
        try {
            if (newX !== undefined && newX !== null && newY !== undefined && newY !== null) {
                this.globalXY.x = newX;
                this.globalXY.y = newY;
                return true;
            }
            return false;
        } catch (err) {
            console.log(
                'ObjectDetection SetGlobalXY(newX: number, newY: number):boolean',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    public moveBoxWithinPointPath(
        imgx: number,
        imgy: number,
        imgw: number,
        imgh: number,
        addx: number,
        addy: number,
        box: BoundingBox,
    ): Boolean {
        try {
            if (
                box.x1 + addx < imgx ||
                box.x2 + addx > imgx + imgw ||
                box.y1 + addy < imgy ||
                box.y2 + addy > imgy + imgh
            ) {
                return false;
            }
            return true;
        } catch (err) {
            console.log(
                'ObjectDetection isWithinPointPath(imgx:number, imgy:number, imgw:number, imgh:number, addx:number, addy:number, box:Boundingbox):Boolean',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    public mouseClickWithinPointPath(
        imgx: number,
        imgy: number,
        imgw: number,
        imgh: number,
        coorX: number,
        coorY: number,
    ): boolean {
        try {
            if (coorX > imgx && coorX < imgx + imgw && coorY > imgy && coorY < imgy + imgh) {
                return true;
            }
            return false;
        } catch (err) {
            console.log(
                'ObjectDetection mouseClickWithinPointPath(imgx:number, imgy:number, imgw:number, imgh:number, coorX:number,):boolean',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    public drawAllBoxOn(boundbox: BoundingBox[], context: CanvasRenderingContext2D | null) {
        try {
            if (boundbox.length > 0) {
                for (var i = 0; i < boundbox.length; i++) {
                    if (i === this.currentClickedBox.box || i === this.currentSelectedBndBox) {
                        boundbox[i].color = 'rgba(0,255,0,1.0)';
                        boundbox[i].lineWidth = 2;
                        this.drawEachBoxOn(boundbox[i], context, true);
                    } else {
                        boundbox[i].color = 'rgba(255,255,0,0.8)';
                        boundbox[i].lineWidth = 1;
                        this.drawEachBoxOn(boundbox[i], context, false);
                    }
                }
            }
            if (this.currentClickedBox.box === -1 && this.currentSelectedBndBox === -1) {
                for (var i = 0; i < boundbox.length; i++) {
                    boundbox[i].color = 'rgba(255,255,0,0.8)';
                    this.drawEachBoxOn(boundbox[i], context, false);
                }
                this.tmpbox = this.generateNewBox(
                    this.currentDrawing.x1,
                    this.currentDrawing.x2,
                    this.currentDrawing.y1,
                    this.currentDrawing.y2,
                );
                if (this.tmpbox != null) {
                    this.drawEachBoxOn(this.tmpbox, context, true);
                }
            }
        } catch (err) {
            console.log('redraw(boundbox) ----> ', err.name + ': ', err.message);
        }
    }

    private drawEachBoxOn(box: BoundingBox, context: CanvasRenderingContext2D | null, isSelected: boolean): void {
        try {
            let xCenter = box.x1 + (box.x2 - box.x1) / 2;
            let yCenter = box.y1 + (box.y2 - box.y1) / 2;
            context!.strokeStyle = box.color;
            context!.fillStyle = box.color;
            context!.beginPath();
            context!.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
            context!.lineWidth = box.lineWidth;
            context!.stroke();
            if (isSelected) {
                context!.beginPath();
                context!.fillRect(
                    box.x1 - this.anchrSize,
                    box.y1 - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    box.x1 - this.anchrSize,
                    yCenter - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    box.x1 - this.anchrSize,
                    box.y2 - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    xCenter - this.anchrSize,
                    box.y1 - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    xCenter - this.anchrSize,
                    yCenter - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    xCenter - this.anchrSize,
                    box.y2 - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    box.x2 - this.anchrSize,
                    box.y1 - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    box.x2 - this.anchrSize,
                    yCenter - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
                context!.fillRect(
                    box.x2 - this.anchrSize,
                    box.y2 - this.anchrSize,
                    2 * this.anchrSize,
                    2 * this.anchrSize,
                );
            }
        } catch (err) {
            console.log(
                'ObjectDetection drawEachBoxOn(box:Boundingbox, context:CanvasRenderingContext2D, isSelected:boolean):void',
                err.name + ': ',
                err.message,
            );
        }
    }

    private generateNewBox(x1: number, x2: number, y1: number, y2: number): BoundingBox | null {
        try {
            let boxX1: number = x1 < x2 ? x1 : x2;
            let boxY1: number = y1 < y2 ? y1 : y2;
            let boxX2: number = x1 > x2 ? x1 : x2;
            let boxY2: number = y1 > y2 ? y1 : y2;
            if (boxX2 - boxX1 > this.lineOffset && boxY2 - boxY1 > this.lineOffset) {
                let newID: number = this.utility.generateUniquesID();
                return {
                    x1: boxX1,
                    y1: boxY1,
                    x2: boxX2,
                    y2: boxY2,
                    lineWidth: 2,
                    color: 'rgba(0,255,0,1.0)',
                    distancetoImg: { x: 0, y: 0 },
                    label: 'default',
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

    public getBBoxDistfromImg(bbox: BoundingBox[], imgX: number, imgY: number) {
        try {
            for (var i = 0; i < bbox.length; ++i) {
                let DistX: number = bbox[i].x1 - imgX;
                let DistY: number = bbox[i].y1 - imgY;
                bbox[i].distancetoImg.x = this.utility.deepCloneVariable(DistX);
                bbox[i].distancetoImg.y = this.utility.deepCloneVariable(DistY);
            }
        } catch (err) {
            console.log(
                'ObjectDetection GetBBoxDistfromImg(bbox:Boundingbox[],imgX:number,imgY:number)',
                err.name + ': ',
                err.message,
            );
        }
    }

    public getCurrentClickBox(mouseX: number, mouseY: number, box: BoundingBox[]): { box: number; pos: string } {
        try {
            this.currentClickedBox = this.mouseClickOnBoxeses(mouseX, mouseY, box);
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

    private mouseClickOnBoxeses(mouseX: number, mouseY: number, box: BoundingBox[]): { box: number; pos: string } {
        try {
            for (var i = 0; i < box.length; ++i) {
                let xCenter: number = box[i].x1 + (box[i].x2 - box[i].x1) / 2;
                let yCenter: number = box[i].y1 + (box[i].y2 - box[i].y1) / 2;
                if (box[i].x1 - this.lineOffset < mouseX && mouseX < box[i].x1 + this.lineOffset) {
                    if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y1 + this.lineOffset) {
                        return { box: i, pos: 'tl' };
                    } else if (box[i].y2 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
                        return { box: i, pos: 'bl' };
                    } else if (yCenter - this.lineOffset < mouseY && mouseY < yCenter + this.lineOffset) {
                        return { box: i, pos: 'l' };
                    }
                } else if (box[i].x2 - this.lineOffset < mouseX && mouseX < box[i].x2 + this.lineOffset) {
                    if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y1 + this.lineOffset) {
                        return { box: i, pos: 'tr' };
                    } else if (box[i].y2 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
                        return { box: i, pos: 'br' };
                    } else if (yCenter - this.lineOffset < mouseY && mouseY < yCenter + this.lineOffset) {
                        return { box: i, pos: 'r' };
                    }
                } else if (xCenter - this.lineOffset < mouseX && mouseX < xCenter + this.lineOffset) {
                    if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y1 + this.lineOffset) {
                        return { box: i, pos: 't' };
                    } else if (box[i].y2 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
                        return { box: i, pos: 'b' };
                    } else if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
                        return { box: i, pos: 'i' };
                    }
                } else if (box[i].x1 - this.lineOffset < mouseX && mouseX < box[i].x2 + this.lineOffset) {
                    if (box[i].y1 - this.lineOffset < mouseY && mouseY < box[i].y2 + this.lineOffset) {
                        return { box: i, pos: 'i' };
                    }
                }
            }
            return { box: -1, pos: 'o' };
        } catch (err) {
            console.log(
                'ObjectDetection mouseClickonBoxeses(MouseX:number, MouseY:number, box:Boundingbox[]):{box:number,pos:string}',
                err.name + ': ',
                err.message,
            );
            return { box: -1, pos: 'o' };
        }
    }
}
