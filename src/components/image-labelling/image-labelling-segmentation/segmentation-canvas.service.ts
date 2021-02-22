import { cloneDeep } from 'lodash-es';
import {
    Coordinate,
    Direction,
    FitScreenCalc,
    Method,
    Polygons,
    PolyMetadata,
    xyCoordinate,
} from '../image-labelling.model';
import { Injectable } from '@angular/core';
import { Utils } from '../../../shared/types/utils/utils';

type ClickPoint = {
    polygonIndex: number;
    pointIndex: number;
};
@Injectable({
    providedIn: 'any',
})
export class SegmentationCanvasService {
    private globalXY: xyCoordinate = { x: -1, y: -1 };
    private panXY: xyCoordinate = { x: 0, y: 0 };
    private clickPoint: ClickPoint = { polygonIndex: -1, pointIndex: -1 };
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
    private selectedPolygonIndex: number = -1;
    private util: Utils = new Utils();
    private isNewPoly: boolean = false;
    // private currentSelectedImg = { uid: -1, idx: -1 };

    constructor() {}

    mouseDownDraw(
        { offsetX, offsetY }: MouseEvent,
        metadata: PolyMetadata,
        { width, height }: HTMLCanvasElement,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        ctrldown: boolean,
        altdown: boolean,
    ): number {
        this.setGlobalXY({ img_x: offsetX, img_y: offsetY });
        this.selectedPolygonIndex = this.findPolygonArea(offsetX, offsetY, metadata);
        this.clickPoint = this.findClickPoint(offsetX, offsetY, metadata);
        if (this.isNewPolygon() && ctrldown) {
            this.setPanXY({ offsetX, offsetY });
        } else if ((!this.tmpPolygon && this.selectedPolygonIndex < 0) || altdown) {
            this.setPolygonsLineWidth(metadata, -1);
            this.selectedPolygonIndex = -1;
            this.setNewpolygon(true);
            this.pushTmpPoint(offsetX, offsetY, metadata.img_x, metadata.img_y, metadata.polygons.length);
        } else if (this.isNewPolygon()) {
            this.pushTmpPoint(offsetX, offsetY, metadata.img_x, metadata.img_y, metadata.polygons.length);
            this.drawNewPolygon(metadata, img, context, width, height, false);
            this.drawfromPreviousPoint(offsetX, offsetY, context);
        } else {
            this.setNewpolygon(false);
            this.selectedPolygonIndex =
                this.findPolygonArea(offsetX, offsetY, metadata) > -1
                    ? this.findPolygonArea(offsetX, offsetY, metadata)
                    : this.findClickPoint(offsetX, offsetY, metadata).polygonIndex;
            this.setPolygonsLineWidth(metadata, this.selectedPolygonIndex);
        }
        return this.selectedPolygonIndex;
    }

    mouseMoveDraw(
        pol: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        newX: number,
        newY: number,
        ctrldown: boolean,
        isMouseDown: boolean,
        redrawCallback: (arg: Method) => void,
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
        } else if (this.selectedPolygonIndex > -1 && isMouseDown) {
            this.mouseMovePolygon(newX, newY, pol, context, this.selectedPolygonIndex, img, canvasW, canvasH);
        } else {
            this.setPolygonCoordinate(newX, newY, pol, this.clickPoint.polygonIndex, this.clickPoint.pointIndex);
            redrawCallback('draw');
        }
    }

    setPanXY({ offsetX, offsetY }: Pick<MouseEvent, 'offsetX' | 'offsetY'>) {
        try {
            if (offsetX && offsetY) {
                this.panXY.x = offsetX;
                this.panXY.y = offsetY;
                return true;
            } else {
                return false;
            }
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

    setSelectedPolygonIndex(index: number) {
        index && (this.selectedPolygonIndex = index);
    }

    getselectedPolygonIndex() {
        return this.selectedPolygonIndex;
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
            const factorCalc = Math.min(offsetWidth / img_w, offsetHeight / img_h);
            obj.factor = factorCalc - factorCalc * 0.05;
            obj.newX = offsetWidth / 2 - (img_w / 2) * obj.factor;
            obj.newY = offsetHeight / 2 - (img_h / 2) * obj.factor;
            return obj;
        } catch (err) {
            console.log(`calScaleToFitScreen`, err);
            return { factor: -1, newX: -1, newY: -1 };
        }
    }

    pushTmpPoint(mouseX: number, mouseY: number, imgX: number, imgY: number, len: number) {
        try {
            const distancetoX = mouseX - imgX;
            const distancetoY = mouseY - imgY;
            if (this.tmpPolygon) {
                this.tmpPolygon.coorPt.push({
                    x: mouseX,
                    y: mouseY,
                    distancetoImg: { x: distancetoX, y: distancetoY },
                });
            } else {
                this.generateNewtmpPolygon(len);
            }
        } catch (err) {
            console.log('pushTmpPoint', err);
        }
    }

    removeLastPoint(
        metadata: PolyMetadata,
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
                this.resetDrawing(metadata, context, img, canvasW, canvasH);
                return true;
            }
        } catch (err) {
            console.log('removeLastPoint', err);
            return false;
        }
    }

    calculatePointDistance(p1x: number, p1y: number, p2x: number, p2y: number) {
        try {
            const xdis: number = p1x - p2x;
            const ydis: number = p1y - p2y;

            return Math.sqrt(xdis * xdis + ydis * ydis);
        } catch (err) {
            console.log('calculatePointDistance', err);
            return undefined;
        }
    }

    generateNewtmpPolygon(len: number) {
        try {
            const uuid: number = this.util.generateUniquesID();
            const tmpRegion: string = (len + 1).toString();
            this.tmpPolygon = {
                coorPt: [],
                label: 'default',
                id: uuid,
                lineWidth: 2,
                color: '#FFFAFA',
                region: tmpRegion,
                subLabel: [],
            };
        } catch (err) {
            console.log('generateNewtmpPolygon', err);
        }
    }

    resetDrawing(
        metadata: PolyMetadata,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ) {
        try {
            this.tmpPolygon = null;
            this.setNewpolygon(false);
            this.redraw(
                metadata,
                img,
                context,
                canvasW,
                canvasH,
                metadata.img_w,
                metadata.img_h,
                metadata.img_x,
                metadata.img_y,
                -1,
            );
        } catch (err) {
            console.log('resetDrawing', err);
        }
    }

    setNewpolygon(state: boolean) {
        this.isNewPoly = state;
    }

    redraw(
        pol: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvasW: number,
        canvasH: number,
        imgW: number,
        imgH: number,
        imgX: number,
        imgY: number,
        selectedPolygonIndex: number,
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
            this.drawAllPolygon(pol, context, selectedPolygonIndex);
        } catch (err) {
            console.log('redraw', err);
        }
    }

    drawAllPolygon(metadata: PolyMetadata, context: CanvasRenderingContext2D, selectedPolygonIndex: number) {
        try {
            // if(pol.polygons.length < 1 || selectpolygon === -1){return;}
            // else{
            if (this.validatePolygonMetadata(metadata.polygons)) {
                this.drawAllPolygonLine(metadata, context, 1);
                this.drawAllPolygonsDots(metadata, context, selectedPolygonIndex, this.radius, 1);
                this.plotAllFloatLabel(metadata, 1);
            }
            // }
        } catch (err) {
            console.log('drawAllPolygon', err);
        }
    }

    private validatePolygonMetadata(polygons: Polygons[]) {
        return polygons.length > 0 ? true : false;
    }

    private drawAllPolygonLine({ polygons }: PolyMetadata, context: CanvasRenderingContext2D, length: number) {
        try {
            for (let i = 0; i < length; ++i) {
                context.lineWidth = polygons[i].lineWidth;
                context.strokeStyle = polygons[i].color;
                context.fillStyle = polygons[i].color;
                context.beginPath();
                context.moveTo(polygons[i].coorPt[0].x, polygons[i].coorPt[0].y);
                for (let j = 0; j < polygons[i].coorPt.length; ++j) {
                    if (j + 1 < polygons[i].coorPt.length) {
                        context.lineTo(polygons[i].coorPt[j + 1].x, polygons[i].coorPt[j + 1].y);
                    }
                }
                context.closePath();
                context.stroke();
            }
        } catch (err) {
            console.log('drawAllPolygonLine', err);
        }
    }

    private drawAllPolygonsDots(
        { polygons }: PolyMetadata,
        context: CanvasRenderingContext2D,
        selectedPolygonIndex: number,
        radius: number,
        len: number,
    ) {
        try {
            for (let q = 0; q < len; ++q) {
                // context.strokeStyle = pol.polygons[q].color;
                // context.fillStyle = pol.polygons[q].color;
                if (q !== selectedPolygonIndex) {
                    continue;
                }
                context.strokeStyle = 'green';
                context.fillStyle = 'green';

                for (const [k] of polygons[q].coorPt.entries()) {
                    context.beginPath();
                    context.arc(polygons[q].coorPt[k].x, polygons[q].coorPt[k].y, radius, 0, 2 * Math.PI);
                    context.fill();
                    context.closePath();
                    context.stroke();
                }
            }
        } catch (err) {
            console.log('drawAllPolygonsDots', err);
        }
    }
    // !! missing id for getElementById
    private plotAllFloatLabel(metadata: PolyMetadata, len: number) {
        try {
            this.clearAllDIV(metadata, 1);
            for (let i = 0; i < len; ++i) {
                // this.util.RemoveHTMLElement("float_" + pol[this.getCurrentSelectedimgidx()].polygons[i].id.toString());
                const regionAttr = metadata.polygons[i].region.toString();
                const uuids = metadata.polygons[i].id;
                const tempdiv = this.createDIV(
                    regionAttr,
                    uuids,
                    metadata.polygons[i].coorPt[0].x,
                    metadata.polygons[i].coorPt[0].y,
                );

                const element = document.getElementById('');
                element && tempdiv && element.appendChild(tempdiv);
            }
        } catch (err) {
            console.log('plotAllFloatLabel', err);
        }
    }

    clearAllDIV({ polygons }: PolyMetadata, len: number) {
        try {
            for (let i = 0; i < len; ++i) {
                this.util.RemoveHTMLElement('float_' + polygons[i].id.toString());
            }
        } catch (err) {
            console.log('clearAllDIV', err);
        }
    }

    createDIV(textinfo: string, uuid: number, posX: number, posY: number) {
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
            console.log('createDIV', err);
        }
    }

    setGlobalXY({ img_x, img_y }: Pick<PolyMetadata, 'img_x' | 'img_y'>) {
        try {
            this.globalXY.x = img_x;
            this.globalXY.y = img_y;
        } catch (err) {
            console.log('setGlobalXY', err);
        }
    }

    getGlobalX() {
        return this.globalXY.x;
    }

    getGlobalY() {
        return this.globalXY.y;
    }

    mouseMovePolygon(
        mouseX: number,
        mouseY: number,
        pol: PolyMetadata,
        context: CanvasRenderingContext2D,
        polyIndex: number,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ) {
        // , selectedPolygonIndex:number){
        try {
            // ! Don't remove the below const variables, it's used for other function to do calculations
            const img_X = pol.img_x;
            const img_Y = pol.img_y;
            const imgW = pol.img_w;
            const imgH = pol.img_h;
            const newXoffset = mouseX - this.globalXY.x;
            const newYoffset = mouseY - this.globalXY.y;
            if (this.withinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, newXoffset, newYoffset)) {
                this.globalXY.x = mouseX;
                this.globalXY.y = mouseY;

                for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                    pol.polygons[polyIndex].coorPt[i].x += newXoffset;
                    pol.polygons[polyIndex].coorPt[i].y += newYoffset;
                }

                this.redraw(pol, img, context, canvasW, canvasH, pol.img_w, pol.img_h, pol.img_x, pol.img_y, polyIndex);
                // selectedPolygonIndex);
            }
        } catch (err) {
            console.log('mouseMovePolygon', err);
        }
    }

    keyboardMovePolygon(
        pol: PolyMetadata,
        direction: Direction,
        polyIndex: number,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
        callback: (arg: boolean) => void,
    ): boolean {
        try {
            if (polyIndex !== undefined && polyIndex !== -1 && pol) {
                // ! Don't remove the below const variables, it's used for other function to do calculations
                const img_X = pol.img_x;
                const img_Y = pol.img_y;
                const imgW = pol.img_w;
                const imgH = pol.img_h;
                const offset = -3;
                switch (direction) {
                    case 'up':
                        if (this.withinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, 0, offset)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].y += offset;
                            }
                        }
                        break;
                    case 'left':
                        if (this.withinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, offset, 0)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].x += offset;
                            }
                        }
                        break;

                    case 'down':
                        if (this.withinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, 0, offset)) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].y += offset;
                            }
                        }
                        break;
                    case 'right':
                        if (this.withinPointPath(pol, img_X, img_Y, imgW, imgH, polyIndex, offset, 0)) {
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
            console.log('keyboardMovePolygon', err);
            return true;
        }
    }

    private withinPointPath(
        { polygons }: PolyMetadata,
        imgx: number,
        imgy: number,
        imgw: number,
        imgh: number,
        index: number,
        newX: number,
        newY: number,
    ) {
        try {
            for (const [i] of polygons[index].coorPt.entries()) {
                if (
                    polygons[index].coorPt[i].x + newX < imgx ||
                    polygons[index].coorPt[i].x + newX > imgx + imgw ||
                    polygons[index].coorPt[i].y + newY < imgy ||
                    polygons[index].coorPt[i].y + newY > imgy + imgh
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

    setPolygonsLineWidth({ polygons }: PolyMetadata, selectedPolygonIndex: number) {
        try {
            for (let i = 0; i < polygons.length; ++i) {
                if (i === selectedPolygonIndex) {
                    polygons[i].lineWidth = 2;
                } else {
                    polygons[i].lineWidth = 1;
                }
            }
        } catch (err) {
            console.log('setPolygonsLineWidth', err);
        }
    }

    drawNewPolygon(
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
                if (this.tmpPolygon) {
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
            console.log('drawNewPolygon', err);
        }
    }

    private drawfromPreviousPoint(mouseX: number, mouseY: number, context: CanvasRenderingContext2D) {
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
            console.log('drawfromPreviousPoint', err);
        }
    }

    returnTempPoly() {
        try {
            if (this.tmpPolygon !== null && this.tmpPolygon !== undefined) {
                return this.tmpPolygon;
            } else {
                return null;
            }
        } catch (err) {
            console.log('returnTempPoly', err);
            return null;
        }
    }

    setPolygonCoordinate(
        mouseX: number,
        mouseY: number,
        { polygons }: PolyMetadata,
        selectedPoly: number,
        pointIndex: number,
    ) {
        try {
            if (selectedPoly !== -1 && pointIndex !== -1) {
                polygons[selectedPoly].coorPt[pointIndex].x = mouseX;
                polygons[selectedPoly].coorPt[pointIndex].y = mouseY;
            }
        } catch (err) {
            console.log('setPolygonCoordinate', err);
        }
    }

    private insidePolygonArea(coord: Coordinate[], mouseX: number, mouseY: number) {
        try {
            let inside = false;
            for (let i = 0, j = coord.length - 1; i < coord.length; j = i++) {
                const intersect =
                    coord[i].y > mouseY !== coord[j].y > mouseY &&
                    mouseX <
                        ((coord[j].x - coord[i].x) * (mouseY - coord[i].y)) / (coord[j].y - coord[i].y) + coord[i].x;
                if (intersect) {
                    inside = !inside;
                }
            }
            return inside;
        } catch (err) {
            console.log('insidePolygonArea', err);
            return false;
        }
    }

    private calPolygonArea({ coorPt }: Polygons): number {
        try {
            let area: number = 0;
            let j = coorPt.length - 1;
            for (let i = 0; i < coorPt.length; ++i) {
                area += (coorPt[j].x + coorPt[i].x) * (coorPt[j].y - coorPt[i].y);
                j = i;
            }

            return Math.abs(area / 2.0);
        } catch (err) {
            console.log('calPolygonArea', err);
            return -1;
        }
    }

    findPolygonArea(mouseX: number, mouseY: number, { polygons }: PolyMetadata): number {
        try {
            let polyIndex: number = -1;
            let area: number = 10000000;
            for (let i = 0; i < polygons.length; ++i) {
                if (this.insidePolygonArea(polygons[i].coorPt, mouseX, mouseY)) {
                    const polyarea: number = this.calPolygonArea(polygons[i]);
                    if (polyarea < area) {
                        polyIndex = i;
                        area = polyarea;
                    }
                }
            }
            return polyIndex;
        } catch (err) {
            console.log('findPolygonArea', err);
            return -1;
        }
    }

    findClickPoint(mouseX: number, mouseY: number, pol: PolyMetadata): ClickPoint {
        try {
            let dist: number;
            const clickarea = { polygonIndex: -1, pointIndex: -1 };
            for (let i = 0; i < pol.polygons.length; ++i) {
                for (let j = 0; j < pol.polygons[i].coorPt.length; ++j) {
                    dist = Math.sqrt(
                        Math.pow(mouseX - pol.polygons[i].coorPt[j].x, 2) +
                            Math.pow(mouseY - pol.polygons[i].coorPt[j].y, 2),
                    );
                    if (dist <= this.radius) {
                        clickarea.polygonIndex = i;
                        clickarea.pointIndex = j;
                        break;
                    }
                }
            }
            return clickarea;
        } catch (err) {
            console.log('findClickPoint', err);
            return { polygonIndex: -1, pointIndex: -1 };
        }
    }

    isNewPolygon() {
        try {
            return this.isNewPoly;
        } catch (err) {
            console.log('isNewPolygon', err);
            return false;
        }
    }

    deleteSinglePolygon(pol: PolyMetadata, index: number, callback: (agrs: boolean) => any) {}

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

    panPolygons({ polygons }: PolyMetadata, imgX: number, imgY: number, isDraw: boolean) {
        try {
            if (isDraw && this.tmpPolygon) {
                for (const [i] of this.tmpPolygon.coorPt.entries()) {
                    this.tmpPolygon.coorPt[i].x = imgX + this.tmpPolygon.coorPt[i].distancetoImg.x;
                    this.tmpPolygon.coorPt[i].y = imgY + this.tmpPolygon.coorPt[i].distancetoImg.y;
                }
            }
            for (const [i] of polygons.entries()) {
                for (const [j] of polygons[i].coorPt.entries()) {
                    polygons[i].coorPt[j].x = imgX + polygons[i].coorPt[j].distancetoImg.x;
                    polygons[i].coorPt[j].y = imgY + polygons[i].coorPt[j].distancetoImg.y;
                }
            }
        } catch (err) {
            console.log('panPolygons', err);
        }
    }

    //  setCurrentSelectedimgidx(idx: number | undefined) {
    //     try {
    //         this.CurrentSelectedImg.idx = idx!;
    //     } catch (err) {
    //         console.log('segmentation setCurrentSelectedimg(idx:number) ----> ', err.name + ': ', err.message);
    //     }
    // }

    //  setCurrentSelectedimguid(uid: number) {
    //     try {
    //         this.CurrentSelectedImg.uid = uid;
    //     } catch (err) {
    //         console.log('segmentation setCurrentSelectedimguid(uid:number) ----> ', err.name + ': ', err.message);
    //     }
    // }
}
