import { ActionRules } from './../image-labelling-layout.model';
import { BboxDataService } from './../../../shared/services/bbox-data.service';
import { BoundingboxService } from './../../../shared/services/boundingbox.service';
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
    styleUrls: ['./image-labelling-object-detection.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingObjectDetectionComponent implements OnInit {
    @ViewChild('canvasdrawing')
    mycanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('crossh')
    crossh!: ElementRef<HTMLDivElement>;
    @ViewChild('crossv')
    crossv!: ElementRef<HTMLDivElement>;
    private context!: CanvasRenderingContext2D | null;
    private img: HTMLImageElement = new Image();
    private mousedown: boolean = false;
    private rules!: ActionRules;
    private utility: utils = new utils();
    @Input() selectMetadata!: Metadata;
    @Input() imgSrc: any;

    constructor(private _boundingbox: BoundingboxService, private _incomeRules: BboxDataService) {}

    ngOnInit() {
        this._incomeRules.currentValue.subscribe((val) => (this.rules = val));
    }

    rulesOnChange(scroll: boolean, selectbox: number) {
        try {
            var tempRules: ActionRules = this.utility.deepCloneVariable(this.rules);
            tempRules.scroll = scroll;
            tempRules.selectedBox = selectbox;
            this._incomeRules.valueChange(tempRules);
        } catch (err) {}
    }

    ngOnChanges(changes: SimpleChanges): void {
        try {
            if (
                changes.imgSrc.currentValue !== '' ||
                changes.imgSrc.currentValue !== undefined ||
                changes.imgSrc.currentValue !== null
            ) {
                this.initCanvas();
                this.context = this.mycanvas?.nativeElement?.getContext('2d')
                    ? this.mycanvas.nativeElement.getContext('2d')
                    : null;
                console.log(this.selectMetadata);
                this.loadImages(changes.imgSrc.currentValue);
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
                    this.selectMetadata.img_x,
                    this.selectMetadata.img_y,
                    this.selectMetadata.img_w,
                    this.selectMetadata.img_h,
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
                        this.selectMetadata.bnd_box,
                    );
                    this.redrawImages(
                        this.selectMetadata.img_x,
                        this.selectMetadata.img_y,
                        this.selectMetadata.img_w,
                        this.selectMetadata.img_h,
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
                    this.selectMetadata.img_x,
                    this.selectMetadata.img_y,
                    this.selectMetadata.img_w,
                    this.selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                if (this.rules.drag && this.mousedown) {
                    this._boundingbox.setGlobalXY(this.selectMetadata.img_x, this.selectMetadata.img_y);
                }
                if (this.rules.draw) {
                    // valuecode = 1, drawing new box; valuecode = 0, drawing existing box
                    var valuecode: number = this._boundingbox.mouseUpDrawEnable(this.selectMetadata);
                }
                this.mousedown = false;
                this.rules.scroll = true;
                this._boundingbox.getBBoxDistfromImg(
                    this.selectMetadata.bnd_box,
                    this.selectMetadata.img_x,
                    this.selectMetadata.img_y,
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
                    this.selectMetadata.img_x,
                    this.selectMetadata.img_y,
                    this.selectMetadata.img_w,
                    this.selectMetadata.img_h,
                    event.offsetX,
                    event.offsetY,
                )
            ) {
                if (this.rules.drag && this.mousedown) {
                    let diff: {
                        diffX: number;
                        diffY: number;
                    } = this._boundingbox.getdiffXY(event.offsetX, event.offsetY);
                    this.selectMetadata.img_x = diff.diffX;
                    this.selectMetadata.img_y = diff.diffY;
                    this._boundingbox.panRectangle(
                        this.selectMetadata.bnd_box,
                        this.selectMetadata.img_x,
                        this.selectMetadata.img_y,
                    );
                    this.redrawImages(
                        this.selectMetadata.img_x,
                        this.selectMetadata.img_y,
                        this.selectMetadata.img_w,
                        this.selectMetadata.img_h,
                    );
                }
                if (this.rules.draw && this.mousedown) {
                    this._boundingbox.mouseMoveDrawEnable(event.offsetX, event.offsetY, this.selectMetadata);
                    this.redrawImages(
                        this.selectMetadata.img_x,
                        this.selectMetadata.img_y,
                        this.selectMetadata.img_w,
                        this.selectMetadata.img_h,
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
                this._boundingbox.setGlobalXY(this.selectMetadata.img_x, this.selectMetadata.img_y);
                this.redrawImages(
                    this.selectMetadata.img_x,
                    this.selectMetadata.img_y,
                    this.selectMetadata.img_w,
                    this.selectMetadata.img_h,
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
            let self = this;
            self.img.src = bit64STR;
            self.clearcanvas();
            self.img.onload = function () {
                self.selectMetadata.img_w =
                    self.selectMetadata.img_w < 1 ? self.selectMetadata.img_ori_w : self.selectMetadata.img_w;
                self.selectMetadata.img_h =
                    self.selectMetadata.img_h < 1 ? self.selectMetadata.img_ori_h : self.selectMetadata.img_h;
                self._boundingbox.setGlobalXY(self.selectMetadata.img_x, self.selectMetadata.img_y);
                self.context?.drawImage(
                    self.img,
                    self.selectMetadata.img_x,
                    self.selectMetadata.img_y,
                    self.selectMetadata.img_w,
                    self.selectMetadata.img_h,
                );
            };
        } catch (err) {}
    }

    redrawImages(newX: number, newY: number, newW: number, newH: number) {
        try {
            this.clearcanvas();
            this.context?.drawImage(this.img, newX, newY, newW, newH);
            this._boundingbox.drawAllBoxOn(this.selectMetadata.bnd_box, this.context);
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
                this.selectMetadata.img_w *= 1.1;
                this.selectMetadata.img_h *= 1.1;
                this._boundingbox.scaleAllBoxes(
                    1.1,
                    this.selectMetadata.bnd_box,
                    this.selectMetadata.img_x,
                    this.selectMetadata.img_y,
                );
            } else {
                //zoom down
                if (this.selectMetadata.img_w * 0.9 > 100 && this.selectMetadata.img_h * 0.9 > 100) {
                    this.selectMetadata.img_w *= 0.9;
                    this.selectMetadata.img_h *= 0.9;
                    this._boundingbox.scaleAllBoxes(
                        0.9,
                        this.selectMetadata.bnd_box,
                        this.selectMetadata.img_x,
                        this.selectMetadata.img_y,
                    );
                }
            }
            this.redrawImages(
                this.selectMetadata.img_x,
                this.selectMetadata.img_y,
                this.selectMetadata.img_w,
                this.selectMetadata.img_h,
            );
        } catch (err) {}
    }
}
