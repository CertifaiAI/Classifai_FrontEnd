import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Utils } from '../../shared/type-casting/utils/utils';
import {
    Polygons,
    PolyMeta,
    Coordinate,
    xyCoordinate,
} from '../../layouts/image-labelling-layout/image-labelling-layout.model';

@Injectable({
    providedIn: 'any',
})
export class SegmentationCanvasService {
    private tmpPolygon!: Polygons | null;
    private radius: number = 3.5;
    private util: Utils = new Utils();
    private GlobalXY: xyCoordinate = { x: -1, y: -1 };
    private panXY: xyCoordinate = { x: 0, y: 0 };
    private isNewPoly: Boolean = false;
    // private CurrentSelectedImg = { uid: -1, idx: -1 };
    private distanceOffset: number = 8;
    private selectedPolygon: number = -1;
    private clickPoint: { polygonIndex: number; PointIndex: number } = { polygonIndex: -1, PointIndex: -1 };

    constructor() {}

    public whenMouseDownEvent(
        newX: number,
        newY: number,
        imgX: number,
        imgY: number,
        canvasW: number,
        canvasH: number,
        pol: PolyMeta,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        ctrldown: boolean,
        altdown: boolean,
    ): number {
        this.setGlobalXY(newX, newY);
        let polArea = this.findPolygonArea(newX, newY, pol);
        this.clickPoint = this.findClickPoint(newX, newY, pol);
        if (this.isNewPolygon() && ctrldown) {
            this.setPanXY(newX, newY);
        } else if ((this.tmpPolygon === null && this.selectedPolygon < 0) || altdown) {
            this.setpolygonslineWidth(pol, -1);
            this.selectedPolygon = -1;
            this.setNewpolygon(true);
            this.pushTmpPoint(newX, newY, imgX, imgY, pol.polygons.length);
        } else if (this.isNewPolygon()) {
            this.pushTmpPoint(newX, newY, imgX, imgY, pol.polygons.length);
            this.DrawNewPolygon(pol, img, context, canvasW, canvasH, false);
            this.DrawfromlastPoint(newX, newY, context);
        } else {
            this.setNewpolygon(false);
            this.selectedPolygon =
                this.findPolygonArea(newX, newY, pol) > -1
                    ? this.findPolygonArea(newX, newY, pol)
                    : this.findClickPoint(newX, newY, pol).polygonIndex;
            this.setpolygonslineWidth(pol, this.selectedPolygon);
        }
        return this.selectedPolygon;
    }

    public whenMouseMoveEvent(
        pol: PolyMeta,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        newX: number,
        newY: number,
        ctrldown: boolean,
        isMouseDown: boolean,
        redrawCallback: Function,
    ) {
        if (this.isNewPolygon() && ctrldown && isMouseDown) {
            var diffX = newX - this.getPanX();
            var diffY = newY - this.getPanY();
            if (pol) {
                pol.img_x = this.getGlobalX() + diffX;
                pol.img_y = this.getGlobalY() + diffY;
                this.panPolygons(pol, pol.img_x, pol.img_y, true);
                redrawCallback('pan');
            }
        } else if (this.isNewPolygon()) {
            this.DrawNewPolygon(pol, img, context, canvasW, canvasH, false);
            this.DrawfromlastPoint(newX, newY, context);
        } else if (this.selectedPolygon > -1 && isMouseDown) {
            this.MouseMovePolygon(newX, newY, pol, context, this.selectedPolygon, img, canvasW, canvasH);
        } else {
            this.setPolygonCoordinate(newX, newY, pol, this.clickPoint.polygonIndex, this.clickPoint.PointIndex);
            redrawCallback('draw');
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

    public getPanX() {
        return this.panXY.x;
    }

    public getPanY() {
        return this.panXY.y;
    }

    public setSelectedPolygon(index: number): void {
        index ? (this.selectedPolygon = index) : {};
    }

    public getSelectedPolygon(): number {
        return this.selectedPolygon;
    }

    public mouseClickWithinPointPath(
        imgX: number,
        imgY: number,
        imgW: number,
        imgH: number,
        coorX: number,
        coorY: number,
    ): boolean {
        return coorX > imgX && coorX < imgX + imgW && coorY > imgY && coorY < imgY + imgH ? true : false;
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

    public pushTmpPoint(mouseX: number, mouseY: number, imgX: number, imgY: number, len: number) {
        try {
            let distancetoX = mouseX - imgX;
            let distancetoY = mouseY - imgY;
            if (this.tmpPolygon !== null && this.tmpPolygon !== undefined) {
                let lastX: number = this.tmpPolygon.coorPt[this.tmpPolygon.coorPt.length - 1].x;
                let lastY: number = this.tmpPolygon.coorPt[this.tmpPolygon.coorPt.length - 1].y;
                if (this.calculatePointDistance(lastX, lastY, mouseX, mouseY)! > this.distanceOffset) {
                    this.tmpPolygon.coorPt.push({
                        x: mouseX,
                        y: mouseY,
                        distancetoImg: { x: distancetoX, y: distancetoY },
                    });
                }
            } else {
                this.generateNewtmpPolygon(len);
                this.tmpPolygon!.coorPt.push({
                    x: mouseX,
                    y: mouseY,
                    distancetoImg: { x: distancetoX, y: distancetoY },
                });
            }
        } catch (err) {
            console.log('segmentation pushTmpPoint(mouseX:number, mouseY:number) ----> ', err.name + ': ', err.message);
        }
    }

    public removeLastPoint(
        pol: PolyMeta,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ): boolean {
        try {
            if (this.tmpPolygon!.coorPt.length > 1) {
                this.tmpPolygon!.coorPt.pop();
                return false;
            } else {
                this.resetDrawing(pol, context, img, canvasW, canvasH);
                return true;
            }
        } catch (err) {
            console.log('segmentation removeLastPoint() ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public calculatePointDistance(p1x: number, p1y: number, p2x: number, p2y: number): number | undefined {
        try {
            let xdis: number = p1x - p2x;
            let ydis: number = p1y - p2y;

            return Math.sqrt(xdis * xdis + ydis * ydis);
        } catch (err) {
            console.log(
                'segmentation calculatePointDistance(p1x:number,p1y:number,p2x:number,p2y:number):number ----> ',
                err.name + ': ',
                err.message,
            );
            return undefined;
        }
    }

    public generateNewtmpPolygon(len: number) {
        try {
            let uuid: number = this.util.generateUniquesID();
            let tmpregionatt: string = (len + 1).toString();
            this.tmpPolygon = {
                coorPt: [],
                label: 'default',
                id: uuid,
                lineWidth: 2,
                color: '#FFFAFA',
                regionatt: tmpregionatt,
                sublabel: [],
            };
        } catch (err) {
            console.log('segmentation generateNewtmpPolygon() ----> ', err.name + ': ', err.message);
        }
    }

    public resetDrawing(
        pol: PolyMeta,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ) {
        try {
            this.tmpPolygon = null;
            this.setNewpolygon(false);
            this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, -1);
        } catch (err) {
            console.log(
                'segmentation resetDrawing(context:CanvasRenderingContext2D, img:HTMLImageElement, canvasW:number, canvasH:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public setNewpolygon(state: Boolean) {
        try {
            this.isNewPoly = state;
        } catch (err) {
            console.log('segmentation setNewpolygon(state:Boolean) ----> ', err.name + ': ', err.message);
        }
    }

    public redraw(
        pol: PolyMeta,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        imgW: number,
        imgH: number,
        imgX: number,
        imgY: number,
        selectedpolygon: number,
    ) {
        try {
            context.restore();
            context.clearRect(0, 0, canvasW, canvasH);
            context.save();
            context.beginPath();
            context.rect(imgX, imgY, imgW, imgH);
            context.clip();
            context.beginPath();
            context.drawImage(img, imgX, imgY, imgW, imgH);
            this.DrawAllPolygons(pol, context, selectedpolygon);
        } catch (err) {
            console.log(
                'segmentation redraw(img:HTMLImageElement,context:CanvasRenderingContext2D, canvasW:number, canvasH:number, imgW:number, imgH:number, imgX:number, imgY:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public DrawAllPolygons(pol: PolyMeta, context: CanvasRenderingContext2D, selectpolygon: number) {
        try {
            // if(pol.polygons.length < 1 || selectpolygon === -1){return;}
            // else{
            this.drawAllPolygonsLine(pol, context, 1);
            this.drawAllPolygonsDots(pol, context, selectpolygon, this.radius, 1);
            this.plotAllFloatLabel(pol, 1);
            // }
        } catch (err) {
            console.log(
                'segmentation DrawAllPolygons(context:CanvasRenderingContext2D) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    private drawAllPolygonsLine(pol: PolyMeta, context: CanvasRenderingContext2D, len: number) {
        try {
            for (var i = 0; i < len; ++i) {
                context.lineWidth = pol.polygons[i].lineWidth;
                context.strokeStyle = pol.polygons[i].color;
                context.fillStyle = pol.polygons[i].color;
                context.beginPath();
                context.moveTo(pol.polygons[i].coorPt[0].x, pol.polygons[i].coorPt[0].y);
                for (var j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    if (j + 1 < pol.polygons[i].coorPt.length) {
                        context.lineTo(pol.polygons[i].coorPt[j + 1].x, pol.polygons[i].coorPt[j + 1].y);
                    }
                }
                context.closePath();
                context.stroke();
            }
        } catch (err) {
            console.log(
                'segmentation drawAllPolygonsLine(context:CanvasRenderingContext2D) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    private drawAllPolygonsDots(
        pol: PolyMeta,
        context: CanvasRenderingContext2D,
        selectedpolygon: number,
        radius: number,
        len: number,
    ) {
        try {
            for (var q = 0; q < len; ++q) {
                // context.strokeStyle = pol.polygons[q].color;
                // context.fillStyle = pol.polygons[q].color;
                if (q !== selectedpolygon) {
                    continue;
                }
                context.strokeStyle = 'green';
                context.fillStyle = 'green';
                for (var k = 0; k < pol.polygons[q].coorPt.length; ++k) {
                    context.beginPath();
                    context.arc(pol.polygons[q].coorPt[k].x, pol.polygons[q].coorPt[k].y, radius, 0, 2 * Math.PI);
                    context.fill();
                    context.closePath();
                    context.stroke();
                }
            }
        } catch (err) {
            console.log(
                'segmentation drawAllPolygonsDots(context:CanvasRenderingContext2D) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    private plotAllFloatLabel(pol: PolyMeta, len: number) {
        try {
            this.clearAllDIV(pol, 1);
            for (var i = 0; i < len; ++i) {
                // this.util.RemoveHTMLElement("float_" + pol[this.getCurrentSelectedimgidx()].polygons[i].id.toString());
                let regionAtt = pol.polygons[i].regionatt.toString();
                let uuids = pol.polygons[i].id;
                let tempdiv = this.createDIV(
                    regionAtt,
                    uuids,
                    pol.polygons[i].coorPt[0].x,
                    pol.polygons[i].coorPt[0].y,
                );
                document.getElementById('')!.appendChild(tempdiv!);
            }
        } catch (err) {
            console.log('segmentation plotAllFloatLabel() ----> ', err.name + ': ', err.message);
        }
    }

    public clearAllDIV(pol: PolyMeta, len: number) {
        try {
            for (var i = 0; i < len; ++i) {
                this.util.RemoveHTMLElement('float_' + pol.polygons[i].id.toString());
            }
        } catch (err) {
            console.log('segmentation clearAllDIV() ----> ', err.name + ': ', err.message);
        }
    }

    public createDIV(textinfo: string, uuid: number, posX: number, posY: number) {
        try {
            let divtag = document.createElement('div');
            divtag.id = 'float_' + uuid.toString();
            divtag.style.position = 'absolute';
            divtag.style.top = (posY + this.radius + 0.5).toString() + 'px';
            divtag.style.left = (posX + this.radius + 0.5).toString() + 'px';
            divtag.style.backgroundColor = 'rgba(255,255,255,0.5)';
            divtag.style.pointerEvents = 'none';
            divtag.style.color = 'black';
            divtag.innerText = textinfo;

            return divtag;
        } catch (err) {
            console.log('segmentation setCurrentSelectedimguid(uid:number) ----> ', err.name + ': ', err.message);
        }
    }

    public setGlobalXY(offsetX: number, offsetY: number) {
        try {
            this.GlobalXY.x = offsetX;
            this.GlobalXY.y = offsetY;
        } catch (err) {
            console.log(
                'segmentation setGlobalXY(offsetX:number, offsetY:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public getGlobalX() {
        return this.GlobalXY.x;
    }

    public getGlobalY() {
        return this.GlobalXY.y;
    }

    public MouseMovePolygon(
        MouseX: number,
        MouseY: number,
        pol: PolyMeta,
        context: CanvasRenderingContext2D,
        PolyIndex: number,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ) {
        //, selectedpolygon:number){
        try {
            let img_X: number = pol.img_x;
            let img_Y: number = pol.img_y;
            let imgW: number = pol.img_w;
            let imgH: number = pol.img_h;
            let newXoffset: number = MouseX - this.GlobalXY.x;
            let newYoffset: number = MouseY - this.GlobalXY.y;
            if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, PolyIndex, newXoffset, newYoffset)) {
                this.GlobalXY.x = MouseX;
                this.GlobalXY.y = MouseY;
                for (var i = 0; i < pol.polygons[PolyIndex].coorPt.length; ++i) {
                    pol.polygons[PolyIndex].coorPt[i].x += newXoffset;
                    pol.polygons[PolyIndex].coorPt[i].y += newYoffset;
                }
                this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, PolyIndex); //selectedpolygon);
            }
        } catch (err) {
            console.log(
                'segmentation MovePolygon(e:MouseEvent, context:CanvasRenderingContext2D, PolyIndex:number, img:HTMLImageElement, canvasW:number, canvasH:number, imgW:number, imgH:number, imgx:number, imgy:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public KeyboardMovePolygon(
        pol: PolyMeta,
        direction: string,
        PolyIndex: number,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
        callback: Function,
    ): boolean {
        try {
            if (PolyIndex !== undefined && PolyIndex !== -1 && pol) {
                let img_X: number = pol.img_x;
                let img_Y: number = pol.img_y;
                let imgW: number = pol.img_w;
                let imgH: number = pol.img_h;
                if (direction == 'up' || direction == 'left') {
                    let offset: number = -3;
                    if (direction == 'up') {
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, PolyIndex, 0, offset)) {
                            for (var i = 0; i < pol.polygons[PolyIndex].coorPt.length; ++i) {
                                pol.polygons[PolyIndex].coorPt[i].y += offset;
                            }
                        }
                    } else if (direction == 'left') {
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, PolyIndex, offset, 0)) {
                            for (var l = 0; l < pol.polygons[PolyIndex].coorPt.length; ++l) {
                                pol.polygons[PolyIndex].coorPt[l].x += offset;
                            }
                        }
                    }
                } else if (direction == 'down' || direction == 'right') {
                    let offset: number = 3;
                    if (direction == 'down') {
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, PolyIndex, 0, offset)) {
                            for (var j = 0; j < pol.polygons[PolyIndex].coorPt.length; ++j) {
                                pol.polygons[PolyIndex].coorPt[j].y += offset;
                            }
                        }
                    } else if (direction == 'right') {
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, PolyIndex, offset, 0)) {
                            for (var k = 0; k < pol.polygons[PolyIndex].coorPt.length; ++k) {
                                pol.polygons[PolyIndex].coorPt[k].x += offset;
                            }
                        }
                    }
                }
                this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, PolyIndex);
                this.validateXYDistance(pol, pol.img_x, pol.img_y);
                callback(true);
            }
            return true;
        } catch (err) {
            console.log(
                'segmentation MoveSinglePolygon(direction:string, PolyIndex:number, context:CanvasRenderingContext2D, img:HTMLImageElement, canvasW:number, canvasH:number, selectedpolygon:number) ----> ',
                err.name + ': ',
                err.message,
            );
            return true;
        }
    }

    private WithinPointPath(
        pol: PolyMeta,
        imgx: number,
        imgy: number,
        imgw: number,
        imgh: number,
        index: number,
        newX: number,
        newY: number,
    ): boolean {
        try {
            for (var i = 0; i < pol.polygons[index].coorPt.length; ++i) {
                if (
                    pol.polygons[index].coorPt[i].x + newX < imgx ||
                    pol.polygons[index].coorPt[i].x + newX > imgx + imgw ||
                    pol.polygons[index].coorPt[i].y + newY < imgy ||
                    pol.polygons[index].coorPt[i].y + newY > imgy + imgh
                ) {
                    return false;
                }
            }
            return true;
        } catch (err) {
            return false;
        }
    }

    public validateXYDistance(pol: PolyMeta, imgX: number, imgY: number) {
        try {
            for (var i = 0; i < pol.polygons.length; ++i) {
                for (var j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    let distancetoX = pol.polygons[i].coorPt[j].x - imgX;
                    let distancetoY = pol.polygons[i].coorPt[j].y - imgY;
                    pol.polygons[i].coorPt[j].distancetoImg.x = distancetoX;
                    pol.polygons[i].coorPt[j].distancetoImg.y = distancetoY;
                }
            }
        } catch (err) {
            console.log(
                'segmentation validateXYDistance(imgX:number, imgY:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public setpolygonslineWidth(pol: PolyMeta, selectedpolygon: number) {
        try {
            for (var i = 0; i < pol.polygons.length; ++i) {
                if (i === selectedpolygon) {
                    pol.polygons[i].lineWidth = 2;
                } else {
                    pol.polygons[i].lineWidth = 1;
                }
            }
        } catch (err) {}
    }

    public DrawNewPolygon(
        pol: PolyMeta,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        closepath: Boolean,
    ) {
        try {
            this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, -1);
            for (var iI = 0; iI < this.tmpPolygon!.coorPt.length; ++iI) {
                context.strokeStyle = 'green';
                context.fillStyle = 'green';
                context.beginPath();
                context.arc(this.tmpPolygon!.coorPt[iI].x, this.tmpPolygon!.coorPt[iI].y, this.radius, 0, 2 * Math.PI);
                context.fill();
                context.closePath();
                context.stroke();
            }

            context.beginPath();
            context.lineWidth = this.tmpPolygon!.lineWidth;
            context.strokeStyle = this.tmpPolygon!.color;
            context.fillStyle = this.tmpPolygon!.color;
            context.moveTo(this.tmpPolygon!.coorPt[0].x, this.tmpPolygon!.coorPt[0].y);

            for (var i = 0; i < this.tmpPolygon!.coorPt.length; ++i) {
                if (i + 1 < this.tmpPolygon!.coorPt.length) {
                    context.lineTo(this.tmpPolygon!.coorPt[i + 1].x, this.tmpPolygon!.coorPt[i + 1].y);
                }
            }
            if (!closepath) {
                context.stroke();
            } else {
                context.closePath();
                context.stroke();
                if (this.tmpPolygon !== null && this.tmpPolygon !== undefined) {
                    pol.polygons.push(cloneDeep(this.tmpPolygon));
                    this.setpolygonslineWidth(pol, pol.polygons.length - 1);
                    this.tmpPolygon = null;
                }
                this.setNewpolygon(false);
                this.redraw(
                    pol,
                    img,
                    context,
                    canvasW,
                    canvasH,
                    pol.img_w,
                    pol.img_h,
                    pol.img_x,
                    pol.img_y,
                    pol.polygons.length - 1,
                );
            }
        } catch (err) {
            console.log(
                'segmentation DrawNewPolygon(img:HTMLImageElement, context:CanvasRenderingContext2D, canvasW:number, canvasH:number, imgWidth:number, imgHeight:number, closepath:Boolean, imgx:number, imgy:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public DrawfromlastPoint(MouseX: number, MouseY: number, context: CanvasRenderingContext2D) {
        try {
            if (this.tmpPolygon!.coorPt.length > 0) {
                context.beginPath();
                context.moveTo(
                    this.tmpPolygon!.coorPt[this.tmpPolygon!.coorPt.length - 1].x,
                    this.tmpPolygon!.coorPt[this.tmpPolygon!.coorPt.length - 1].y,
                );
                context.lineTo(MouseX, MouseY);
                context.stroke();
            }
        } catch (err) {
            console.log(
                'segmentation DrawfromlastPoint(e:MouseEvent, context:CanvasRenderingContext2D) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public returnTempPoly() {
        try {
            if (this.tmpPolygon !== null && this.tmpPolygon !== undefined) {
                return this.tmpPolygon;
            } else {
                return null;
            }
        } catch (err) {
            console.log('segmentation returnTempPoly() ----> ', err.name + ': ', err.message);
            return null;
        }
    }

    public setPolygonCoordinate(
        MouseX: number,
        MouseY: number,
        pol: PolyMeta,
        selectedPoly: number,
        PointIndex: number,
    ) {
        try {
            if (selectedPoly !== -1 && PointIndex !== -1) {
                pol.polygons[selectedPoly].coorPt[PointIndex].x = MouseX;
                pol.polygons[selectedPoly].coorPt[PointIndex].y = MouseY;
            }
        } catch (err) {
            console.log(
                'segmentation setPolygonCoordinate(e:MouseEvent, selectedPoly:number, PointIndex:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    private insidePolygonArea(vert: Coordinate[], mouseX: number, mouseY: number): boolean {
        try {
            let inside = false;
            for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {
                var intersect =
                    vert[i].y > mouseY != vert[j].y > mouseY &&
                    mouseX < ((vert[j].x - vert[i].x) * (mouseY - vert[i].y)) / (vert[j].y - vert[i].y) + vert[i].x;
                if (intersect) {
                    inside = !inside;
                }
            }
            return inside;
        } catch (err) {
            console.log(
                'segmentation insidePolygonArea(vert:coordinate[], mouseX:number, mouseY:number):boolean ----> ',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    private CalculatePolygonArea(poly: Polygons): number {
        try {
            var area: number = 0;
            var j: number = poly.coorPt.length - 1;
            for (var i = 0; i < poly.coorPt.length; ++i) {
                area += (poly.coorPt[j].x + poly.coorPt[i].x) * (poly.coorPt[j].y - poly.coorPt[i].y);
                j = i;
            }

            return Math.abs(area / 2.0);
        } catch (err) {
            return -1;
        }
    }

    public findPolygonArea(MouseX: number, MouseY: number, pol: PolyMeta): number {
        try {
            let polyindex: number = -1;
            var area: number = 10000000;
            for (var i = 0; i < pol.polygons.length; ++i) {
                if (this.insidePolygonArea(pol.polygons[i].coorPt, MouseX, MouseY)) {
                    var polyarea: number = this.CalculatePolygonArea(pol.polygons[i]);
                    if (polyarea < area) {
                        polyindex = i;
                        area = cloneDeep(polyarea);
                    }
                }
            }
            return polyindex;
        } catch (err) {
            console.log('segmentation findPolygonArea(e:MouseEvent):number ----> ', err.name + ': ', err.message);
            return -1;
        }
    }

    public findClickPoint(MouseX: number, MouseY: number, pol: PolyMeta): { polygonIndex: number; PointIndex: number } {
        try {
            let dist: number;
            let clickarea = { polygonIndex: -1, PointIndex: -1 };
            for (var i = 0; i < pol.polygons.length; ++i) {
                for (var j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    dist = Math.sqrt(
                        Math.pow(MouseX - pol.polygons[i].coorPt[j].x, 2) +
                            Math.pow(MouseY - pol.polygons[i].coorPt[j].y, 2),
                    );
                    if (dist <= this.radius) {
                        clickarea.polygonIndex = i;
                        clickarea.PointIndex = j;
                        break;
                    }
                }
            }
            return clickarea;
        } catch (err) {
            console.log(
                'segmentation findClickPoint(e:MouseEvent, radius:number):{polygonIndex:number, PointIndex:number} ----> ',
                err.name + ': ',
                err.message,
            );
            return { polygonIndex: -1, PointIndex: -1 };
        }
    }

    public isNewPolygon(): Boolean {
        try {
            return this.isNewPoly;
        } catch (err) {
            console.log('segmentation isNewPolygon():Boolean ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public deleteSinglePolygon(pol: PolyMeta, index: number, callback: Function) {}

    public scalePolygons(pol: PolyMeta, scaleFactor: number, imgX: number, imgY: number, callback: Function) {
        try {
            for (var i = 0; i < pol.polygons.length; ++i) {
                for (var j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    pol.polygons[i].coorPt[j].x = pol.polygons[i].coorPt[j].distancetoImg.x * scaleFactor + imgX;
                    pol.polygons[i].coorPt[j].y = pol.polygons[i].coorPt[j].distancetoImg.y * scaleFactor + imgY;
                    pol.polygons[i].coorPt[j].distancetoImg.x = pol.polygons[i].coorPt[j].x - imgX;
                    pol.polygons[i].coorPt[j].distancetoImg.y = pol.polygons[i].coorPt[j].y - imgY;
                }
            }
            this.setpolygonslineWidth(pol, -1);
            callback(true);
        } catch (err) {
            console.log(
                'segmentation scalePolygons(scaleFactor:number, imgX:number, imgY:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public panPolygons(pol: PolyMeta, imgX: number, imgY: number, isDraw: boolean) {
        try {
            if (isDraw) {
                for (var ii = 0; ii < this.tmpPolygon!.coorPt.length; ++ii) {
                    this.tmpPolygon!.coorPt[ii].x =
                        cloneDeep(imgX) + cloneDeep(this.tmpPolygon!.coorPt[ii].distancetoImg.x);
                    this.tmpPolygon!.coorPt[ii].y =
                        cloneDeep(imgY) + cloneDeep(this.tmpPolygon!.coorPt[ii].distancetoImg.y);
                }
            }
            for (var i = 0; i < pol.polygons.length; ++i) {
                for (var j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    pol.polygons[i].coorPt[j].x =
                        cloneDeep(imgX) + cloneDeep(pol.polygons[i].coorPt[j].distancetoImg.x);
                    pol.polygons[i].coorPt[j].y =
                        cloneDeep(imgY) + cloneDeep(pol.polygons[i].coorPt[j].distancetoImg.y);
                }
            }
        } catch (err) {
            console.log('segmentation panPolygons(imgX:number, imgY:number) ----> ', err.name + ': ', err.message);
        }
    }

    // public setCurrentSelectedimgidx(idx: number | undefined) {
    //     try {
    //         this.CurrentSelectedImg.idx = idx!;
    //     } catch (err) {
    //         console.log('segmentation setCurrentSelectedimg(idx:number) ----> ', err.name + ': ', err.message);
    //     }
    // }

    // public setCurrentSelectedimguid(uid: number) {
    //     try {
    //         this.CurrentSelectedImg.uid = uid;
    //     } catch (err) {
    //         console.log('segmentation setCurrentSelectedimguid(uid:number) ----> ', err.name + ': ', err.message);
    //     }
    // }
}
