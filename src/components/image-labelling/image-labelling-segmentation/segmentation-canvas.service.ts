/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    Coordinate,
    DiffXY,
    Direction,
    FitScreenCalc,
    LabelInfo,
    Method,
    PolyMetadata,
    Polygons,
    xyCoordinate,
} from 'shared/types/labelling-type/image-labelling.model';

import { Injectable } from '@angular/core';
import { Utils } from 'util/utils';
import { cloneDeep } from 'lodash-es';

interface ExtendedMouseEvent extends MouseEvent {
    layerX: number;
    layerY: number;
}

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
    private clipPath: Path2D | null = null;
    private radius: number = 3.5;
    private distanceOffset: number = 8;
    private tmpPolygon!: Polygons | null;
    private polygonAreaIndex: number = -1;
    private selectedPolygonIndex: number = -1;
    private util: Utils = new Utils();
    private isNewPoly: boolean = false;
    private labelList: LabelInfo[] = [];
    private labelColorList!: Map<string, string>;
    // private currentSelectedImg = { uid: -1, idx: -1 };

    constructor() {}

    mouseDownDraw(
        event: ExtendedMouseEvent,
        metadata: PolyMetadata,
        canvas: HTMLCanvasElement,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        ctrlKey: boolean,
        altKey: boolean,
        labelList: LabelInfo[],
    ): number {
        this.labelList = labelList;
        const { offsetX, offsetY } = event;
        this.polygonAreaIndex = this.findPolygonArea(event, metadata);
        this.clickPoint = this.findClickPoint(offsetX, offsetY, metadata);
        const isNewPolygon = this.isNewPolygon();
        if (isNewPolygon && ctrlKey) {
            // console.log('mouseDownDraw if 0');
            this.setPanXY(event);
        } else if (!this.returnTempPoly() && this.polygonAreaIndex < 0 && this.clickPoint.pointIndex < 0) {
            // console.log('mouseDownDraw else if 1');
            // this.setGlobalXY(event);
            // this.setPanXY({ offsetX, offsetY });
            this.setPolygonLineWidth(metadata, -1);
            this.selectedPolygonIndex = -1;
            this.pushTempPoint(event, metadata);
            this.setNewPolygon(true);
        } else if (isNewPolygon) {
            // console.log('mouseDownDraw else if 2');
            this.pushTempPoint(event, metadata);
            this.drawNewPolygon(metadata, img, context, canvas, false);
            this.drawfromPreviousPoint(event, context);
        } else {
            // console.log('mouseDownDraw else');
            this.selectedPolygonIndex =
                this.findPolygonArea(event, metadata) > -1
                    ? this.findPolygonArea(event, metadata)
                    : this.findClickPoint(offsetX, offsetY, metadata).polygonIndex;
            this.setPolygonLineWidth(metadata, this.selectedPolygonIndex);
            this.setNewPolygon(false);
        }
        return this.selectedPolygonIndex;
    }

    mouseMoveDraw(
        metadata: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        event: ExtendedMouseEvent,
        ctrlDown: boolean,
        isMouseDown: boolean,
        redrawCallback: (arg: Method) => void,
    ) {
        const detectedPolygon = this.findPolygonArea(event, metadata);
        const isNewPolygon = this.isNewPolygon();
        const { pointIndex, polygonIndex } = this.clickPoint;
        // isNewPolygon false value check
        // because mousemove to draw doesn't mean polygon is completed
        if (isNewPolygon && isMouseDown && ctrlDown) {
            // console.log('mouseMoveDraw if');
            const { diffX, diffY } = this.getDiffXY(event);
            metadata.img_x = diffX;
            metadata.img_y = diffY;
            this.panPolygons(metadata, true);
            redrawCallback('pan');
        } else if (isNewPolygon) {
            // console.log('mouseMoveDraw else if 2');
            this.drawNewPolygon(metadata, img, context, canvas, false);
            this.drawfromPreviousPoint(event, context);
        } else if (isMouseDown && pointIndex === -1 && this.selectedPolygonIndex > -1) {
            // } else if (isMouseDown && pointIndex > -1 && polygonIndex > -1) {
            // console.log('mouseMoveDraw else if 1');
            this.mouseMovePolygon(event, metadata, context, this.selectedPolygonIndex, img, canvas);
            this.resetClipPath(metadata);
            redrawCallback('pan');
        } else {
            // check if mouse clicked on polygon's dot
            if (isMouseDown && pointIndex > -1 && polygonIndex > -1) {
                // console.log('mouseMoveDraw else');
                this.setPolygonCoordinate(event, metadata, this.clickPoint);
                redrawCallback('draw');
            }
        }
        return detectedPolygon > -1;
    }

    setPanXY({ offsetX, offsetY }: Pick<MouseEvent, 'offsetX' | 'offsetY'>) {
        try {
            this.panXY = {
                x: offsetX,
                y: offsetY,
            };
        } catch (err) {
            console.log('setPanXY', err);
        }
    }

    getPanXY() {
        return this.panXY;
    }

    getDiffXY({ offsetX, offsetY }: MouseEvent): DiffXY {
        try {
            const panObj: DiffXY = { diffX: 0, diffY: 0 };

            const { x, y } = this.getGlobalXY();
            panObj.diffX = x + (offsetX - this.panXY.x);
            panObj.diffY = y + (offsetY - this.panXY.y);

            return panObj;
        } catch (err) {
            console.log(err);
            return { diffX: -1, diffY: -1 };
        }
    }

    setSelectedPolygon(index: number, metadata?: PolyMetadata) {
        this.selectedPolygonIndex = index;
        metadata && this.setPolygonLineWidth(metadata, this.selectedPolygonIndex);
    }

    getSelectedPolygonIndex() {
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

    private pushTempPoint({ offsetX, offsetY }: MouseEvent, { img_x, img_y, polygons }: PolyMetadata) {
        try {
            const distancetoX = offsetX - img_x;
            const distancetoY = offsetY - img_y;
            const length = polygons.length;
            !this.tmpPolygon && this.generateNewTempPolygon(length);

            // tslint:disable-next-line: no-non-null-assertion
            this.tmpPolygon!.coorPt.push({
                x: offsetX,
                y: offsetY,
                distancetoImg: { x: distancetoX, y: distancetoY },
            });
        } catch (err) {
            console.log('pushTempPoint', err);
        }
    }

    removeLastPoint(
        metadata: PolyMetadata,
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvas: HTMLCanvasElement,
    ): boolean {
        try {
            if (this.tmpPolygon?.coorPt && this.tmpPolygon.coorPt.length > 1) {
                this.tmpPolygon.coorPt.pop();
                return false;
            } else {
                this.resetDrawing(metadata, img, context, canvas);
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

    generateNewTempPolygon(len: number) {
        try {
            const uuid: number = this.util.generateUniquesID();
            const tmpRegion: string = (len + 1).toString();
            this.tmpPolygon = {
                coorPt: [],
                label: this.labelList.length > 0 ? this.labelList[0].name : '',
                id: uuid,
                lineWidth: 2,
                color: 'rgba(0,255,0,1.0)',
                region: tmpRegion,
                subLabel: [],
            };
        } catch (err) {
            console.log('generateNewTempPolygon', err);
        }
    }

    getClickPoint() {
        return this.clickPoint;
    }

    resetClickPoint() {
        this.clickPoint = {
            pointIndex: -1,
            polygonIndex: -1,
        };
    }

    resetDrawing(
        metadata: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
    ) {
        try {
            this.tmpPolygon = null;
            this.setNewPolygon(false);
            this.redraw(metadata, img, context, canvas, -1);
        } catch (err) {
            console.log('resetDrawing', err);
        }
    }

    private setNewPolygon(state: boolean) {
        this.isNewPoly = state;
    }

    redraw(
        metadata: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        { width, height }: HTMLCanvasElement,
        polyIndex: number,
    ) {
        try {
            const { img_w, img_h, img_x, img_y } = metadata;
            context.restore();
            context.clearRect(0, 0, width, height);
            context.save();
            context.beginPath();
            context.rect(img_x, img_y, img_w, img_h);
            context.clip();
            context.beginPath();
            context.drawImage(img, img_x, img_y, img_w, img_h);
            this.drawAllPolygon(metadata, context, polyIndex, this.labelColorList);
        } catch (err) {
            console.log('redraw', err);
        }
    }

    drawAllPolygon(
        metadata: PolyMetadata,
        context: CanvasRenderingContext2D,
        polyIndex: number,
        labelColorList: Map<string, string>,
    ) {
        try {
            this.labelColorList = labelColorList;
            if (this.validatePolygonMetadata(metadata.polygons)) {
                if (this.selectedPolygonIndex === -1) {
                    this.drawAllPolygonLine(metadata, context);
                    this.drawAllPolygonsDots(metadata, context, polyIndex, this.radius);
                    this.plotAllFloatLabel(metadata, context);
                }

                if (this.selectedPolygonIndex !== -1) {
                    this.assignLabelColorAndDrawPolygon(metadata, context, polyIndex);
                }
            }
        } catch (err) {
            console.log('drawAllPolygon', err);
        }
    }

    private assignLabelColorAndDrawPolygon(
        metadata: PolyMetadata,
        context: CanvasRenderingContext2D,
        polyIndex: number,
    ) {
        // For assign color according to label
        metadata.polygons = metadata.polygons.map((poly) => ({
            ...poly,
            color: this.labelColorList.get(poly.label) as string,
        }));
        this.drawAllPolygonLine(metadata, context);
        this.drawAllPolygonsDots(metadata, context, polyIndex, this.radius);
        this.plotAllFloatLabel(metadata, context);
    }

    private validatePolygonMetadata(polygons: Polygons[]) {
        return polygons.length > 0 ? true : false;
    }

    private drawAllPolygonLine({ polygons }: PolyMetadata, context: CanvasRenderingContext2D) {
        try {
            for (const [_, { lineWidth, color, coorPt }] of polygons.entries()) {
                context.lineWidth = lineWidth;
                context.strokeStyle = color || 'white';
                context.fillStyle = color || 'white';
                context.beginPath();
                context.moveTo(coorPt[0].x, coorPt[0].y);
                for (const [j] of coorPt.entries()) {
                    j + 1 < coorPt.length && context.lineTo(coorPt[j + 1].x, coorPt[j + 1].y);
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
        polygonIndex: number,
        radius: number,
    ) {
        try {
            for (const [i, { coorPt, color }] of polygons.entries()) {
                if (polygonIndex === i) {
                    context.strokeStyle = color;
                    context.fillStyle = color;
                    for (const [j] of coorPt.entries()) {
                        context.beginPath();
                        context.arc(coorPt[j].x, coorPt[j].y, radius, 0, 2 * Math.PI);
                        context.fill();
                        context.closePath();
                        context.stroke();
                    }
                }
            }
        } catch (err) {
            console.log('drawAllPolygonsDots', err);
        }
    }

    private plotAllFloatLabel({ polygons }: PolyMetadata, context: CanvasRenderingContext2D) {
        try {
            polygons.forEach(({ label, coorPt }) => {
                const { x, y } = coorPt[0];
                context.strokeStyle = 'white';
                context.fillStyle = 'black';
                context.font = 'bold 12px Arial';
                context.strokeText(label, x + 10, y + 15);
                context.fillText(label, x + 10, y + 15);
            });
        } catch (err) {
            console.log('plotAllFloatLabel', err);
        }
    }

    setGlobalXY({ offsetX, offsetY }: Pick<MouseEvent, 'offsetX' | 'offsetY'>) {
        try {
            this.globalXY = {
                x: offsetX,
                y: offsetY,
            };
        } catch (err) {
            console.log('setGlobalXY', err);
        }
    }

    getGlobalXY() {
        return this.globalXY;
    }

    mouseMovePolygon(
        { offsetX, offsetY }: MouseEvent,
        pol: PolyMetadata,
        context: CanvasRenderingContext2D,
        polyIndex: number,
        img: HTMLImageElement,
        canvas: HTMLCanvasElement,
    ) {
        try {
            const { x, y } = this.getGlobalXY();
            const newoffsetX = offsetX - x;
            const newoffsetY = offsetY - y;

            if (
                this.withinPointPath(pol, polyIndex, {
                    offsetX: newoffsetX,
                    offsetY: newoffsetY,
                })
            ) {
                this.setGlobalXY({ offsetX, offsetY });
                for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                    pol.polygons[polyIndex].coorPt[i].x += newoffsetX;
                    pol.polygons[polyIndex].coorPt[i].y += newoffsetY;
                }
                this.redraw(pol, img, context, canvas, polyIndex);
            }
        } catch (err) {
            console.log('mouseMovePolygon', err);
        }
    }

    keyboardMovePolygon(
        pol: PolyMetadata,
        direction: Direction,
        polyIndex: number,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        callback: (arg: boolean) => void,
    ): boolean {
        try {
            if (polyIndex > -1) {
                const offset = -3;
                switch (direction) {
                    case 'up':
                        if (
                            this.withinPointPath(pol, polyIndex, {
                                offsetX: 0,
                                offsetY: offset,
                            })
                        ) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].y += offset;
                            }
                        }
                        break;
                    case 'down':
                        if (
                            this.withinPointPath(pol, polyIndex, {
                                offsetX: 0,
                                offsetY: offset,
                            })
                        ) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].y -= offset;
                            }
                        }
                        break;
                    case 'left':
                        if (
                            this.withinPointPath(pol, polyIndex, {
                                offsetX: offset,
                                offsetY: 0,
                            })
                        ) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].x += offset;
                            }
                        }
                        break;
                    case 'right':
                        if (
                            this.withinPointPath(pol, polyIndex, {
                                offsetX: offset,
                                offsetY: 0,
                            })
                        ) {
                            for (const [i] of pol.polygons[polyIndex].coorPt.entries()) {
                                pol.polygons[polyIndex].coorPt[i].x -= offset;
                            }
                        }
                        break;
                }
                this.redraw(pol, img, context, canvas, polyIndex);
                // this.validateXYDistance(pol);
                callback(true);
            }
            return true;
        } catch (err) {
            console.log('keyboardMovePolygon', err);
            return true;
        }
    }

    private withinPointPath(
        { polygons, img_x, img_y, img_w, img_h }: PolyMetadata,
        index: number,
        { offsetX, offsetY }: Pick<MouseEvent, 'offsetX' | 'offsetY'>,
    ) {
        try {
            for (const [i] of polygons[index].coorPt.entries()) {
                if (
                    polygons[index].coorPt[i].x + offsetX < img_x ||
                    polygons[index].coorPt[i].x + offsetX > img_x + img_w ||
                    polygons[index].coorPt[i].y + offsetY < img_y ||
                    polygons[index].coorPt[i].y + offsetY > img_y + img_h
                ) {
                    return false;
                } else {
                    return true;
                }
            }
        } catch (err) {
            return false;
        }
    }

    validateXYDistance(metadata: PolyMetadata) {
        try {
            for (const [i] of metadata.polygons.entries()) {
                for (const [j] of metadata.polygons[i].coorPt.entries()) {
                    const distancetoX = metadata.polygons[i].coorPt[j].x - metadata.img_x;
                    const distancetoY = metadata.polygons[i].coorPt[j].y - metadata.img_y;
                    metadata.polygons[i].coorPt[j].distancetoImg.x = distancetoX;
                    metadata.polygons[i].coorPt[j].distancetoImg.y = distancetoY;
                }
            }
        } catch (err) {
            console.log('validateXYDistance', err);
        }
    }

    setPolygonLineWidth(metadata: PolyMetadata, polyIndex: number) {
        try {
            metadata.polygons = metadata.polygons.map((poly, i) => ({
                ...poly,
                lineWidth: i === polyIndex ? 3 : 2,
            }));
        } catch (err) {
            console.log('setPolygonLineWidth', err);
        }
    }

    drawNewPolygon(
        pol: PolyMetadata,
        img: HTMLImageElement,
        context: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        closepath: boolean,
    ) {
        try {
            this.redraw(pol, img, context, canvas, -1);
            if (this.tmpPolygon?.coorPt) {
                for (const [_, { x, y }] of this.tmpPolygon.coorPt.entries()) {
                    context.strokeStyle = 'green';
                    context.fillStyle = 'green';
                    context.beginPath();
                    context.arc(x, y, this.radius, 0, 2 * Math.PI);
                    context.fill();
                    context.closePath();
                    context.stroke();
                }

                context.beginPath();
                context.lineWidth = this.tmpPolygon.lineWidth;
                context.strokeStyle = this.tmpPolygon.color;
                context.fillStyle = this.tmpPolygon.color;
                context.moveTo(this.tmpPolygon.coorPt[0].x, this.tmpPolygon.coorPt[0].y);

                for (const [i] of this.tmpPolygon.coorPt.entries()) {
                    if (i + 1 < this.tmpPolygon.coorPt.length) {
                        context.lineTo(this.tmpPolygon.coorPt[i + 1].x, this.tmpPolygon.coorPt[i + 1].y);
                    }
                }

                if (!closepath) {
                    context.stroke();
                } else {
                    context.closePath();
                    context.stroke();
                    const { length } = pol.polygons;
                    if (this.tmpPolygon) {
                        pol.polygons.push(cloneDeep(this.tmpPolygon));
                        this.setPolygonLineWidth(pol, length);
                        this.tmpPolygon = null;
                    }
                    this.setNewPolygon(false);
                    // this.redraw(pol, img, context, canvas, this.selectedPolygonIndex);
                }
            }
        } catch (err) {
            console.log('drawNewPolygon', err);
        }
    }

    private drawfromPreviousPoint(
        { offsetX, offsetY, layerX, layerY }: ExtendedMouseEvent,
        context: CanvasRenderingContext2D,
    ) {
        try {
            if (this.tmpPolygon?.coorPt) {
                const { length } = this.tmpPolygon.coorPt;
                const X = offsetX === 0 ? layerX : offsetX;
                const Y = offsetY === 0 ? layerY : offsetY;
                const newLength = length - 1;
                context.beginPath();
                context.moveTo(this.tmpPolygon.coorPt[newLength].x, this.tmpPolygon.coorPt[newLength].y);
                context.lineTo(X, Y);
                context.stroke();
            }
        } catch (err) {
            console.log('drawfromPreviousPoint', err);
        }
    }

    returnTempPoly() {
        try {
            const result = this.tmpPolygon;
            return result;
        } catch (err) {
            console.log('returnTempPoly', err);
            return null;
        }
    }

    setPolygonCoordinate(
        { offsetX, offsetY }: MouseEvent,
        metadata: PolyMetadata,
        { polygonIndex, pointIndex }: ClickPoint,
    ) {
        try {
            if (polygonIndex > -1 && pointIndex > -1) {
                metadata.polygons[polygonIndex].coorPt[pointIndex].x = offsetX;
                metadata.polygons[polygonIndex].coorPt[pointIndex].y = offsetY;
            }
        } catch (err) {
            console.log('setPolygonCoordinate', err);
        }
    }

    private insidePolygonArea(coord: Coordinate[], { offsetX, offsetY }: MouseEvent) {
        try {
            let inside = false;
            for (let i = 0, j = coord.length - 1; i < coord.length; j = i++) {
                const intersect =
                    coord[i].y > offsetY !== coord[j].y > offsetY &&
                    offsetX <
                        ((coord[j].x - coord[i].x) * (offsetY - coord[i].y)) / (coord[j].y - coord[i].y) + coord[i].x;
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

    findPolygonArea(event: MouseEvent, { polygons }: PolyMetadata): number {
        try {
            let polyIndex: number = -1;
            let area: number = 10000000;
            for (const [i, metadata] of polygons.entries()) {
                if (this.insidePolygonArea(metadata.coorPt, event)) {
                    const polyarea: number = this.calPolygonArea(metadata);
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

    deleteSinglePolygon(pol: PolyMetadata, index: number, callback: (agr: boolean) => void) {
        try {
            pol.polygons.splice(index, 1);
            this.selectedPolygonIndex = -1;
            callback(true);
            // this.ClearallBoundingboxList(this.seg.Metadata[this.seg.getCurrentSelectedimgidx()].polygons);
            // this.seg.Metadata[this.seg.getCurrentSelectedimgidx()].polygons.splice(this.CurrentSelectedPolygon, 1);
            // this.CreateNewBoundingBoxList(this.seg.Metadata[this.seg.getCurrentSelectedimgidx()].polygons);
            // this.CurrentSelectedPolygon = undefined;
        } catch (err) {
            console.log('deleteSinglePolygon', err);
        }
    }

    scalePolygons(metadata: PolyMetadata, { factor, newX, newY }: FitScreenCalc, callback?: (arg: boolean) => any) {
        try {
            for (const [i] of metadata.polygons.entries()) {
                for (const [j] of metadata.polygons[i].coorPt.entries()) {
                    metadata.polygons[i].coorPt[j].x = metadata.polygons[i].coorPt[j].distancetoImg.x * factor + newX;
                    metadata.polygons[i].coorPt[j].y = metadata.polygons[i].coorPt[j].distancetoImg.y * factor + newY;
                    metadata.polygons[i].coorPt[j].distancetoImg.x = metadata.polygons[i].coorPt[j].x - newX;
                    metadata.polygons[i].coorPt[j].distancetoImg.y = metadata.polygons[i].coorPt[j].y - newY;
                }
            }
            this.setPolygonLineWidth(metadata, -1);
            callback && callback(true);
        } catch (err) {
            console.log('scalePolygons', err);
        }
    }

    panPolygons(metadata: PolyMetadata, isDraw: boolean, callback?: (arg: boolean) => void) {
        try {
            if (isDraw && this.tmpPolygon?.coorPt) {
                for (const [i] of this.tmpPolygon.coorPt.entries()) {
                    this.tmpPolygon.coorPt[i].x = metadata.img_x + this.tmpPolygon.coorPt[i].distancetoImg.x;
                    this.tmpPolygon.coorPt[i].y = metadata.img_y + this.tmpPolygon.coorPt[i].distancetoImg.y;
                }
            }
            for (const [i] of metadata.polygons.entries()) {
                for (const [j] of metadata.polygons[i].coorPt.entries()) {
                    metadata.polygons[i].coorPt[j].x = metadata.img_x + metadata.polygons[i].coorPt[j].distancetoImg.x;
                    metadata.polygons[i].coorPt[j].y = metadata.img_y + metadata.polygons[i].coorPt[j].distancetoImg.y;
                }
            }
            callback && callback(true);
        } catch (err) {
            console.log('panPolygons', err);
        }
    }

    resetClipPath({ img_x, img_y, img_w, img_h }: PolyMetadata) {
        try {
            this.clipPath = null;
            this.clipPath = new Path2D();
            this.clipPath.rect(img_x, img_y, img_w, img_h);
        } catch (err) {
            console.log(err);
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
