import { BoundingBoxActionState } from './../image-labelling-layout.model';
import { BoundingBoxService } from '../../../shared/services/bounding-box.service';
import { BoundingBoxStateService } from '../../../shared/services/bounding-box-state.service';
import { UndoRedoService } from '../../../shared/services/undo-redo.service';
import { Metadata } from './../../../classes/CustomType';
import { utils } from './../../../classes/utils';
import {
    Component,
    OnInit,
    Input,
    SimpleChanges,
    ViewChild,
    ElementRef,
    HostListener,
    ChangeDetectionStrategy,
} from '@angular/core';

@Component({
    selector: 'image-labelling-object-detection',
    templateUrl: './image-labelling-object-detection.component.html',
    styleUrls: ['./image-labelling-object-detection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingObjectDetectionComponent implements OnInit {
    @ViewChild('canvasdrawing') mycanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh') crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv') crossv!: ElementRef<HTMLDivElement>;
    private context!: CanvasRenderingContext2D | null;
    private img: HTMLImageElement = new Image();
    private mousedown: boolean = false;
    private boundingBoxState!: BoundingBoxActionState;
    private utility: utils = new utils();
    @Input() _selectMetadata!: Metadata;
    @Input() _imgSrc: string = '';

    constructor(
        private _boundingBox: BoundingBoxService,
        private _bbState: BoundingBoxStateService,
        private Memo: UndoRedoService,
    ) {}

    ngOnInit() {
        this._bbState.boundingBox$.subscribe(
            (val) => (
                (this.boundingBoxState = val),
                this._boundingBox.setCurrentSelectedbBox(this.boundingBoxState.selectedBox),
                this.isFitCenter(),
                this.isClearCanvas()
            ),
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        try {
            changes._imgSrc.currentValue
                ? (this.initCanvas(),
                  (this.context = this.mycanvas?.nativeElement?.getContext('2d')
                      ? this.mycanvas.nativeElement.getContext('2d')
                      : null),
                  console.log(this._selectMetadata),
                  this.loadImages(changes._imgSrc.currentValue))
                : null;
        } catch (err) {}
    }

    rulesOnChange(
        scroll: boolean | null,
        selectbox: number | null,
        FitToscreen: boolean | null,
        clearScreen: boolean | null,
        dbclick: boolean | null,
    ) {
        try {
            let tempRules: BoundingBoxActionState = this.utility.deepCloneVariable(this.boundingBoxState);
            scroll !== null ? (tempRules.scroll = scroll) : {};
            selectbox !== null ? (tempRules.selectedBox = selectbox) : {};
            FitToscreen !== null ? (tempRules.fitCenter = FitToscreen) : {};
            clearScreen !== null ? (tempRules.clear = clearScreen) : {};
            dbclick !== null ? (tempRules.dbclick = dbclick) : {};
            this._bbState.setState(tempRules);
        } catch (err) {}
    }

    isClearCanvas() {
        try {
            this.boundingBoxState.clear
                ? ((this._selectMetadata.bnd_box = []),
                  this.redrawImages(
                      this._selectMetadata.img_x,
                      this._selectMetadata.img_y,
                      this._selectMetadata.img_w,
                      this._selectMetadata.img_h,
                  ),
                  this.rulesOnChange(null, null, null, false, null))
                : {};
        } catch (err) {}
    }

    isFitCenter() {
        try {
            this.boundingBoxState.fitCenter ? this.imgFitToCenter() : {};
        } catch (err) {}
    }

    imgFitToCenter() {
        try {
            let tmpObj = this._boundingBox.calScaleTofitScreen(
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
                this.mycanvas.nativeElement.offsetWidth,
                this.mycanvas.nativeElement.offsetHeight,
            );
            this._selectMetadata.img_w *= tmpObj.factor;
            this._selectMetadata.img_h *= tmpObj.factor;
            this._boundingBox.scaleAllBoxes(
                tmpObj.factor,
                this._selectMetadata.bnd_box,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
            );
            this._selectMetadata.img_x = tmpObj.newX;
            this._selectMetadata.img_y = tmpObj.newY;
            this._boundingBox.setGlobalXY(tmpObj.newX, tmpObj.newY);
            this._boundingBox.moveAllBbox(
                this._selectMetadata.bnd_box,
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
            );
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
            this.rulesOnChange(null, null, false, null, null);
        } catch (err) {}
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(event: MouseEvent) {
        try {
            this.rulesOnChange(null, null, null, null, true);
        } catch (err) {}
    }

    @HostListener('mousewheel', ['$event'])
    @HostListener('DOMMouseScroll', ['$event'])
    mouseScroll(event: WheelEvent) {
        try {
            //positive value is scroll down, negative value is scroll up
            let delta = event.deltaY ? event.deltaY / 40 : 0;
            if (delta && this.boundingBoxState.scroll) {
                this.zoomImage(delta);
            }
        } catch (err) {
            console.log('MouseScroll(event: WheelEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        try {
            if (
                this._boundingBox.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                this.mousedown = true;
                this.rulesOnChange(false, null, null, null, null);
                // this.boundingBoxState.scroll = false;
                if (this.boundingBoxState.drag) {
                    this._boundingBox.setPanXY(event.offsetX, event.offsetY);
                }
                if (this.boundingBoxState.draw) {
                    let tmpBox: number = this._boundingBox.mouseDownDrawEnable(
                        event.offsetX,
                        event.offsetY,
                        this._selectMetadata.bnd_box,
                    );
                    this.rulesOnChange(null, tmpBox, null, null, null);
                    this.redrawImages(
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                        this._selectMetadata.img_w,
                        this._selectMetadata.img_h,
                    );
                }
            }
        } catch (err) {
            console.log('MouseDown(event: MouseEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        try {
            if (
                this._boundingBox.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                if (this.boundingBoxState.drag && this.mousedown) {
                    this._boundingBox.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                }
                if (this.boundingBoxState.draw) {
                    // valuecode = 1, drawing new box; valuecode = 0, drawing existing box
                    const valuecode: number = this._boundingBox.mouseUpDrawEnable(this._selectMetadata);
                }
                this.mousedown = false;
                // this.boundingBoxState.scroll = true;
                this.rulesOnChange(true, null, null, null, null);
                this._boundingBox.getBBoxDistfromImg(
                    this._selectMetadata.bnd_box,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                );
            }
        } catch (err) {
            console.log('MouseUp(event: MouseEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        try {
            if (
                this._boundingBox.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                if (this.boundingBoxState.drag && this.mousedown) {
                    let diff: {
                        diffX: number;
                        diffY: number;
                    } = this._boundingBox.getdiffXY(event.offsetX, event.offsetY);
                    this._selectMetadata.img_x = diff.diffX;
                    this._selectMetadata.img_y = diff.diffY;
                    this._boundingBox.panRectangle(
                        this._selectMetadata.bnd_box,
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                    );
                    this.redrawImages(
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                        this._selectMetadata.img_w,
                        this._selectMetadata.img_h,
                    );
                }
                if (this.boundingBoxState.draw && this.mousedown) {
                    this._boundingBox.mouseMoveDrawEnable(event.offsetX, event.offsetY, this._selectMetadata);
                    this.redrawImages(
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                        this._selectMetadata.img_w,
                        this._selectMetadata.img_h,
                    );
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
        } catch (err) {
            console.log('MouseMove(event: MouseEvent)', err.name + ': ', err.message);
        }
    }

    @HostListener('mouseout', ['$event'])
    mouseOut(event: MouseEvent) {
        try {
            if (this.boundingBoxState.drag && this.mousedown) {
                this._boundingBox.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.redrawImages(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
            }
        } catch (err) {
            console.log('MouseOut(event: MouseEvent)', err.name + ': ', err.message);
        }
    }

    initCanvas() {
        try {
            this.mycanvas.nativeElement.style.width = '80%';
            this.mycanvas.nativeElement.style.height = '90%';
            this.mycanvas.nativeElement.width = this.mycanvas.nativeElement.offsetWidth;
            this.mycanvas.nativeElement.height = this.mycanvas.nativeElement.offsetHeight;
        } catch (err) {}
    }

    loadImages(bit64STR: string) {
        try {
            this.img.src = bit64STR;
            this.clearcanvas();
            this.img.onload = () => {
                this._selectMetadata.img_w =
                    this._selectMetadata.img_w < 1 ? this._selectMetadata.img_ori_w : this._selectMetadata.img_w;
                this._selectMetadata.img_h =
                    this._selectMetadata.img_h < 1 ? this._selectMetadata.img_ori_h : this._selectMetadata.img_h;
                this._boundingBox.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.context?.drawImage(
                    this.img,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
                this._boundingBox.drawAllBoxOn(this._selectMetadata.bnd_box, this.context);
                this.mycanvas.nativeElement.focus();
            };
        } catch (err) {}
    }

    redrawImages(newX: number, newY: number, newW: number, newH: number) {
        try {
            this.clearcanvas();
            this.context?.drawImage(this.img, newX, newY, newW, newH);
            this._boundingBox.drawAllBoxOn(this._selectMetadata.bnd_box, this.context);
            this.mycanvas.nativeElement.focus();
        } catch (err) {}
    }

    clearcanvas() {
        try {
            this.context?.clearRect(0, 0, this.mycanvas.nativeElement.width, this.mycanvas.nativeElement.height);
        } catch (err) {}
    }

    zoomImage(del: number) {
        try {
            if (del < 0) {
                //zoom up
                this._selectMetadata.img_w *= 1.1;
                this._selectMetadata.img_h *= 1.1;
                this._boundingBox.scaleAllBoxes(
                    1.1,
                    this._selectMetadata.bnd_box,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                );
            } else {
                //zoom down
                if (this._selectMetadata.img_w * 0.9 > 100 && this._selectMetadata.img_h * 0.9 > 100) {
                    this._selectMetadata.img_w *= 0.9;
                    this._selectMetadata.img_h *= 0.9;
                    this._boundingBox.scaleAllBoxes(
                        0.9,
                        this._selectMetadata.bnd_box,
                        this._selectMetadata.img_x,
                        this._selectMetadata.img_y,
                    );
                }
            }
            this.redrawImages(
                this._selectMetadata.img_x,
                this._selectMetadata.img_y,
                this._selectMetadata.img_w,
                this._selectMetadata.img_h,
            );
        } catch (err) {}
    }
}
