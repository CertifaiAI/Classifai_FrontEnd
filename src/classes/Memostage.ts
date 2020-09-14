import type { Boundingbox, stages } from './CustomType';
import { utils } from './utils';

export class BndStageMemo {
    private stages_: stages[] = [];
    private MaxStageSize = 51;
    private utils: utils;
    constructor() {
        this.utils = new utils();
    }

    public SaveStages(stages: stages) {
        try {
            if (stages) {
                if (this.stages_.length >= this.MaxStageSize) {
                    this.stages_.shift();
                }
                this.stages_.push(this.utils.DeepCloneObject(stages));
            }
        } catch (err) {
            console.log('SaveStages(stages) in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }

    public UndoStages(): { undostage: stages; currentstage: stages } {
        try {
            if (this.stages_.length > 0) {
                let ret = { undostage: undefined, currentstage: undefined };
                if (this.stages_.length > 1) {
                    ret.currentstage = this.stages_.pop();
                    ret.undostage = this.stages_.pop();
                    return ret;
                }
                ret.undostage = this.stages_.pop();
                return ret;
            } else {
                alert('There no save stages.');
                return null;
            }
        } catch (err) {
            console.log('UndoStages() in BndStageMemo ----> ', err.name + ': ', err.message);
            return null;
        }
    }

    public replaceStages(stages: stages) {
        try {
            if (stages && this.stages_.length > 0) {
                this.stages_[this.stages_.length - 1] = this.utils.DeepCloneObject(stages);
            }
        } catch (err) {
            console.log('replaceStages(stages:stages) in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }

    public ClearStages() {
        try {
            if (this.stages_.length > 0) {
                this.stages_ = [];
            }
        } catch (err) {
            console.log('ClearStages() in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }

    public ClearlastStages() {
        try {
            this.stages_.splice(-1, 1);
        } catch (err) {
            console.log('ClearlastStages() in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }

    public DeleteStages(startElem: number, totalElem: number) {
        try {
            this.stages_.splice(startElem, totalElem);
        } catch (err) {
            console.log(
                'DeleteStages(startElem:number, totalElem:number) in BndStageMemo ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public ClearReduncentStages() {
        try {
            if (this.stages_[this.stages_.length - 2] !== null && this.stages_[this.stages_.length - 2] !== undefined) {
                let isStage2change: boolean = this.CheckIsChanges(this.stages_[this.stages_.length - 2].stage.bndbox);
                if (!isStage2change) {
                    this.DeleteStages(-1, 1);
                }
            }
        } catch (err) {
            console.log('ClearReduncentStages() in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }

    public getMaxStageSize() {
        try {
            return this.MaxStageSize;
        } catch (err) {
            console.log('getMaxStageSize() in BndStageMemo ----> ', err.name + ': ', err.message);
            return null;
        }
    }

    public CheckIsChanges(BndBoxList: Boundingbox[]): boolean {
        try {
            if (BndBoxList === null || BndBoxList === undefined) {
                return false;
            }
            let lastMetBoxes: Boundingbox[] = this.stages_[this.stages_.length - 1].stage.bndbox;
            let isbndBchg: boolean = this.isBndBoxChange(lastMetBoxes, BndBoxList);
            let islabelChange: boolean = this.islabelChange(lastMetBoxes, BndBoxList);
            if (isbndBchg || islabelChange) {
                return true;
            }
            return false;
        } catch (err) {
            console.log('CheckIsChanges(bndbox:Boundingbox) in BndStageMemo ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public isMethodChange(comparemethod: string): boolean {
        try {
            let thismethod = this.stages_[this.stages_.length - 1].method;
            if (thismethod != comparemethod) {
                return true;
            }
            return false;
        } catch (err) {
            console.log('isMethodChange() in BndStageMemo ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    private isBndBoxChange(thisbox: Boundingbox[], comparebox: Boundingbox[]): boolean {
        try {
            if (thisbox.length != comparebox.length) {
                return true;
            } else {
                for (var i = 0; i < comparebox.length; ++i) {
                    if (
                        thisbox[i].x1 != comparebox[i].x1 ||
                        thisbox[i].x2 != comparebox[i].x2 ||
                        thisbox[i].y1 != comparebox[i].y1 ||
                        thisbox[i].y2 != comparebox[i].y2
                    ) {
                        return true;
                    }
                }
            }
            return false;
        } catch (err) {
            console.log(
                'isBndBoxChange(thisbox:Boundingbox, comparebox:Boundingbox) in BndStageMemo ----> ',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    private islabelChange(thisbox: Boundingbox[], comparebox: Boundingbox[]): boolean {
        try {
            if (thisbox.length != comparebox.length) {
                return true;
            } else {
                for (var i = 0; i < comparebox.length; ++i) {
                    if (thisbox[i].label != comparebox[i].label) {
                        return true;
                    }
                }
            }
            return false;
        } catch (err) {
            console.log(
                'islabelChange(thisbox:Boundingbox, comparebox:Boundingbox) in BndStageMemo ----> ',
                err.name + ': ',
                err.message,
            );
            return false;
        }
    }

    public setMaxStageSize(newStageSize: number) {
        try {
            this.MaxStageSize = newStageSize;
        } catch (err) {
            console.log('setMaxStageSize() in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }

    public getLength(): number {
        try {
            return this.stages_.length;
        } catch (err) {
            console.log('getLength() in BndStageMemo ----> ', err.name + ': ', err.message);
        }
    }
}
