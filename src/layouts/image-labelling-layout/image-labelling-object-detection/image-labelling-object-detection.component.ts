import { BoundingboxService } from './../../../shared/services/boundingbox.service';
import { Metadata, rules } from './../../../classes/CustomType';
import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'image-labelling-object-detection',
  templateUrl: './image-labelling-object-detection.component.html',
  styleUrls: ['./image-labelling-object-detection.component.css'],
})
export class ImageLabellingObjectDetectionComponent implements OnInit {
  @ViewChild('canvasdrawing')
  mycanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('crossh')
  crossh: ElementRef<HTMLDivElement>;
  @ViewChild('crossv')
  crossv: ElementRef<HTMLDivElement>;
  private context: CanvasRenderingContext2D;
  private img: HTMLImageElement = new Image();
  private mousedown: boolean = false;
  private rules: rules = {
    scroll: true,
    drag: false,
    draw: true,
    selectedBox: -1,
  };
  @Input() imgInput: string = '';
  @Input() SelectMetadata: Metadata = null;
  constructor(private _Boundingbox: BoundingboxService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (
        changes.imgInput.currentValue !== '' ||
        changes.imgInput.currentValue !== undefined ||
        changes.imgInput.currentValue !== null
      ) {
        this.initCanvas();
        this.context = this.mycanvas.nativeElement.getContext('2d');
        this.loadImages(changes.imgInput.currentValue);
      }
    } catch (err) {}
  }

  @HostListener('dblclick', ['$event'])
  Toggleevent(event: MouseEvent) {
    try {
      if (!this.rules.draw) {
        this.rules.draw = true;
        this.rules.drag = false;
      } else {
        this.rules.drag = true;
        this.rules.draw = false;
      }
      console.log(
        'this.rules.drag : ',
        this.rules.drag,
        ' this.rules.draw : ',
        this.rules.draw
      );
    } catch (err) {}
  }

  @HostListener('mousewheel', ['$event'])
  MouseScroll(event: WheelEvent) {
    try {
      //positive value is scroll down, negative value is scroll up
      let delta = event.deltaY ? event.deltaY / 40 : 0;
      if (delta && this.rules.scroll) {
        this.zoomImage(delta);
      }
    } catch (err) {}
  }

  @HostListener('mousedown', ['$event'])
  MouseDown(event: MouseEvent) {
    try {
      if (
        this._Boundingbox.mouseClickWithinPointPath(
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y,
          this.SelectMetadata.img_w,
          this.SelectMetadata.img_h,
          event.offsetX,
          event.offsetY
        )
      ) {
        this.mousedown = true;
        this.rules.scroll = false;
        if (this.rules.drag) {
          this._Boundingbox.setPanXY(event.offsetX, event.offsetY);
        }
        if (this.rules.draw) {
          this.rules.selectedBox = this._Boundingbox.MouseDownDrawEnable(
            event.offsetX,
            event.offsetY,
            this.SelectMetadata.bnd_box
          );
          this.redrawImages(
            this.SelectMetadata.img_x,
            this.SelectMetadata.img_y,
            this.SelectMetadata.img_w,
            this.SelectMetadata.img_h
          );
        }
      }
    } catch (err) {}
  }

  @HostListener('mouseup', ['$event'])
  MouseUp(event: MouseEvent) {
    try {
      if (
        this._Boundingbox.mouseClickWithinPointPath(
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y,
          this.SelectMetadata.img_w,
          this.SelectMetadata.img_h,
          event.offsetX,
          event.offsetY
        )
      ) {
        if (this.rules.drag && this.mousedown) {
          this._Boundingbox.SetGlobalXY(
            this.SelectMetadata.img_x,
            this.SelectMetadata.img_y
          );
        }
        if (this.rules.draw) {
          // valuecode = 1, drawing new box; valuecode = 0, drawing existing box
          var valuecode: number = this._Boundingbox.MouseUpDrawEnable(
            this.SelectMetadata
          );
        }
        this.mousedown = false;
        this.rules.scroll = true;
        this._Boundingbox.GetBBoxDistfromImg(
          this.SelectMetadata.bnd_box,
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y
        );
      }
    } catch (err) {}
  }

  @HostListener('mousemove', ['$event'])
  MouseMove(event: MouseEvent) {
    try {
      if (
        this._Boundingbox.mouseClickWithinPointPath(
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y,
          this.SelectMetadata.img_w,
          this.SelectMetadata.img_h,
          event.offsetX,
          event.offsetY
        )
      ) {
        if (this.rules.drag && this.mousedown) {
          let diff: {
            diffX: number;
            diffY: number;
          } = this._Boundingbox.GetdiffXY(event.offsetX, event.offsetY);
          this.SelectMetadata.img_x = diff.diffX;
          this.SelectMetadata.img_y = diff.diffY;
          this._Boundingbox.panRectangle(
            this.SelectMetadata.bnd_box,
            this.SelectMetadata.img_x,
            this.SelectMetadata.img_y
          );
          this.redrawImages(
            this.SelectMetadata.img_x,
            this.SelectMetadata.img_y,
            this.SelectMetadata.img_w,
            this.SelectMetadata.img_h
          );
        }
        if (this.rules.draw && this.mousedown) {
          this._Boundingbox.MouseMoveDrawEnable(
            event.offsetX,
            event.offsetY,
            this.SelectMetadata
          );
          this.redrawImages(
            this.SelectMetadata.img_x,
            this.SelectMetadata.img_y,
            this.SelectMetadata.img_w,
            this.SelectMetadata.img_h
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
  MouseOut(event: MouseEvent) {
    try {
      if (this.rules.drag && this.mousedown) {
        this._Boundingbox.SetGlobalXY(
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y
        );
        this.redrawImages(
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y,
          this.SelectMetadata.img_w,
          this.SelectMetadata.img_h
        );
      }
    } catch (err) {}
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
        self.SelectMetadata.img_w =
          self.SelectMetadata.img_w < 1
            ? self.SelectMetadata.img_ori_w
            : self.SelectMetadata.img_w;
        self.SelectMetadata.img_h =
          self.SelectMetadata.img_h < 1
            ? self.SelectMetadata.img_ori_h
            : self.SelectMetadata.img_h;
        self._Boundingbox.SetGlobalXY(
          self.SelectMetadata.img_x,
          self.SelectMetadata.img_y
        );
        self.context.drawImage(
          self.img,
          self.SelectMetadata.img_x,
          self.SelectMetadata.img_y,
          self.SelectMetadata.img_w,
          self.SelectMetadata.img_h
        );
      };
    } catch (err) {}
  }

  redrawImages(newX: number, newY: number, newW: number, newH: number) {
    try {
      this.clearcanvas();
      this.context.drawImage(this.img, newX, newY, newW, newH);
      this._Boundingbox.DrawAllBoxOn(this.SelectMetadata.bnd_box, this.context);
      this.mycanvas.nativeElement.focus();
    } catch (err) {}
  }

  clearcanvas() {
    try {
      this.context.clearRect(
        0,
        0,
        this.mycanvas.nativeElement.width,
        this.mycanvas.nativeElement.height
      );
    } catch (err) {}
  }

  zoomImage(del: number) {
    try {
      if (del < 0) {
        //zoom up
        this.SelectMetadata.img_w *= 1.1;
        this.SelectMetadata.img_h *= 1.1;
        this._Boundingbox.scaleAllBoxes(
          1.1,
          this.SelectMetadata.bnd_box,
          this.SelectMetadata.img_x,
          this.SelectMetadata.img_y
        );
      } else {
        //zoom down
        if (
          this.SelectMetadata.img_w * 0.9 > 100 &&
          this.SelectMetadata.img_h * 0.9 > 100
        ) {
          this.SelectMetadata.img_w *= 0.9;
          this.SelectMetadata.img_h *= 0.9;
          this._Boundingbox.scaleAllBoxes(
            0.9,
            this.SelectMetadata.bnd_box,
            this.SelectMetadata.img_x,
            this.SelectMetadata.img_y
          );
        }
      }
      this.redrawImages(
        this.SelectMetadata.img_x,
        this.SelectMetadata.img_y,
        this.SelectMetadata.img_w,
        this.SelectMetadata.img_h
      );
    } catch (err) {}
  }
}
