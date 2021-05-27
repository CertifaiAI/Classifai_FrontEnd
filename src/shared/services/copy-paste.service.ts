/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        // let { x1, x2, y1, y2, id, distancetoImg } = rtMEMO;

        const tempW: number = rtMEMO.x2 - rtMEMO.x1;
        const tempH: number = rtMEMO.y2 - rtMEMO.y1;
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
