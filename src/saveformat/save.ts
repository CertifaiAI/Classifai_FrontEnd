import { Utils } from './../shared/type-casting/utils/utils';
import { BoundingBox } from './../shared/type-casting/meta-data/meta-data.model';
import { cloneDeep } from 'lodash-es';
export class YOLO {
    private box: BoundingBox[] = [];
    private imgW: number = 0;
    private imgH: number = 0;
    private LabelListarr: string[] = [];
    constructor(bbox: BoundingBox[], oriimgW: number, oriimgH: number, labelList: string[]) {
        this.box = cloneDeep(bbox);
        this.imgW = cloneDeep(oriimgW);
        this.imgH = cloneDeep(oriimgH);
        this.LabelListarr = cloneDeep(labelList);
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
    private utility: Utils = new Utils();
    private box: BoundingBox[] = [];
    private imgPath: string = '';
    private imgOri_W: number = 0;
    private imgOri_H: number = 0;
    private imgDepth: number = 0;
    constructor(bbox: BoundingBox[], imgpath: string, imgori_W: number, imgori_H: number, imgdepth: number) {
        this.box = cloneDeep(bbox);
        this.imgPath = cloneDeep(imgpath);
        this.imgOri_W = cloneDeep(imgori_W);
        this.imgOri_H = cloneDeep(imgori_H);
        this.imgDepth = cloneDeep(imgdepth);
    }

    CreateNodeName(nodename: string) {
        try {
            return ['<' + nodename + '>', '</' + nodename + '>\n'];
        } catch (err) {
            console.log('CreateNodeName(nodename) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    GeneratePVOCFormat() {
        try {
            var PVOCStartStr = '<annotation>\n';
            let cimg = cloneDeep({ imgpath: this.imgPath });
            let filename = this.utility.getFilename(cimg.imgpath);
            let foldername = this.utility.GetFoldername(cimg.imgpath);
            let databaseitem = 'unknown';
            let foldernode = this.CreateNodeName('folder');
            PVOCStartStr += '\t' + foldernode[0] + foldername + foldernode[1];
            let filenamenode = this.CreateNodeName('filename');
            PVOCStartStr += '\t' + filenamenode[0] + filename + filenamenode[1];
            let pathnode = this.CreateNodeName('path');
            PVOCStartStr += '\t' + pathnode[0] + this.imgPath.split('\\').join('/') + pathnode[1];
            let sourcenode = this.CreateNodeName('source');
            let databasechildnode = this.CreateNodeName('database');
            PVOCStartStr += '\t' + sourcenode[0] + '\n';
            PVOCStartStr += '\t\t' + databasechildnode[0] + databaseitem + databasechildnode[1];
            PVOCStartStr += '\t' + sourcenode[1];
            let sizenode = this.CreateNodeName('size');
            PVOCStartStr += '\t' + sizenode[0] + '\n';
            let widthchildnode = this.CreateNodeName('width');
            let heightchildnode = this.CreateNodeName('height');
            let depthchildnode = this.CreateNodeName('depth');
            PVOCStartStr += '\t\t' + widthchildnode[0] + this.imgOri_W.toString() + widthchildnode[1];
            PVOCStartStr += '\t\t' + heightchildnode[0] + this.imgOri_H.toString() + heightchildnode[1];
            PVOCStartStr += '\t\t' + depthchildnode[0] + this.imgDepth.toString() + depthchildnode[1];
            PVOCStartStr += '\t' + sizenode[1];
            let segmentednode = this.CreateNodeName('segmented');
            PVOCStartStr += '\t' + segmentednode[0] + '0' + segmentednode[1];
            let objectnode = this.CreateNodeName('object');
            for (var i = 0; i < this.box.length; ++i) {
                PVOCStartStr += '\t' + objectnode[0] + '\n';
                let namechildnode = this.CreateNodeName('name');
                let posechildnode = this.CreateNodeName('pose');
                let truncatedchildnode = this.CreateNodeName('truncated');
                let difficultchildnode = this.CreateNodeName('difficult');
                let bndboxchildnode = this.CreateNodeName('bndbox');
                let xminsubchildnode = this.CreateNodeName('xmin');
                let yminsubchildnode = this.CreateNodeName('ymin');
                let xmaxsubchildnode = this.CreateNodeName('xmax');
                let ymaxsubchildnode = this.CreateNodeName('ymax');
                PVOCStartStr += '\t\t' + namechildnode[0] + this.box[i].label + namechildnode[1];
                PVOCStartStr += '\t\t' + posechildnode[0] + 'Unspecified' + posechildnode[1];
                PVOCStartStr += '\t\t' + truncatedchildnode[0] + '0' + truncatedchildnode[1];
                PVOCStartStr += '\t\t' + difficultchildnode[0] + '0' + difficultchildnode[1];
                PVOCStartStr += '\t\t' + bndboxchildnode[0] + '\n';
                PVOCStartStr +=
                    '\t\t\t' + xminsubchildnode[0] + Math.floor(this.box[i].x1).toString() + xminsubchildnode[1];
                PVOCStartStr +=
                    '\t\t\t' + yminsubchildnode[0] + Math.floor(this.box[i].y1).toString() + yminsubchildnode[1];
                PVOCStartStr +=
                    '\t\t\t' + xmaxsubchildnode[0] + Math.floor(this.box[i].x2).toString() + xmaxsubchildnode[1];
                PVOCStartStr +=
                    '\t\t\t' + ymaxsubchildnode[0] + Math.floor(this.box[i].y2).toString() + ymaxsubchildnode[1];
                PVOCStartStr += '\t\t' + bndboxchildnode[1];
                PVOCStartStr += '\t' + objectnode[1];
            }
            PVOCStartStr += '</annotation>';

            return PVOCStartStr;
        } catch (err) {
            console.log('GeneratePVOCFormat(RectangleContainer) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class LABEL {
    private labelist: string[] = [];
    constructor(lblList: string[]) {
        this.labelist = cloneDeep(lblList);
    }

    GenerateLabelFormat() {
        try {
            let labelstring = '';
            for (var i = 0; i < this.labelist.length; ++i) {
                labelstring += this.labelist[i].toString();
                if (i != this.labelist.length - 1) {
                    labelstring += '\n';
                }
            }
            return labelstring;
        } catch (err) {
            console.log('GenerateLabelFormat(Labelcontainer) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class CSV {
    constructor() {}
}
