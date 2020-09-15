import { xycoordinate, Boundingbox } from './CustomType';

export class ObjectDetection {
  private globalXY: xycoordinate = { x: 0, y: 0 };
  private panXY: xycoordinate = { x: 0, y: 0 };
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
        'ObjectDetection public GetdiffXY(offsetX: number,offsetY: number): { diffX: number; diffY: number }',
        err.name + ': ',
        err.message
      );
      return null;
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
}
