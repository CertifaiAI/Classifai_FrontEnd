import { BoundingBox } from './../shared/type-casting/meta-data/meta-data.model';
export class YOLO {
    private box: BoundingBox[] = [];
    private imgW: number = 0;
    private imgH: number = 0;
    private LabelListarr: string[] = [];
    constructor(bbox: BoundingBox[], oriimgW: number, oriimgH: number, labelList: string[]) {
        this.box = bbox;
        this.imgW = oriimgW;
        this.imgH = oriimgH;
        this.LabelListarr = labelList;
    }
    GenerateYOLOformat() {
        try {
            let YOLOString = '';
            for (var i = 0; i < this.box.length; ++i) {
                let centerX: number = (this.box[i].x1 + this.box[i].x2) / 2;
                let centerY: number = (this.box[i].y1 + this.box[i].y2) / 2;
                let WIDTH: number = this.box[i].x2 - this.box[i].x1;
                let HEIGHT: number = this.box[i].y2 - this.box[i].y1;

                if (this.LabelListarr.indexOf(this.box[i].label) != -1) {
                    YOLOString += this.LabelListarr.indexOf(this.box[i].label).toString() + ' ';
                } else {
                    YOLOString += '-1 ';
                }

                YOLOString += (centerX / this.imgW).toString() + ' ' + (centerY / this.imgH).toString() + ' ';
                YOLOString += (WIDTH / this.imgW).toString() + ' ' + (HEIGHT / this.imgH).toString() + ' ';

                if (i != this.box.length - 1) {
                    YOLOString += '\n';
                }
            }
            return YOLOString;
        } catch (err) {
            console.log('GenerateYOLOformat(RectangleContainer) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class COCO {
    constructor() {}
}

export class JSON {
    constructor() {}
}

export class PASCALVOC {
    constructor() {}
}

export class LABEL {
    constructor() {}
}

export class CSV {
    constructor() {}
}
