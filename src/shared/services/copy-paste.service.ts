import { Boundingbox, Polygons, CompleteMetadata } from 'src/components/image-labelling/image-labelling.model';
import { Injectable } from '@angular/core';
import { Utils } from '../types/utils/utils';

@Injectable({
    providedIn: 'any',
})
export class CopyPasteService {
    private MEMO: CompleteMetadata | null = null;
    private utility: Utils = new Utils();
    constructor() {}

    public copy<T>(currMeta: T) {
        this.MEMO = this.utility.deepCloneVariable(currMeta);
    }

    // temporary cheat the generic type via any
    public paste<T>(): T {
        if (this.MEMO) {
            if ('coorPt' in this.MEMO) {
                return this.polygonPaste() as any;
            } else {
                return this.boundingBoxPaste() as any;
            }
        }
        return null as any;
    }

    public isAvailable() {
        return this.MEMO ? true : false;
    }

    public clear() {
        this.MEMO = null;
    }

    private polygonPaste(): Polygons {
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

    private boundingBoxPaste(): Boundingbox {
        const rtMEMO: Boundingbox = this.utility.deepCloneObject(this.MEMO);
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
