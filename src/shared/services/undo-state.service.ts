import { Injectable } from '@angular/core';
import { undoState } from '../../layouts/image-labelling-layout/image-labelling-layout.model';
import { utils } from '../../classes/utils';

@Injectable({
    providedIn: 'any',
})
export class UndoStateService {
    private CurrentArr: Array<undoState> = [];
    private UndoArr: Array<undoState> = [];
    private RedoArr: Array<undoState> = [];
    private MaxStageSize: number = 50;
    private allowUndo: boolean = false;
    private allowRedo: boolean = false;
    private utility: utils = new utils();

    constructor() {}

    public appendStages(): void {}

    public clearAllStages(): void {}

    public undo(): void {}

    public redo(): void {}
}
