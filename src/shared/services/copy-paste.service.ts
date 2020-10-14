import { BoundingBox } from './../../classes/CustomType';
import { CopyPasteState, Polygons } from './../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';
import { utils } from '../../classes/utils';

@Injectable({
    providedIn: 'root',
})
export class CopyPasteService {
    private MEMO: CopyPasteState = null;
    private utility: utils = new utils();
    constructor() {}

    public copy(currMeta: CopyPasteState) {
        currMeta ? (this.MEMO = this.utility.deepCloneVariable(currMeta)) : {};
    }

    public paste(): CopyPasteState {
        if (this.MEMO) {
            if ('coorPt' in this.MEMO) {
                return this.polygonPaste();
            } else {
                return this.boundingBoxPaste();
            }
        }
        return null;
    }

    public isAvailable() {
        return this.MEMO ? true : false;
    }

    public clear() {
        this.MEMO = null;
    }

    private polygonPaste(): Polygons | null {
        let rtMEMO: Polygons = this.utility.deepCloneObject(this.MEMO);
        for (var i = 0; i < rtMEMO.coorPt.length; ++i) {
            rtMEMO.coorPt[i].x += 8;
            rtMEMO.coorPt[i].y += 8;
            rtMEMO.coorPt[i].distancetoImg.x = 0;
            rtMEMO.coorPt[i].distancetoImg.y = 0;
        }
        rtMEMO.id = this.utility.generateUniquesID();
        return rtMEMO;
    }

    private boundingBoxPaste(): BoundingBox | null {
        let rtMEMO: BoundingBox = this.utility.deepCloneObject(this.MEMO);
        let tempW: number = rtMEMO.x2 - rtMEMO.x1;
        let tempH: number = rtMEMO.y2 - rtMEMO.y1;
        rtMEMO.x1 += 8;
        rtMEMO.y1 += 8;
        rtMEMO.x2 = rtMEMO.x1 + tempW;
        rtMEMO.y2 = rtMEMO.y1 + tempH;
        rtMEMO.id = this.utility.generateUniquesID();
        rtMEMO.distancetoImg.x = 0;
        rtMEMO.distancetoImg.y = 0;
        return rtMEMO;
    }
}
