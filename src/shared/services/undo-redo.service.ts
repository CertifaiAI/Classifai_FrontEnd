/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { Utils } from '../types/utils/utils';
import {
    BboxMetadata,
    Boundingbox,
    Method,
    Polygons,
    PolyMetadata,
    UndoState,
} from 'src/components/image-labelling/image-labelling.model';

@Injectable({
    providedIn: 'any',
})
export class UndoRedoService {
    private currentArr: Array<UndoState> = [];
    private undoArr: Array<UndoState> = [];
    private redoArr: Array<UndoState> = [];
    private maxStageSize: number = 51;
    private allowUndo: boolean = false;
    private allowRedo: boolean = false;
    private utility: Utils = new Utils();

    constructor() {}

    public getCurrentArray() {
        return {
            undoArr: this.undoArr,
            redoArr: this.redoArr,
            curr: this.currentArr,
        };
    }

    private removeLastArray = (arr: UndoState[]): UndoState => arr.splice(-1, 1)[0];

    public appendStages(stages: UndoState): void {
        if (stages) {
            this.redoArr = [];
            this.allowRedo = false;
            this.currentArr.length === 0
                ? this.currentArr.push(this.utility.deepCloneVariable(stages))
                : (this.undoArr.length === this.maxStageSize ? this.undoArr.splice(0, 1) : {},
                  this.undoArr.push(this.removeLastArray(this.currentArr)),
                  this.currentArr.push(this.utility.deepCloneVariable(stages)),
                  (this.allowUndo = true));
        }
    }

    public clearAllStages(): void {
        this.currentArr = [];
        this.undoArr = [];
        this.redoArr = [];
        this.allowUndo = false;
        this.allowRedo = false;
    }

    public undo(): UndoState {
        this.allowRedo = true;
        if (this.undoArr.length > 0) {
            this.redoArr.push(this.removeLastArray(this.currentArr));
            const tmpStages: UndoState = this.removeLastArray(this.undoArr);
            this.currentArr.push(tmpStages);
            this.undoArr.length === 0 ? (this.allowUndo = false) : (this.allowUndo = true);
            return tmpStages;
        }
        return null;
    }

    public redo(): UndoState {
        let tmpStages: UndoState = null;
        if (this.redoArr.length !== 0) {
            this.undoArr.push(this.removeLastArray(this.currentArr));
            tmpStages = this.removeLastArray(this.redoArr);
            this.currentArr.push(tmpStages);
            this.redoArr.length === 0 ? (this.allowRedo = false) : (this.allowRedo = true);
        }
        this.undoArr.length > 0 ? (this.allowUndo = true) : (this.allowUndo = false);

        return tmpStages;
    }

    public clearRedundantStages() {
        // TODO:Solve bugs here
        /** Daniel: Unable to shortcut code logic due to the Type embedded into 'currentArr.meta' prop */
        if (this.currentArr[0]?.meta && 'polygons' in this.currentArr[0].meta) {
        } else {
            if (this.undoArr.length > 0) {
                const last2Stages: boolean = this.isStateChange(
                    (this.undoArr[this.undoArr.length - 1]?.meta as BboxMetadata).bnd_box,
                );
                last2Stages ? (this.currentArr.pop(), this.currentArr.push(this.removeLastArray(this.undoArr))) : {};
            }
        }
    }

    public isAllowRedo() {
        return this.allowRedo;
    }

    public isAllowUndo() {
        return this.allowUndo;
    }

    public isMethodChange(currMethod: Method): boolean {
        if (this.currentArr[0]?.method !== currMethod) {
            return true;
        }
        return false;
    }

    public replaceStages(stages: UndoState) {
        stages && (this.currentArr[0] = this.utility.deepCloneVariable(stages));
    }

    public isStateChange(notate: Boundingbox[] | Polygons[] | null) {
        if (!notate) {
            return false;
        }
        if ((notate && this.isAnnotationChange(notate)) || this.isLabelChange(notate)) {
            return true;
        }
        return false;
    }

    private isLabelChange(notate: Boundingbox[] | Polygons[] | null): boolean {
        /** Daniel: Unable to shortcut code logic due to the Type embedded into 'currentArr.meta' prop */
        if (this.currentArr[0]?.meta && 'polygons' in this.currentArr[0]?.meta) {
            const polybox: Polygons[] = notate as Polygons[];
            const comparePolyBoxes: Polygons[] = (this.currentArr[0]?.meta as PolyMetadata).polygons;
            if (polybox.length !== comparePolyBoxes.length) {
                return true;
            } else {
                for (const [i, { label }] of comparePolyBoxes.entries()) {
                    label !== polybox[i].label ? true : null;
                }
            }
        } else {
            const bndBox: Boundingbox[] = notate as Boundingbox[];
            const compareBndBox: Boundingbox[] = (this.currentArr[0]?.meta as BboxMetadata).bnd_box;
            if (bndBox.length !== compareBndBox.length) {
                return true;
            } else {
                for (const [i, { label }] of compareBndBox.entries()) {
                    if (bndBox[i].label !== label) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private isAnnotationChange(notate: Boundingbox[] | Polygons[] | null) {
        /** Daniel: Unable to shortcut code logic due to the Type embedded into 'currentArr.meta' prop */
        if (this.currentArr[0]?.meta && 'polygons' in this.currentArr[0]?.meta) {
            if (this.currentArr.length < 1) {
                return true;
            } else {
                const polygons: Polygons[] = notate as Polygons[];
                const comparePolygons: Polygons[] = (this.currentArr[0]?.meta as PolyMetadata).polygons;
                if (polygons.length !== comparePolygons.length) {
                    return true;
                } else {
                    const compareResult: boolean = comparePolygons.some(({ coorPt: compareCoorPt }, i) =>
                        polygons.some(
                            ({ coorPt: oriCoorPt }, j) =>
                                compareCoorPt[i].x !== oriCoorPt[j].x || compareCoorPt[i].y !== oriCoorPt[j].y,
                        ),
                    );
                    return compareResult ? true : null;
                }
            }
        } else {
            if (this.currentArr.length < 1) {
                return true;
            } else {
                const thisBox: Boundingbox[] = notate as Boundingbox[];
                const compareBox: Boundingbox[] = (this.currentArr[0]?.meta as BboxMetadata).bnd_box;
                if (thisBox.length !== compareBox.length) {
                    return true;
                } else {
                    for (const [i, { x1, x2, y1, y2, label }] of thisBox.entries()) {
                        // if condition is true, stop the loop and return true
                        if (
                            Math.ceil(x1) !== Math.ceil(compareBox[i].x1) ||
                            Math.ceil(x2) !== Math.ceil(compareBox[i].x2) ||
                            Math.ceil(y1) !== Math.ceil(compareBox[i].y1) ||
                            Math.ceil(y2) !== Math.ceil(compareBox[i].y2) ||
                            label !== compareBox[i].label
                        ) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
