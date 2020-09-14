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
  private context: CanvasRenderingContext2D;
  private img: HTMLImageElement = new Image();
  private rules: rules = { scroll: true };
  @Input() imgInput: string = '';
  @Input() SelectMetadata: Metadata = null;
  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    try {
      this.initCanvas();
      this.context = this.mycanvas.nativeElement.getContext('2d');
      this.loadImages(changes.imgInput.currentValue);
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
      self.clearcanvas();
      self.img.src = bit64STR;
      self.img.onload = function () {
        self.SelectMetadata.img_w =
          self.SelectMetadata.img_w < 1
            ? self.SelectMetadata.img_ori_w
            : self.SelectMetadata.img_w;
        self.SelectMetadata.img_h =
          self.SelectMetadata.img_h < 1
            ? self.SelectMetadata.img_ori_h
            : self.SelectMetadata.img_h;
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
      console.log(this.img);
      console.log(newX, newY, newW, newH);
      this.context.drawImage(this.img, newX, newY, newW, newH);
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
      } else {
        //zoom down
        if (
          this.SelectMetadata.img_w * 0.9 > 100 &&
          this.SelectMetadata.img_h * 0.9 > 100
        ) {
          this.SelectMetadata.img_w *= 0.9;
          this.SelectMetadata.img_h *= 0.9;
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
