import { cloneDeep } from 'lodash-es';
import { Coordinate, Direction, FitScreenCalc, Polygons, PolyMetadata, xyCoordinate } from '../image-labelling.model';
import { Injectable } from '@angular/core';
import { Utils } from '../../../shared/types/utils/utils';

@Injectable({
    providedIn: 'any',
})
export class SegmentationCanvasService {
    private globalXY: xyCoordinate = { x: -1, y: -1 };
    private panXY: xyCoordinate = { x: 0, y: 0 };
    private clickPoint: { polygonIndex: number; PointIndex: number } = { polygonIndex: -1, PointIndex: -1 };
    private radius: number = 3.5;
    private distanceOffset: number = 8;
    private tmpPolygon: Polygons | null = {
        color: '',
        coorPt: [],
        id: 0,
        label: '',
        lineWidth: 0,
        region: '',
        subLabel: [],
    };
    private selectedPolygon: number = -1;
    private util: Utils = new Utils();
    private isNewPoly: boolean = false;
    // private currentSelectedImg = { uid: -1, idx: -1 };

    constructor() {}

    public whenMouseDownEvent(
        { offsetX, offsetY }: MouseEvent,
        metadata: PolyMetadata,
        { width, height }: HTMLCanvasElement,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        ctrldown: boolean,
        altdown: boolean,
    ): number {
        this.setGlobalXY({ img_x: offsetX, img_y: offsetY });
        const polArea = this.findPolygonArea(offsetX, offsetY, metadata);
        this.clickPoint = this.findClickPoint(offsetX, offsetY, metadata);
        if (this.isNewPolygon() && ctrldown) {
            this.setPanXY({ offsetX, offsetY });
        } else if ((this.tmpPolygon === null && this.selectedPolygon < 0) || altdown) {
            this.setPolygonsLineWidth(metadata, -1);
            this.selectedPolygon = -1;
            this.setNewpolygon(true);
            this.pushTmpPoint(offsetX, offsetY, offsetX, offsetY, metadata.polygons.length);
        } else if (this.isNewPolygon()) {
            this.pushTmpPoint(offsetX, offsetY, offsetX, offsetY, metadata.polygons.length);
            this.drawNewPolygon(metadata, img, context, width, height, false);
            this.drawfromPreviousPoint(offsetX, offsetY, context);
        } else {
            this.setNewpolygon(false);
            this.selectedPolygon =
                this.findPolygonArea(offsetX, offsetY, metadata) > -1
                    ? this.findPolygonArea(offsetX, offsetY, metadata)
                    : this.findClickPoint(offsetX, offsetY, metadata).polygonIndex;
            this.setPolygonsLineWidth(metadata, this.selectedPolygon);
        }
        return this.selectedPolygon;
    }

    public whenMouseMoveEvent(
        pol: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        newX: number,
        newY: number,
        ctrldown: boolean,
        isMouseDown: boolean,
        redrawCallback: (...agrs: any) => any,
    ) {
        if (this.isNewPolygon() && ctrldown && isMouseDown) {
            const diffX = newX - this.getPanX();
            const diffY = newY - this.getPanY();
            if (pol) {
                pol.img_x = this.getGlobalX() + diffX;
                pol.img_y = this.getGlobalY() + diffY;
                this.panPolygons(pol, pol.img_x, pol.img_y, true);
                redrawCallback('pan');
            }
        } else if (this.isNewPolygon()) {
            this.drawNewPolygon(pol, img, context, canvasW, canvasH, false);
            this.drawfromPreviousPoint(newX, newY, context);
        } else if (this.selectedPolygon > -1 && isMouseDown) {
            this.mouseMovePolygon(newX, newY, pol, context, this.selectedPolygon, img, canvasW, canvasH);
        } else {
            this.setPolygonCoordinate(newX, newY, pol, this.clickPoint.polygonIndex, this.clickPoint.PointIndex);
            redrawCallback('draw');
        }
    }

    setPanXY({ offsetX, offsetY }: Pick<MouseEvent, 'offsetX' | 'offsetY'>) {
        try {
            return offsetX && offsetY ? ((this.panXY.x = offsetX), (this.panXY.y = offsetY), true) : false;
        } catch (err) {
            console.log('setPanXY', err);
            return false;
        }
    }

    getPanX() {
        return this.panXY.x;
    }

    getPanY() {
        return this.panXY.y;
    }

    setSelectedPolygon(index: number) {
        index && (this.selectedPolygon = index);
    }

    getSelectedPolygon() {
        return this.selectedPolygon;
    }

    mouseClickWithinPointPath({ img_x, img_y, img_w, img_h }: PolyMetadata, { offsetX, offsetY }: MouseEvent): boolean {
        const resultX = offsetX > img_x && offsetX < img_x + img_w;
        const resultY = offsetY > img_y && offsetY < img_y + img_h;
        const result = resultX && resultY;
        return result;
    }

    calScaleToFitScreen(
        { img_w, img_h }: PolyMetadata,
        { offsetWidth, offsetHeight }: HTMLCanvasElement,
    ): FitScreenCalc {
        try {
            const obj = { factor: -1, newX: -1, newY: -1 };
            let { factor, newX, newY } = obj;

            const factorCalc = Math.min(offsetWidth / img_w, offsetHeight / img_h);
            factor = factorCalc - factorCalc * 0.05;
            newX = offsetWidth / 2 - (img_w / 2) * factor;
            newY = offsetHeight / 2 - (img_h / 2) * factor;
            return obj;
        } catch (err) {
            console.log(`calScaleToFitScreen`, err);
            return { factor: -1, newX: -1, newY: -1 };
        }
    }

    public pushTmpPoint(mouseX: number, mouseY: number, imgX: number, imgY: number, len: number) {
        try {
            const distancetoX = mouseX - imgX;
            const distancetoY = mouseY - imgY;
            if (this.tmpPolygon !== null && this.tmpPolygon !== undefined) {
                const lastX: number = this.tmpPolygon.coorPt[this.tmpPolygon.coorPt.length - 1].x;
                const lastY: number = this.tmpPolygon.coorPt[this.tmpPolygon.coorPt.length - 1].y;
                const calPointDistnace = this.calculatePointDistance(lastX, lastY, mouseX, mouseY);
                if (calPointDistnace && calPointDistnace > this.distanceOffset) {
                    this.tmpPolygon.coorPt.push({
                        x: mouseX,
                        y: mouseY,
                        distancetoImg: { x: distancetoX, y: distancetoY },
                    });
                }
            } else {
                this.generateNewtmpPolygon(len);

                // ! Why is the below code using tmpPolygon in the else statement ????
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
        pol: PolyMetadata,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ): boolean {
        try {
            if (this.tmpPolygon && this.tmpPolygon.coorPt.length > 1) {
                this.tmpPolygon.coorPt.pop();
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
            const xdis: number = p1x - p2x;
            const ydis: number = p1y - p2y;

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
            const uuid: number = this.util.generateUniquesID();
            const tmpregion: string = (len + 1).toString();
            this.tmpPolygon = {
                coorPt: [],
                label: 'default',
                id: uuid,
                lineWidth: 2,
                color: '#FFFAFA',
                region: tmpregion,
                subLabel: [],
            };
        } catch (err) {
            console.log('segmentation generateNewtmpPolygon() ----> ', err.name + ': ', err.message);
        }
    }

    public resetDrawing(
        pol: PolyMetadata,
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

    public setNewpolygon(state: boolean) {
        try {
            this.isNewPoly = state;
        } catch (err) {
            console.log('segmentation setNewpolygon(state:Boolean) ----> ', err.name + ': ', err.message);
        }
    }

    public redraw(
        pol: PolyMetadata,
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
            this.drawAllPolygons(pol, context, selectedpolygon);
        } catch (err) {
            console.log(
                'segmentation redraw(img:HTMLImageElement,context:CanvasRenderingContext2D, canvasW:number, canvasH:number, imgW:number, imgH:number, imgX:number, imgY:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public drawAllPolygons(pol: PolyMetadata, context: CanvasRenderingContext2D, selectpolygon: number) {
        try {
            // if(pol.polygons.length < 1 || selectpolygon === -1){return;}
            // else{
            this.drawAllPolygonsLine(pol, context, 1);
            this.drawAllPolygonsDots(pol, context, selectpolygon, this.radius, 1);
            this.plotAllFloatLabel(pol, 1);
            // }
        } catch (err) {
            console.log(
                'segmentation drawAllPolygons(context:CanvasRenderingContext2D) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    private drawAllPolygonsLine(pol: PolyMetadata, context: CanvasRenderingContext2D, len: number) {
        try {
            for (let i = 0; i < len; ++i) {
                context.lineWidth = pol.polygons[i].lineWidth;
                context.strokeStyle = pol.polygons[i].color;
                context.fillStyle = pol.polygons[i].color;
                context.beginPath();
                context.moveTo(pol.polygons[i].coorPt[0].x, pol.polygons[i].coorPt[0].y);
                for (let j = 0; j < pol.polygons[i].coorPt.length; ++j) {
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
        pol: PolyMetadata,
        context: CanvasRenderingContext2D,
        selectedpolygon: number,
        radius: number,
        len: number,
    ) {
        try {
            for (let q = 0; q < len; ++q) {
                // context.strokeStyle = pol.polygons[q].color;
                // context.fillStyle = pol.polygons[q].color;
                if (q !== selectedpolygon) {
                    continue;
                }
                context.strokeStyle = 'green';
                context.fillStyle = 'green';

                for (const [k, { x, y }] of pol.polygons[q].coorPt.entries()) {
                    context.beginPath();
                    context.arc(pol.polygons[q].coorPt[k].x, pol.polygons[q].coorPt[k].y, radius, 0, 2 * Math.PI);
                    context.fill();
                    context.closePath();
                    context.stroke();
                }
                // for (let k = 0; k < pol.polygons[q].coorPt.length; ++k) {
                //     context.beginPath();
                //     context.arc(pol.polygons[q].coorPt[k].x, pol.polygons[q].coorPt[k].y, radius, 0, 2 * Math.PI);
                //     context.fill();
                //     context.closePath();
                //     context.stroke();
                // }
            }
        } catch (err) {
            console.log(
                'segmentation drawAllPolygonsDots(context:CanvasRenderingContext2D) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    private plotAllFloatLabel(pol: PolyMetadata, len: number) {
        try {
            this.clearAllDIV(pol, 1);
            for (let i = 0; i < len; ++i) {
                // this.util.RemoveHTMLElement("float_" + pol[this.getCurrentSelectedimgidx()].polygons[i].id.toString());
                const region = pol.polygons[i].region.toString();
                const uuids = pol.polygons[i].id;
                const tempdiv = this.createDIV(region, uuids, pol.polygons[i].coorPt[0].x, pol.polygons[i].coorPt[0].y);

                const element = document.getElementById('');
                element && tempdiv && element.appendChild(tempdiv);
            }
        } catch (err) {
            console.log('segmentation plotAllFloatLabel() ----> ', err.name + ': ', err.message);
        }
    }

    public clearAllDIV(pol: PolyMetadata, len: number) {
        try {
            for (let i = 0; i < len; ++i) {
                this.util.RemoveHTMLElement('float_' + pol.polygons[i].id.toString());
            }
        } catch (err) {
            console.log('segmentation clearAllDIV() ----> ', err.name + ': ', err.message);
        }
    }

    public createDIV(textinfo: string, uuid: number, posX: number, posY: number) {
        try {
            const divtag = document.createElement('div');
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

    public setGlobalXY({ img_x, img_y }: Pick<PolyMetadata, 'img_x' | 'img_y'>) {
        try {
            this.globalXY.x = img_x;
            this.globalXY.y = img_y;
        } catch (err) {
            console.log('setGlobalXY', err);
        }
    }

    public getGlobalX() {
        return this.globalXY.x;
    }

    public getGlobalY() {
        return this.globalXY.y;
    }

    public mouseMovePolygon(
        mouseX: number,
        mouseY: number,
        pol: PolyMetadata,
        context: CanvasRenderingContext2D,
        polyIndex: number,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ) {
        // , selectedpolygon:number){
        try {
            const img_X: number = pol.img_x;
            const img_Y: number = pol.img_y;
            const imgW: number = pol.img_w;
            const imgH: number = pol.img_h;
            const newXoffset: number = mouseX - this.globalXY.x;
            const newYoffset: number = mouseY - this.globalXY.y;
            if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, newXoffset, newYoffset)) {
                this.globalXY.x = mouseX;
                this.globalXY.y = mouseY;

                for (const [i, { x, y }] of pol.polygons[polyIndex].coorPt.entries()) {
                    pol.polygons[polyIndex].coorPt[i].x += newXoffset;
                    pol.polygons[polyIndex].coorPt[i].y += newYoffset;
                }

                this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, polyIndex);
                // selectedpolygon);
            }
        } catch (err) {
            console.log(
                'segmentation MovePolygon(e:MouseEvent, context:CanvasRenderingContext2D, PolyIndex:number, img:HTMLImageElement, canvasW:number, canvasH:number, imgW:number, imgH:number, imgx:number, imgy:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public keyboardMovePolygon(
        pol: PolyMetadata,
        direction: Direction,
        polyIndex: number,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
        callback: (args: boolean) => void,
    ): boolean {
        try {
            if (polyIndex !== undefined && polyIndex !== -1 && pol) {
                const img_X: number = pol.img_x;
                const img_Y: number = pol.img_y;
                const imgW: number = pol.img_w;
                const imgH: number = pol.img_h;
                const offset: number = -3;
                switch (direction) {
                    case 'up':
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, 0, offset)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].y += offset;
                            }
                        }
                        break;
                    case 'left':
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, offset, 0)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].x += offset;
                            }
                        }
                        break;

                    case 'down':
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, 0, offset)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].y += offset;
                            }
                        }
                        break;
                    case 'right':
                        if (this.WithinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, offset, 0)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].x += offset;
                            }
                        }
                        break;
                }
                this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, polyIndex);
                this.validateXYDistance(pol);
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
        pol: PolyMetadata,
        imgx: number,
        imgy: number,
        imgw: number,
        imgh: number,
        index: number,
        newX: number,
        newY: number,
    ): boolean {
        try {
            for (const [i] of pol.polygons[index].coorPt.entries()) {
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

    validateXYDistance({ polygons, img_x, img_y }: PolyMetadata) {
        try {
            for (const [i] of polygons.entries()) {
                for (const [j] of polygons[i].coorPt.entries()) {
                    const distancetoX = polygons[i].coorPt[j].x - img_x;
                    const distancetoY = polygons[i].coorPt[j].y - img_y;
                    polygons[i].coorPt[j].distancetoImg.x = distancetoX;
                    polygons[i].coorPt[j].distancetoImg.y = distancetoY;
                }
            }
        } catch (err) {
            console.log('validateXYDistance', err);
        }
    }

    public setPolygonsLineWidth(pol: PolyMetadata, selectedpolygon: number) {
        try {
            for (let i = 0; i < pol.polygons.length; ++i) {
                if (i === selectedpolygon) {
                    pol.polygons[i].lineWidth = 2;
                } else {
                    pol.polygons[i].lineWidth = 1;
                }
            }
        } catch (err) {}
    }

    public drawNewPolygon(
        pol: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        closepath: boolean,
    ) {
        try {
            this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, -1);
            if (this.tmpPolygon) {
                for (const [i] of this.tmpPolygon.coorPt.entries()) {
                    context.strokeStyle = 'green';
                    context.fillStyle = 'green';
                    context.beginPath();
                    context.arc(this.tmpPolygon.coorPt[i].x, this.tmpPolygon.coorPt[i].y, this.radius, 0, 2 * Math.PI);
                    context.fill();
                    context.closePath();
                    context.stroke();
                }

                context.beginPath();
                context.lineWidth = this.tmpPolygon.lineWidth;
                context.strokeStyle = this.tmpPolygon.color;
                context.fillStyle = this.tmpPolygon.color;
                context.moveTo(this.tmpPolygon.coorPt[0].x, this.tmpPolygon.coorPt[0].y);

                for (let i = 0; i < this.tmpPolygon.coorPt.length; ++i) {
                    if (i + 1 < this.tmpPolygon.coorPt.length) {
                        context.lineTo(this.tmpPolygon.coorPt[i + 1].x, this.tmpPolygon.coorPt[i + 1].y);
                    }
                }
            }
            if (!closepath) {
                context.stroke();
            } else {
                context.closePath();
                context.stroke();
                if (this.tmpPolygon !== null && this.tmpPolygon !== undefined) {
                    pol.polygons.push(cloneDeep(this.tmpPolygon));
                    this.setPolygonsLineWidth(pol, pol.polygons.length - 1);
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
                'segmentation drawNewPolygon(img:HTMLImageElement, context:CanvasRenderingContext2D, canvasW:number, canvasH:number, imgWidth:number, imgHeight:number, closepath:Boolean, imgx:number, imgy:number) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public drawfromPreviousPoint(mouseX: number, mouseY: number, context: CanvasRenderingContext2D) {
        try {
            if (this.tmpPolygon && this.tmpPolygon.coorPt.length > 0) {
                context.beginPath();
                context.moveTo(
                    this.tmpPolygon.coorPt[this.tmpPolygon.coorPt.length - 1].x,
                    this.tmpPolygon.coorPt[this.tmpPolygon.coorPt.length - 1].y,
                );
                context.lineTo(mouseX, mouseY);
                context.stroke();
            }
        } catch (err) {
            console.log(
                'segmentation drawfromPreviousPoint(e:MouseEvent, context:CanvasRenderingContext2D) ----> ',
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
        mouseX: number,
        mouseY: number,
        pol: PolyMetadata,
        selectedPoly: number,
        pointIndex: number,
    ) {
        try {
            if (selectedPoly !== -1 && pointIndex !== -1) {
                pol.polygons[selectedPoly].coorPt[pointIndex].x = mouseX;
                pol.polygons[selectedPoly].coorPt[pointIndex].y = mouseY;
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
            for (let i = 0, j = vert.length - 1; i < vert.length; j = i++) {
                const intersect =
                    vert[i].y > mouseY !== vert[j].y > mouseY &&
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
            let area: number = 0;
            let j: number = poly.coorPt.length - 1;
            for (let i = 0; i < poly.coorPt.length; ++i) {
                area += (poly.coorPt[j].x + poly.coorPt[i].x) * (poly.coorPt[j].y - poly.coorPt[i].y);
                j = i;
            }

            return Math.abs(area / 2.0);
        } catch (err) {
            return -1;
        }
    }

    public findPolygonArea(mouseX: number, mouseY: number, pol: PolyMetadata): number {
        try {
            let polyindex: number = -1;
            let area: number = 10000000;
            for (let i = 0; i < pol.polygons.length; ++i) {
                if (this.insidePolygonArea(pol.polygons[i].coorPt, mouseX, mouseY)) {
                    const polyarea: number = this.CalculatePolygonArea(pol.polygons[i]);
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

    public findClickPoint(
        mouseX: number,
        mouseY: number,
        pol: PolyMetadata,
    ): { polygonIndex: number; PointIndex: number } {
        try {
            let dist: number;
            const clickarea = { polygonIndex: -1, PointIndex: -1 };
            for (let i = 0; i < pol.polygons.length; ++i) {
                for (let j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    dist = Math.sqrt(
                        Math.pow(mouseX - pol.polygons[i].coorPt[j].x, 2) +
                            Math.pow(mouseY - pol.polygons[i].coorPt[j].y, 2),
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

    public isNewPolygon(): boolean {
        try {
            return this.isNewPoly;
        } catch (err) {
            console.log('isNewPolygon', err);
            return false;
        }
    }

    public deleteSinglePolygon(pol: PolyMetadata, index: number, callback: (agrs: boolean) => any) {}

    scalePolygons(metadata: PolyMetadata, { factor, newX, newY }: FitScreenCalc, callback?: (arg: boolean) => any) {
        try {
            const { polygons } = metadata;
            for (const [i] of polygons.entries()) {
                for (const [j] of polygons[i].coorPt.entries()) {
                    polygons[i].coorPt[j].x = polygons[i].coorPt[j].distancetoImg.x * factor + newX;
                    polygons[i].coorPt[j].y = polygons[i].coorPt[j].distancetoImg.y * factor + newY;
                    polygons[i].coorPt[j].distancetoImg.x = polygons[i].coorPt[j].x - newX;
                    polygons[i].coorPt[j].distancetoImg.y = polygons[i].coorPt[j].y - newY;
                }
            }

            this.setPolygonsLineWidth(metadata, -1);
            callback && callback(true);
        } catch (err) {
            console.log('scalePolygons', err);
        }
    }

    public panPolygons(pol: PolyMetadata, imgX: number, imgY: number, isDraw: boolean) {
        try {
            if (isDraw && this.tmpPolygon) {
                for (const [i] of this.tmpPolygon.coorPt.entries()) {
                    this.tmpPolygon.coorPt[i].x =
                        cloneDeep(imgX) + cloneDeep(this.tmpPolygon.coorPt[i].distancetoImg.x);
                    this.tmpPolygon.coorPt[i].y =
                        cloneDeep(imgY) + cloneDeep(this.tmpPolygon.coorPt[i].distancetoImg.y);
                }
            }
            for (const [i] of pol.polygons.entries()) {
                for (const [j] of pol.polygons[i].coorPt.entries()) {
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
