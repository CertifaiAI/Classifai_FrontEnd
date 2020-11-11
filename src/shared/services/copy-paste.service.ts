import { BoundingBox } from '../type-casting/meta-data/meta-data.model';
import { CopyPasteState, Polygons } from './../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';
import { Utils } from '../type-casting/utils/utils';

@Injectable({
    providedIn: 'any',
})
export class CopyPasteService {
    private MEMO: CopyPasteState = null;
    private utility: Utils = new Utils();
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
        const rtMEMO: Polygons = this.utility.deepCloneObject(this.MEMO);
        // tslint:disable-next-line: prefer-const
        let { coorPt: coorPtList, id } = rtMEMO;
        for (const coorPt of coorPtList) {
            coorPt.x += 8;
            coorPt.y += 8;
            coorPt.distancetoImg.x = 0;
            coorPt.distancetoImg.y = 0;
        }
        id = this.utility.generateUniquesID();
        return rtMEMO;
    }

    private boundingBoxPaste(): BoundingBox | null {
        const rtMEMO: BoundingBox = this.utility.deepCloneObject(this.MEMO);
        // tslint:disable-next-line: prefer-const
        let { x1, x2, y1, y2, id, distancetoImg } = rtMEMO;

        const tempW: number = x2 - x1;
        const tempH: number = y2 - y1;
        x1 += 8;
        y1 += 8;
        x2 = x1 + tempW;
        y2 = y1 + tempH;
        id = this.utility.generateUniquesID();
        distancetoImg.x = 0;
        distancetoImg.y = 0;
        return rtMEMO;
    }
}
