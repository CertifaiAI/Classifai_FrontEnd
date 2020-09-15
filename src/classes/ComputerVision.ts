import { xycoordinate } from './CustomType';

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
      return null;
    }
  }

  public setPanXY(newX: number, newY: number) {
    try {
      if (
        newX !== undefined &&
        newX !== null &&
        newY !== undefined &&
        newY !== null
      ) {
        this.panXY.x = newX;
        this.panXY.y = newY;
      }
    } catch (err) {}
  }

  public SetGlobalXY(newX: number, newY: number) {
    try {
      if (
        newX !== undefined &&
        newX !== null &&
        newY !== undefined &&
        newY !== null
      ) {
        this.globalXY.x = newX;
        this.globalXY.y = newY;
      }
    } catch (err) {}
  }
}
