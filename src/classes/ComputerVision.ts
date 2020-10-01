import { xycoordinate, Boundingbox, Metadata } from './CustomType';
import { utils } from './utils';

export class ObjectDetection {
  private globalXY: xycoordinate = { x: 0, y: 0 };
  private panXY: xycoordinate = { x: 0, y: 0 };
  private CurrentClickedBox: { box: number; pos: string } = {
    box: -1,
    pos: 'o',
  };
  private lineOffset: number = 3;
  private anchrSize: number = 2.5;
  private utility: utils = new utils();
  private CurrentDrawing: { x1: number; x2: number; y1: number; y2: number } = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };
  private tmpbox: Boundingbox = null;
  private CurrentSelectedBndBox: number = -1;
  constructor() {}

  public GetdiffXY(
    offsetX: number,
    offsetY: number
  ): { diffX: number; diffY: number } {
    try {
      let rtobj: { diffX: number; diffY: number } = { diffX: 0, diffY: 0 };
      if (
        offsetX !== null &&
        offsetX !== undefined &&
        offsetY !== null &&
        offsetY !== undefined
      ) {
        rtobj.diffX = this.globalXY.x + (offsetX - this.panXY.x);
        rtobj.diffY = this.globalXY.y + (offsetY - this.panXY.y);
      }
      return rtobj;
    } catch (err) {
      console.log(
        'ObjectDetection GetdiffXY(offsetX: number,offsetY: number): { diffX: number; diffY: number }',
        err.name + ': ',
        err.message
      );
      return null;
    }
  }

  public setCurrentX1Y1(MouseX: number, MouseY: number): void {
    try {
      if (
        MouseX !== null &&
        MouseY !== null &&
        MouseX !== undefined &&
        MouseY !== undefined
      ) {
        this.CurrentDrawing.x1 = MouseX;
        this.CurrentDrawing.y1 = MouseY;
      }
    } catch (err) {
      console.log(
        'ObjectDetection setCurrentX1Y1(MouseX:number, MouseY:number):void',
        err.name + ': ',
        err.message
      );
    }
  }

  public setCurrentX2Y2(MouseX: number, MouseY: number): void {
    try {
      if (
        MouseX !== null &&
        MouseY !== null &&
        MouseX !== undefined &&
        MouseY !== undefined
      ) {
        this.CurrentDrawing.x2 = MouseX;
        this.CurrentDrawing.y2 = MouseY;
      }
    } catch (err) {
      console.log(
        'ObjectDetection setCurrentX2Y2(MouseX:number, MouseY:number):void',
        err.name + ': ',
        err.message
      );
    }
  }

  private mouseMoveBox(
    MouseX: number,
    MouseY: number,
    CurrMeta: Metadata
  ): void {
    try {
      let tmpOffsetX: number = MouseX - this.CurrentDrawing.x1;
      let tmpOffsetY: number = MouseY - this.CurrentDrawing.y1;
      if (
        this.moveBoxWithinPointPath(
          CurrMeta.img_x,
          CurrMeta.img_y,
          CurrMeta.img_w,
          CurrMeta.img_h,
          tmpOffsetX,
          tmpOffsetY,
          CurrMeta.bnd_box[this.CurrentSelectedBndBox]
        )
      ) {
        this.setCurrentX2Y2(MouseX, MouseY);
        let xOffset: number = this.CurrentDrawing.x2 - this.CurrentDrawing.x1;
        let yOffset: number = this.CurrentDrawing.y2 - this.CurrentDrawing.y1;
        this.setCurrentX1Y1(this.CurrentDrawing.x2, this.CurrentDrawing.y2);
        if (
          this.CurrentClickedBox.pos === 'i' ||
          this.CurrentClickedBox.pos === 'tl' ||
          this.CurrentClickedBox.pos === 'l' ||
          this.CurrentClickedBox.pos === 'bl'
        ) {
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].x1 += xOffset;
        }
        if (
          this.CurrentClickedBox.pos === 'i' ||
          this.CurrentClickedBox.pos === 'tl' ||
          this.CurrentClickedBox.pos === 't' ||
          this.CurrentClickedBox.pos === 'tr'
        ) {
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].y1 += yOffset;
        }
        if (
          this.CurrentClickedBox.pos === 'i' ||
          this.CurrentClickedBox.pos === 'tr' ||
          this.CurrentClickedBox.pos === 'r' ||
          this.CurrentClickedBox.pos === 'br'
        ) {
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].x2 += xOffset;
        }
        if (
          this.CurrentClickedBox.pos === 'i' ||
          this.CurrentClickedBox.pos === 'bl' ||
          this.CurrentClickedBox.pos === 'b' ||
          this.CurrentClickedBox.pos === 'br'
        ) {
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].y2 += yOffset;
        }
      }
    } catch (err) {
      console.log(
        'ObjectDetection mouseMoveBox(MouseX:number, MouseY:number, CurrMeta:Metadata):void',
        err.name + ': ',
        err.message
      );
    }
  }

  public MouseUpDrawEnable(CurrMeta: Metadata): number {
    try {
      let drawcode: number = -1;
      if (this.CurrentClickedBox.box === -1 && this.tmpbox !== null) {
        CurrMeta.bnd_box.push(this.tmpbox);
        this.CurrentSelectedBndBox = CurrMeta.bnd_box.length - 1;
        CurrMeta.bnd_box[this.CurrentSelectedBndBox].label = 'default';
        drawcode = 1;
      } else {
        if (
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].x1 >
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].x2
        ) {
          var previousX1: number = this.utility.DeepCloneVariable(
            CurrMeta.bnd_box[this.CurrentSelectedBndBox].x1
          );
          CurrMeta.bnd_box[
            this.CurrentSelectedBndBox
          ].x1 = this.utility.DeepCloneVariable(
            CurrMeta.bnd_box[this.CurrentSelectedBndBox].x2
          );
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].x2 = previousX1;
        }
        if (
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].y1 >
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].y2
        ) {
          var previousY1: number = this.utility.DeepCloneVariable(
            CurrMeta.bnd_box[this.CurrentSelectedBndBox].y1
          );
          CurrMeta.bnd_box[
            this.CurrentSelectedBndBox
          ].y1 = this.utility.DeepCloneVariable(
            CurrMeta.bnd_box[this.CurrentSelectedBndBox].y2
          );
          CurrMeta.bnd_box[this.CurrentSelectedBndBox].y2 = previousY1;
        }
        drawcode = 0;
      }
      this.CurrentClickedBox = { box: -1, pos: 'o' };
      this.setCurrentX1Y1(0, 0);
      this.setCurrentX2Y2(0, 0);
      this.tmpbox = null;
      return drawcode;
    } catch (err) {
      return -1;
    }
  }

  public scaleAllBoxes(scalefactor: number) {
    try {
    } catch (err) {}
  }

  public MouseMoveDrawEnable(
    MouseX: number,
    MouseY: number,
    SelectedMeta: Metadata
  ): void {
    try {
      if (this.CurrentClickedBox.box === -1) {
        this.setCurrentX2Y2(MouseX, MouseY);
      } else {
        this.mouseMoveBox(MouseX, MouseY, SelectedMeta);
      }
    } catch (err) {
      console.log(
        'ObjectDetection MouseMoveDrawEnable(MouseX: number,MouseY: number,SelectedMeta: Metadata): void',
        err.name + ': ',
        err.message
      );
    }
  }

  public MouseDownDrawEnable(
    MouseX: number,
    MouseY: number,
    BBox: Boundingbox[]
  ): number {
    try {
      this.GetCurrentClickBox(MouseX, MouseY, BBox);
      this.setCurrentX1Y1(MouseX, MouseY);
      this.setCurrentX2Y2(MouseX, MouseY);
      if (this.CurrentClickedBox.box !== -1) {
        this.CurrentSelectedBndBox = this.CurrentClickedBox.box;
      } else {
        this.CurrentSelectedBndBox = undefined;
      }
      return this.CurrentClickedBox.box;
    } catch (err) {
      return -1;
    }
  }

  public setPanXY(newX: number, newY: number): boolean {
    try {
      if (
        newX !== undefined &&
        newX !== null &&
        newY !== undefined &&
        newY !== null
      ) {
        this.panXY.x = newX;
        this.panXY.y = newY;
        return true;
      }
      return false;
    } catch (err) {
      console.log(
        'ObjectDetection setPanXY(newX: number, newY: number):boolean',
        err.name + ': ',
        err.message
      );
      return false;
    }
  }

  public SetGlobalXY(newX: number, newY: number): boolean {
    try {
      if (
        newX !== undefined &&
        newX !== null &&
        newY !== undefined &&
        newY !== null
      ) {
        this.globalXY.x = newX;
        this.globalXY.y = newY;
        return true;
      }
      return false;
    } catch (err) {
      console.log(
        'ObjectDetection SetGlobalXY(newX: number, newY: number):boolean',
        err.name + ': ',
        err.message
      );
      return false;
    }
  }

  public moveBoxWithinPointPath(
    imgx: number,
    imgy: number,
    imgw: number,
    imgh: number,
    addx: number,
    addy: number,
    box: Boundingbox
  ): Boolean {
    try {
      if (
        box.x1 + addx < imgx ||
        box.x2 + addx > imgx + imgw ||
        box.y1 + addy < imgy ||
        box.y2 + addy > imgy + imgh
      ) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(
        'ObjectDetection isWithinPointPath(imgx:number, imgy:number, imgw:number, imgh:number, addx:number, addy:number, box:Boundingbox):Boolean',
        err.name + ': ',
        err.message
      );
      return false;
    }
  }

  public mouseClickWithinPointPath(
    imgx: number,
    imgy: number,
    imgw: number,
    imgh: number,
    coorX: number,
    coorY: number
  ): boolean {
    try {
      if (
        coorX > imgx &&
        coorX < imgx + imgw &&
        coorY > imgy &&
        coorY < imgy + imgh
      ) {
        return true;
      }
      return false;
    } catch (err) {
      console.log(
        'ObjectDetection mouseClickWithinPointPath(imgx:number, imgy:number, imgw:number, imgh:number, coorX:number,):boolean',
        err.name + ': ',
        err.message
      );
      return false;
    }
  }

  public DrawAllBoxOn(
    boundbox: Boundingbox[],
    context: CanvasRenderingContext2D
  ) {
    try {
      for (var i = 0; i < boundbox.length; i++) {
        if (
          i == this.CurrentClickedBox.box ||
          i == this.CurrentSelectedBndBox
        ) {
          boundbox[i].color = 'rgba(0,255,0,1.0)';
          boundbox[i].lineWidth = 2;
          this.drawEachBoxOn(boundbox[i], context, true);
        } else {
          boundbox[i].color = 'rgba(255,255,0,0.8)';
          boundbox[i].lineWidth = 1;
          this.drawEachBoxOn(boundbox[i], context, false);
        }
      }
      if (
        this.CurrentClickedBox.box == -1 &&
        this.CurrentSelectedBndBox == undefined
      ) {
        for (var i = 0; i < boundbox.length; i++) {
          boundbox[i].color = 'rgba(255,255,0,0.8)';
          this.drawEachBoxOn(boundbox[i], context, false);
        }
        this.tmpbox = this.GenerateNewBox(
          this.CurrentDrawing.x1,
          this.CurrentDrawing.x2,
          this.CurrentDrawing.y1,
          this.CurrentDrawing.y2
        );
        if (this.tmpbox != null) {
          this.drawEachBoxOn(this.tmpbox, context, true);
        }
      }
    } catch (err) {
      console.log('redraw(boundbox) ----> ', err.name + ': ', err.message);
    }
  }

  private drawEachBoxOn(
    box: Boundingbox,
    context: CanvasRenderingContext2D,
    isSelected: boolean
  ): void {
    try {
      let xCenter = box.x1 + (box.x2 - box.x1) / 2;
      let yCenter = box.y1 + (box.y2 - box.y1) / 2;
      context.strokeStyle = box.color;
      context.fillStyle = box.color;
      context.beginPath();
      context.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      context.lineWidth = box.lineWidth;
      context.stroke();
      if (isSelected) {
        context.beginPath();
        context.fillRect(
          box.x1 - this.anchrSize,
          box.y1 - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          box.x1 - this.anchrSize,
          yCenter - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          box.x1 - this.anchrSize,
          box.y2 - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          xCenter - this.anchrSize,
          box.y1 - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          xCenter - this.anchrSize,
          yCenter - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          xCenter - this.anchrSize,
          box.y2 - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          box.x2 - this.anchrSize,
          box.y1 - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          box.x2 - this.anchrSize,
          yCenter - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
        context.fillRect(
          box.x2 - this.anchrSize,
          box.y2 - this.anchrSize,
          2 * this.anchrSize,
          2 * this.anchrSize
        );
      }
    } catch (err) {
      console.log(
        'ObjectDetection drawEachBoxOn(box:Boundingbox, context:CanvasRenderingContext2D, isSelected:boolean):void',
        err.name + ': ',
        err.message
      );
    }
  }

  private GenerateNewBox(
    x1: number,
    x2: number,
    y1: number,
    y2: number
  ): Boundingbox {
    try {
      let boxX1: number = x1 < x2 ? x1 : x2;
      let boxY1: number = y1 < y2 ? y1 : y2;
      let boxX2: number = x1 > x2 ? x1 : x2;
      let boxY2: number = y1 > y2 ? y1 : y2;
      if (boxX2 - boxX1 > this.lineOffset && boxY2 - boxY1 > this.lineOffset) {
        let newID: number = this.utility.GenerateUniquesID();
        return {
          x1: boxX1,
          y1: boxY1,
          x2: boxX2,
          y2: boxY2,
          lineWidth: 2,
          color: 'rgba(0,255,0,1.0)',
          distancetoImg: { x: 0, y: 0 },
          label: 'default',
          id: newID,
        };
      }
      return null;
    } catch (err) {
      console.log(
        'ObjectDetection GenerateNewBox(x1:number,x2:number,y1:number,y2:number):Boundingbox',
        err.name + ': ',
        err.message
      );
      return null;
    }
  }

  public GetCurrentClickBox(
    MouseX: number,
    MouseY: number,
    box: Boundingbox[]
  ): { box: number; pos: string } {
    try {
      this.CurrentClickedBox = this.mouseClickOnBoxeses(MouseX, MouseY, box);
      return this.CurrentClickedBox;
    } catch (err) {
      console.log(
        'ObjectDetection GetCurrentClickBox(MouseX:number, MouseY:number, box:Boundingbox[]):{box:number,pos:string}',
        err.name + ': ',
        err.message
      );
      return { box: -1, pos: 'o' };
    }
  }

  private mouseClickOnBoxeses(
    MouseX: number,
    MouseY: number,
    box: Boundingbox[]
  ): { box: number; pos: string } {
    try {
      for (var i = 0; i < box.length; ++i) {
        let xCenter: number = box[i].x1 + (box[i].x2 - box[i].x1) / 2;
        let yCenter: number = box[i].y1 + (box[i].y2 - box[i].y1) / 2;
        if (
          box[i].x1 - this.lineOffset < MouseX &&
          MouseX < box[i].x1 + this.lineOffset
        ) {
          if (
            box[i].y1 - this.lineOffset < MouseY &&
            MouseY < box[i].y1 + this.lineOffset
          ) {
            return { box: i, pos: 'tl' };
          } else if (
            box[i].y2 - this.lineOffset < MouseY &&
            MouseY < box[i].y2 + this.lineOffset
          ) {
            return { box: i, pos: 'bl' };
          } else if (
            yCenter - this.lineOffset < MouseY &&
            MouseY < yCenter + this.lineOffset
          ) {
            return { box: i, pos: 'l' };
          }
        } else if (
          box[i].x2 - this.lineOffset < MouseX &&
          MouseX < box[i].x2 + this.lineOffset
        ) {
          if (
            box[i].y1 - this.lineOffset < MouseY &&
            MouseY < box[i].y1 + this.lineOffset
          ) {
            return { box: i, pos: 'tr' };
          } else if (
            box[i].y2 - this.lineOffset < MouseY &&
            MouseY < box[i].y2 + this.lineOffset
          ) {
            return { box: i, pos: 'br' };
          } else if (
            yCenter - this.lineOffset < MouseY &&
            MouseY < yCenter + this.lineOffset
          ) {
            return { box: i, pos: 'r' };
          }
        } else if (
          xCenter - this.lineOffset < MouseX &&
          MouseX < xCenter + this.lineOffset
        ) {
          if (
            box[i].y1 - this.lineOffset < MouseY &&
            MouseY < box[i].y1 + this.lineOffset
          ) {
            return { box: i, pos: 't' };
          } else if (
            box[i].y2 - this.lineOffset < MouseY &&
            MouseY < box[i].y2 + this.lineOffset
          ) {
            return { box: i, pos: 'b' };
          } else if (
            box[i].y1 - this.lineOffset < MouseY &&
            MouseY < box[i].y2 + this.lineOffset
          ) {
            return { box: i, pos: 'i' };
          }
        } else if (
          box[i].x1 - this.lineOffset < MouseX &&
          MouseX < box[i].x2 + this.lineOffset
        ) {
          if (
            box[i].y1 - this.lineOffset < MouseY &&
            MouseY < box[i].y2 + this.lineOffset
          ) {
            return { box: i, pos: 'i' };
          }
        }
      }
      return { box: -1, pos: 'o' };
    } catch (err) {
      console.log(
        'ObjectDetection mouseClickonBoxeses(MouseX:number, MouseY:number, box:Boundingbox[]):{box:number,pos:string}',
        err.name + ': ',
        err.message
      );
      return { box: -1, pos: 'o' };
    }
  }
}
