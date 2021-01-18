import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { UndoRedoService } from 'src/shared/services/undo-redo.service';
import { SegmentationCanvasService } from '../../../shared/services/segmentation-canvas.service';
import { AnnotateActionState, PolyMeta, segActionState } from './../image-labelling-layout.model';

@Component({
    selector: 'app-image-labelling-segmentation',
    templateUrl: './image-labelling-segmentation.component.html',
    styleUrls: ['./image-labelling-segmentation.component.scss'],
})
export class ImageLabellingSegmentationComponent implements OnInit {
    @ViewChild('canvasdrawing') mycanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    private context!: CanvasRenderingContext2D | null;
    private img: HTMLImageElement = new Image();
    private mousedown: boolean = false;
    private segState!: segActionState;
    private annotateState!: AnnotateActionState;
    @Input() _selectMetadata!: PolyMeta;
    @Input() _imgSrc: string = '';
    constructor(
        private _segCanvasService: SegmentationCanvasService,
        private _undoRedoService: UndoRedoService,
        private _annotateSelectState: AnnotateSelectionService,
    ) {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        try {
            console.log(changes);
            changes._imgSrc.currentValue
                ? (this.initCanvas(),
                  (this.context = this.mycanvas?.nativeElement?.getContext('2d')
                      ? this.mycanvas.nativeElement.getContext('2d')
                      : null),
                  this.loadImages(changes._imgSrc.currentValue))
                : {};
        } catch (err) {}
    }

    loadImages(bit64STR: string) {
        try {
            this.img.src = bit64STR;
            this.img.onload = () => {
                this._selectMetadata.img_w =
                    this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
                this._selectMetadata.img_h =
                    this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
                this._segCanvasService.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.imgFitToCenter();
                this._undoRedoService.appendStages({
                    meta: cloneDeep(this._selectMetadata),
                    method: 'draw',
                });
            };
        } catch (err) {}
    }

    imgFitToCenter() {
        try {
            const tmpObj = this._segCanvasService.calScaleTofitScreen(
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                this.mycanvas.nativeElement.offsetWidth,
                this.mycanvas.nativeElement.offsetHeight,
            );
            this._selectMetadata.img_w *= tmpObj.factor;
            this._selectMetadata.img_h *= tmpObj.factor;
            this._segCanvasService.scalePolygons(
                this._selectMetadata,
                tmpObj.factor,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
            );
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._segCanvasService.setGlobalXY(tmpObj.newX, tmpObj.newY);
            this._segCanvasService.panPolygons(
                this._selectMetadata,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                false,
            );
            const meta = cloneDeep(this._selectMetadata);
            this._undoRedoService.isMethodChange('zoom')
                ? this._undoRedoService.appendStages({
                      meta,
                      method: 'zoom',
                  })
                : this._undoRedoService.replaceStages({
                      meta,
                      method: 'zoom',
                  });
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
            // this.emitMetadata();
            // this.rulesMakeChange(null, false, null);
        } catch (err) {}
    }

    redrawImages(newX: number, newY: number, newW: number, newH: number) {
        try {
            this.clearcanvas();
            this.context?.drawImage(this.img, newX, newY, newW, newH);
            this._segCanvasService.DrawAllPolygons(this._selectMetadata, this.context!, this.annotateState.annotation);
            this.mycanvas.nativeElement.focus();
        } catch (err) {}
    }

    clearcanvas() {
        try {
            this.context?.clearRect(0, 0, this.mycanvas.nativeElement.width, this.mycanvas.nativeElement.height);
        } catch (err) {}
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        if (
            this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            )
        ) {
            this.mousedown = true;
            if (this.segState.drag) {
            }
            if (this.segState.draw) {
            }
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        if (
            this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            )
        ) {
            this.mousedown = true;
            if (this.segState.drag && this.mousedown) {
            }
            if (this.segState.draw && this.mousedown) {
            }
        }
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        if (
            this._segCanvasService.mouseClickWithinPointPath(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                event.offsetX,
                event.offsetY,
            )
        ) {
            this.mousedown = true;
            if (this.segState.drag && this.mousedown) {
            }
            if (this.segState.draw && this.mousedown) {
            }
        } else {
            if (
                this.crossh.nativeElement.style.zIndex !== '-1' ||
                this.crossh.nativeElement.style.visibility !== 'hidden' ||
                this.crossv.nativeElement.style.zIndex !== '-1' ||
                this.crossv.nativeElement.style.visibility !== 'hidden'
            ) {
                this.crossh.nativeElement.style.zIndex = '-1';
                this.crossh.nativeElement.style.visibility = 'hidden';
                this.crossv.nativeElement.style.zIndex = '-1';
                this.crossv.nativeElement.style.visibility = 'hidden';
            }
        }
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        if (this.segState.drag && this.mousedown) {
        }
        this.mousedown = false;
    }

    initCanvas() {
        try {
            this.mycanvas.nativeElement.style.width = '80%';
            this.mycanvas.nativeElement.style.height = '90%';
            this.mycanvas.nativeElement.width = this.mycanvas.nativeElement.offsetWidth;
            this.mycanvas.nativeElement.height = this.mycanvas.nativeElement.offsetHeight;
        } catch (err) {}
    }
}
