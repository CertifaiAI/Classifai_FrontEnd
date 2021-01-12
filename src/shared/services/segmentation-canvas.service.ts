import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Utils } from '../../shared/type-casting/utils/utils';
import { Polygons, PolyMeta } from '../../layouts/image-labelling-layout/image-labelling-layout.model';

@Injectable({
    providedIn: 'any',
})
export class SegmentationCanvasService {
    private tmpPolygon!: Polygons | null;
    private radius: number = 3.5;
    private util: Utils = new Utils();
    private GlobalXY: { x: number; y: number } = { x: -1, y: -1 };
    private isNewPoly: Boolean = false;
    private CurrentSelectedImg = { uid: -1, idx: -1 };
    private distanceOffset: number = 8;

    constructor() {}

    public pushTmpPoint(mouseX: number, mouseY: number, imgX: number, imgY: number) {
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
                this.generateNewtmpPolygon(1);
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
        pol: PolyMeta[],
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
        pol: PolyMeta[],
        context: CanvasRenderingContext2D,
        img: HTMLImageElement,
        canvasW: number,
        canvasH: number,
    ) {
        try {
            this.tmpPolygon = null;
            this.setNewpolygon(false);
            this.redraw(
                pol,
                img,
                context,
                canvasW,
                canvasH,
                pol[this.CurrentSelectedImg.idx].img_w,
                pol[this.CurrentSelectedImg.idx].img_h,
                pol[this.CurrentSelectedImg.idx].img_x,
                pol[this.CurrentSelectedImg.idx].img_y,
                -1,
            );
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
        pol: PolyMeta[],
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

    public DrawAllPolygons(pol: PolyMeta[], context: CanvasRenderingContext2D, selectpolygon: number) {
        try {
            // if(this.Metadata[this.CurrentSelectedImg.idx].polygons.length < 1 || selectpolygon === -1){return;}
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

    private drawAllPolygonsLine(pol: PolyMeta[], context: CanvasRenderingContext2D, len: number) {
        try {
            for (var i = 0; i < len; ++i) {
                context.lineWidth = pol[this.CurrentSelectedImg.idx].polygons[i].lineWidth;
                context.strokeStyle = pol[this.CurrentSelectedImg.idx].polygons[i].color;
                context.fillStyle = pol[this.CurrentSelectedImg.idx].polygons[i].color;
                context.beginPath();
                context.moveTo(
                    pol[this.CurrentSelectedImg.idx].polygons[i].coorPt[0].x,
                    pol[this.CurrentSelectedImg.idx].polygons[i].coorPt[0].y,
                );
                for (var j = 0; j < pol[this.CurrentSelectedImg.idx].polygons[i].coorPt.length; ++j) {
                    if (j + 1 < pol[this.CurrentSelectedImg.idx].polygons[i].coorPt.length) {
                        context.lineTo(
                            pol[this.CurrentSelectedImg.idx].polygons[i].coorPt[j + 1].x,
                            pol[this.CurrentSelectedImg.idx].polygons[i].coorPt[j + 1].y,
                        );
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
        pol: PolyMeta[],
        context: CanvasRenderingContext2D,
        selectedpolygon: number,
        radius: number,
        len: number,
    ) {
        try {
            for (var q = 0; q < len; ++q) {
                // context.strokeStyle = this.Metadata[this.CurrentSelectedImg.idx].polygons[q].color;
                // context.fillStyle = this.Metadata[this.CurrentSelectedImg.idx].polygons[q].color;
                if (q !== selectedpolygon) {
                    continue;
                }
                context.strokeStyle = 'green';
                context.fillStyle = 'green';
                for (var k = 0; k < pol[this.CurrentSelectedImg.idx].polygons[q].coorPt.length; ++k) {
                    context.beginPath();
                    context.arc(
                        pol[this.CurrentSelectedImg.idx].polygons[q].coorPt[k].x,
                        pol[this.CurrentSelectedImg.idx].polygons[q].coorPt[k].y,
                        radius,
                        0,
                        2 * Math.PI,
                    );
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

    private plotAllFloatLabel(pol: PolyMeta[], len: number) {
        try {
            this.clearAllDIV(pol, 1);
            for (var i = 0; i < len; ++i) {
                // this.util.RemoveHTMLElement("float_" + this.Metadata[this.getCurrentSelectedimgidx()].polygons[i].id.toString());
                let regionAtt = pol[this.CurrentSelectedImg.idx].polygons[i].regionatt.toString();
                let uuids = pol[this.CurrentSelectedImg.idx].polygons[i].id;
                let tempdiv = this.createDIV(
                    regionAtt,
                    uuids,
                    pol[this.CurrentSelectedImg.idx].polygons[i].coorPt[0].x,
                    pol[this.CurrentSelectedImg.idx].polygons[i].coorPt[0].y,
                );
                document.getElementById('')!.appendChild(tempdiv!);
            }
        } catch (err) {
            console.log('segmentation plotAllFloatLabel() ----> ', err.name + ': ', err.message);
        }
    }

    public clearAllDIV(pol: PolyMeta[], len: number) {
        try {
            if (this.CurrentSelectedImg.idx !== undefined && this.CurrentSelectedImg.idx !== null) {
                for (var i = 0; i < len; ++i) {
                    this.util.RemoveHTMLElement('float_' + pol[this.CurrentSelectedImg.idx].polygons[i].id.toString());
                }
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
}
