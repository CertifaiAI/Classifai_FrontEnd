import { BoundingBox, Metadata } from './../../classes/CustomType';
import { UndoState, Polygons, PolyMeta } from './../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';
import { utils } from '../../classes/utils';

@Injectable({
    providedIn: 'any',
})
export class UndoRedoService {
    private CurrentArr: Array<UndoState> = [];
    private UndoArr: Array<UndoState> = [];
    private RedoArr: Array<UndoState> = [];
    private MaxStageSize: number = 51;
    private allowUndo: boolean = false;
    private allowRedo: boolean = false;
    private utility: utils = new utils();

    constructor() {}

    public appendStages(stages: UndoState): void {
        if (stages && stages !== null) {
            this.RedoArr = [];
            this.allowRedo = false;
            this.CurrentArr.length === 0
                ? this.CurrentArr.push(this.utility.deepCloneVariable(stages))
                : (this.UndoArr.length === this.MaxStageSize ? this.UndoArr.splice(0, 1) : {},
                  this.UndoArr.push(this.CurrentArr.pop()!),
                  this.CurrentArr.push(this.utility.deepCloneVariable(stages)),
                  (this.allowUndo = true));
        }
    }

    public clearAllStages(): void {
        this.CurrentArr = [];
        this.UndoArr = [];
        this.RedoArr = [];
        this.allowUndo = false;
        this.allowRedo = false;
    }

    public undo(): UndoState {
        this.allowRedo = true;
        if (this.UndoArr.length !== 0) {
            this.RedoArr.push(this.CurrentArr.pop()!);
            let tmpStages: UndoState = this.UndoArr.pop()!;
            this.CurrentArr.push(tmpStages);
            this.UndoArr.length === 0 ? (this.allowUndo = false) : (this.allowUndo = true);
            return tmpStages;
        }
        return null;
    }

    public redo(): UndoState {
        let tmpStages: UndoState = null;
        if (this.RedoArr.length !== 0) {
            this.UndoArr.push(this.CurrentArr.pop()!);
            tmpStages = this.RedoArr.pop()!;
            this.CurrentArr.push(tmpStages);
            this.RedoArr.length === 0 ? (this.allowRedo = false) : (this.allowRedo = true);
        }
        this.UndoArr.length > 0 ? (this.allowUndo = true) : (this.allowUndo = false);

        return tmpStages;
    }

    public clearRedundantStages() {
        if ('Polygons' in this.CurrentArr[0]?.meta!) {
        } else {
            if (this.UndoArr.length > 0) {
                let last2Stages: boolean = this.isStatgeChange(
                    (this.UndoArr[this.UndoArr.length - 1]?.meta as Metadata).bnd_box,
                );
                last2Stages ? (this.CurrentArr.pop(), this.CurrentArr.push(this.UndoArr.pop()!)) : {};
            }
        }
    }

    public isAllowRedo() {
        return this.allowRedo;
    }

    public isAllowUndo() {
        return this.allowUndo;
    }

    public isMethodChange(currMethod: string): boolean {
        if (this.CurrentArr[0]?.method !== currMethod) {
            return true;
        }
        return false;
    }

    public replaceStages(stages: UndoState) {
        stages ? (this.CurrentArr[0] = this.utility.deepCloneVariable(stages)) : {};
    }

    public isStatgeChange(notate: BoundingBox[] | Polygons[] | null): boolean {
        if (notate === null || notate === undefined) {
            return false;
        }
        if (this.isAnnotationChange(notate) || this.isLabelChange(notate)) {
            return true;
        }
        return false;
    }

    private isLabelChange(notate: BoundingBox[] | Polygons[] | null): boolean {
        if ('Polygons' in this.CurrentArr[0]?.meta!) {
            let polybox: Polygons[] = notate as Polygons[];
            let comparepolybox: Polygons[] = (this.CurrentArr[0]?.meta as PolyMeta).polygons;
            if (polybox.length !== comparepolybox.length) {
                return true;
            } else {
                for (var j = 0; j < comparepolybox.length; ++j) {
                    if (polybox[j].label !== comparepolybox[j].label) {
                        return true;
                    }
                }
            }
        } else {
            let bndbox: BoundingBox[] = notate as BoundingBox[];
            let comparebndbox: BoundingBox[] = (this.CurrentArr[0]?.meta as Metadata).bnd_box;
            if (bndbox.length !== comparebndbox.length) {
                return true;
            } else {
                for (var i = 0; i < comparebndbox.length; i++) {
                    if (bndbox[i].label !== comparebndbox[i].label) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private isAnnotationChange(notate: BoundingBox[] | Polygons[] | null) {
        if ('Polygons' in this.CurrentArr[0]?.meta!) {
            let thisPoly: Polygons[] = notate as Polygons[];
            let comparePoly: Polygons[] = (this.CurrentArr[0]?.meta as PolyMeta).polygons;
            if (thisPoly.length !== comparePoly.length) {
                return true;
            } else {
                for (var i = 0; i < comparePoly.length; ++i) {
                    for (var j = 0; j < comparePoly[i].coorPt.length; ++j) {
                        if (
                            comparePoly[i].coorPt[j].x !== thisPoly[i].coorPt[j].x ||
                            comparePoly[i].coorPt[j].y !== thisPoly[i].coorPt[j].y
                        ) {
                            return true;
                        }
                    }
                }
            }
        } else {
            let thisbox: BoundingBox[] = notate as BoundingBox[];
            let comparebox: BoundingBox[] = (this.CurrentArr[0]?.meta as Metadata).bnd_box;
            if (thisbox.length !== comparebox.length) {
                return true;
            } else {
                for (var i = 0; i < thisbox.length; ++i) {
                    if (
                        thisbox[i].x1 !== comparebox[i].x1 ||
                        thisbox[i].x2 != comparebox[i].x2 ||
                        thisbox[i].y1 != comparebox[i].y1 ||
                        thisbox[i].y2 != comparebox[i].y2
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
