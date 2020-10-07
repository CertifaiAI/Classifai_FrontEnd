import { ActionRules } from './../image-labelling-layout.model';
import { BoundingBoxService } from '../../../shared/services/bounding-box.service';
import { BoundingBoxStateService } from '../../../shared/services/bounding-box-state.service';
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
    private rules!: ActionRules;
    private utility: utils = new utils();
    @Input() _selectMetadata!: Metadata;
    @Input() _imgSrc: string = '';

    constructor(private _boundingbox: BoundingBoxService, private _incomeRules: BoundingBoxStateService) {}

    ngOnInit() {
        this._incomeRules.currentValue.subscribe((val) => (this.rules = val));
    }

    rulesOnChange(scroll: boolean, selectbox: number) {
        try {
            let tempRules: ActionRules = this.utility.deepCloneVariable(this.rules);
            tempRules.scroll = scroll;
            tempRules.selectedBox = selectbox;
            this._incomeRules.valueChange(tempRules);
        } catch (err) {}
    }

    ngOnChanges(changes: SimpleChanges): void {
        try {
            if (
                changes._imgSrc.currentValue !== '' ||
                changes._imgSrc.currentValue !== undefined ||
                changes._imgSrc.currentValue !== null
            ) {
                this.initCanvas();
                this.context = this.mycanvas?.nativeElement?.getContext('2d')
                    ? this.mycanvas.nativeElement.getContext('2d')
                    : null;
                console.log(this._selectMetadata);
                this.loadImages(changes._imgSrc.currentValue);
            }
        } catch (err) {}
    }

    @HostListener('dblclick', ['$event'])
    toggleEvent(event: MouseEvent) {
        try {
            if (!this.rules.draw) {
                this.rules.draw = true;
                this.rules.drag = false;
            } else {
                this.rules.drag = true;
                this.rules.draw = false;
            }
        } catch (err) {}
    }

    @HostListener('mousewheel', ['$event'])
    mouseScroll(event: WheelEvent) {
        try {
            //positive value is scroll down, negative value is scroll up
            let delta = event.deltaY ? event.deltaY / 40 : 0;
            if (delta && this.rules.scroll) {
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
                this._boundingbox.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                this.mousedown = true;
                this.rules.scroll = false;
                if (this.rules.drag) {
                    this._boundingbox.setPanXY(event.offsetX, event.offsetY);
                }
                if (this.rules.draw) {
                    this.rules.selectedBox = this._boundingbox.mouseDownDrawEnable(
                        event.offsetX,
                        event.offsetY,
                        this._selectMetadata.bnd_box,
                    );
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
                this._boundingbox.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                if (this.rules.drag && this.mousedown) {
                    this._boundingbox.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                }
                if (this.rules.draw) {
                    // valuecode = 1, drawing new box; valuecode = 0, drawing existing box
                    const valuecode: number = this._boundingbox.mouseUpDrawEnable(this._selectMetadata);
                }
                this.mousedown = false;
                this.rules.scroll = true;
                this._boundingbox.getBBoxDistfromImg(
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
                this._boundingbox.mouseClickWithinPointPath(
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                if (this.rules.drag && this.mousedown) {
                    let diff: {
                        diffX: number;
                        diffY: number;
                    } = this._boundingbox.getdiffXY(event.offsetX, event.offsetY);
                    this._selectMetadata.img_x = diff.diffX;
                    this._selectMetadata.img_y = diff.diffY;
                    this._boundingbox.panRectangle(
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
                if (this.rules.draw && this.mousedown) {
                    this._boundingbox.mouseMoveDrawEnable(event.offsetX, event.offsetY, this._selectMetadata);
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
            if (this.rules.drag && this.mousedown) {
                this._boundingbox.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
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
                this._boundingbox.setGlobalXY(this._selectMetadata.img_x, this._selectMetadata.img_y);
                this.context?.drawImage(
                    this.img,
                    this._selectMetadata.img_x,
                    this._selectMetadata.img_y,
                    this._selectMetadata.img_w,
                    this._selectMetadata.img_h,
                );
            };
        } catch (err) {}
    }

    redrawImages(newX: number, newY: number, newW: number, newH: number) {
        try {
            this.clearcanvas();
            this.context?.drawImage(this.img, newX, newY, newW, newH);
            this._boundingbox.drawAllBoxOn(this._selectMetadata.bnd_box, this.context);
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
                this._boundingbox.scaleAllBoxes(
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
                    this._boundingbox.scaleAllBoxes(
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