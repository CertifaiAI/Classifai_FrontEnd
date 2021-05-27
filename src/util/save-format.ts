/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Boundingbox } from 'src/components/image-labelling/image-labelling.model';
import { cloneDeep } from 'lodash-es';
import { Utils } from './../shared/types/utils/utils';

export class YoloFormat {
    private box: Boundingbox[] = [];
    private imgW: number = 0;
    private imgH: number = 0;
    private labelListArr: string[] = [];
    constructor(bbox: Boundingbox[], oriimgW: number, oriimgH: number, labelList: string[]) {
        this.box = cloneDeep(bbox);
        this.imgW = cloneDeep(oriimgW);
        this.imgH = cloneDeep(oriimgH);
        this.labelListArr = cloneDeep(labelList);
    }
    generateYoloFormat() {
        try {
            let yoloText = '';
            for (let i = 0; i < this.box.length; ++i) {
                const centerX: number = (this.box[i].x1 + this.box[i].x2) / 2;
                const centerY: number = (this.box[i].y1 + this.box[i].y2) / 2;
                const WIDTH: number = this.box[i].x2 - this.box[i].x1;
                const HEIGHT: number = this.box[i].y2 - this.box[i].y1;

                if (this.labelListArr.indexOf(this.box[i].label) !== -1) {
                    yoloText += this.labelListArr.indexOf(this.box[i].label).toString() + ' ';
                } else {
                    yoloText += '-1 ';
                }

                yoloText += (centerX / this.imgW).toString() + ' ' + (centerY / this.imgH).toString() + ' ';
                yoloText += (WIDTH / this.imgW).toString() + ' ' + (HEIGHT / this.imgH).toString() + ' ';

                if (i !== this.box.length - 1) {
                    yoloText += '\n';
                }
            }
            return yoloText;
        } catch (err) {
            console.log('generateYoloFormat(RectangleContainer) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class CocoFormat {
    constructor() {}
}

export class JsonFormat {
    constructor() {}
}

export class PascalvocFormat {
    private utility: Utils = new Utils();
    private box: Boundingbox[] = [];
    private imgPath: string = '';
    private imgOri_W: number = 0;
    private imgOri_H: number = 0;
    private imgDepth: number = 0;
    constructor(bbox: Boundingbox[], imgpath: string, imgori_W: number, imgori_H: number, imgdepth: number) {
        this.box = cloneDeep(bbox);
        this.imgPath = cloneDeep(imgpath);
        this.imgOri_W = cloneDeep(imgori_W);
        this.imgOri_H = cloneDeep(imgori_H);
        this.imgDepth = cloneDeep(imgdepth);
    }

    createNodeName(nodename: string) {
        try {
            return ['<' + nodename + '>', '</' + nodename + '>\n'];
        } catch (err) {
            console.log('createNodeName(nodename) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    GeneratePVOCFormat() {
        try {
            let pvocStartText = '<annotation>\n';
            const cimg = cloneDeep({ imgpath: this.imgPath });
            const filename = this.utility.getFilename(cimg.imgpath);
            const foldername = this.utility.GetFoldername(cimg.imgpath);
            const databaseitem = 'unknown';
            const foldernode = this.createNodeName('folder');
            pvocStartText += '\t' + foldernode[0] + foldername + foldernode[1];
            const filenamenode = this.createNodeName('filename');
            pvocStartText += '\t' + filenamenode[0] + filename + filenamenode[1];
            const pathnode = this.createNodeName('path');
            pvocStartText += '\t' + pathnode[0] + this.imgPath.split('\\').join('/') + pathnode[1];
            const sourcenode = this.createNodeName('source');
            const databasechildnode = this.createNodeName('database');
            pvocStartText += '\t' + sourcenode[0] + '\n';
            pvocStartText += '\t\t' + databasechildnode[0] + databaseitem + databasechildnode[1];
            pvocStartText += '\t' + sourcenode[1];
            const sizenode = this.createNodeName('size');
            pvocStartText += '\t' + sizenode[0] + '\n';
            const widthchildnode = this.createNodeName('width');
            const heightchildnode = this.createNodeName('height');
            const depthchildnode = this.createNodeName('depth');
            pvocStartText += '\t\t' + widthchildnode[0] + this.imgOri_W.toString() + widthchildnode[1];
            pvocStartText += '\t\t' + heightchildnode[0] + this.imgOri_H.toString() + heightchildnode[1];
            pvocStartText += '\t\t' + depthchildnode[0] + this.imgDepth.toString() + depthchildnode[1];
            pvocStartText += '\t' + sizenode[1];
            const segmentednode = this.createNodeName('segmented');
            pvocStartText += '\t' + segmentednode[0] + '0' + segmentednode[1];
            const objectnode = this.createNodeName('object');

            for (const { label, x1, x2, y1, y2 } of this.box) {
                pvocStartText += '\t' + objectnode[0] + '\n';
                const namechildnode = this.createNodeName('name');
                const posechildnode = this.createNodeName('pose');
                const truncatedchildnode = this.createNodeName('truncated');
                const difficultchildnode = this.createNodeName('difficult');
                const bndboxchildnode = this.createNodeName('bndbox');
                const xminsubchildnode = this.createNodeName('xmin');
                const yminsubchildnode = this.createNodeName('ymin');
                const xmaxsubchildnode = this.createNodeName('xmax');
                const ymaxsubchildnode = this.createNodeName('ymax');
                pvocStartText += '\t\t' + namechildnode[0] + label + namechildnode[1];
                pvocStartText += '\t\t' + posechildnode[0] + 'Unspecified' + posechildnode[1];
                pvocStartText += '\t\t' + truncatedchildnode[0] + '0' + truncatedchildnode[1];
                pvocStartText += '\t\t' + difficultchildnode[0] + '0' + difficultchildnode[1];
                pvocStartText += '\t\t' + bndboxchildnode[0] + '\n';
                pvocStartText += '\t\t\t' + xminsubchildnode[0] + Math.floor(x1).toString() + xminsubchildnode[1];
                pvocStartText += '\t\t\t' + yminsubchildnode[0] + Math.floor(y1).toString() + yminsubchildnode[1];
                pvocStartText += '\t\t\t' + xmaxsubchildnode[0] + Math.floor(x2).toString() + xmaxsubchildnode[1];
                pvocStartText += '\t\t\t' + ymaxsubchildnode[0] + Math.floor(y2).toString() + ymaxsubchildnode[1];
                pvocStartText += '\t\t' + bndboxchildnode[1];
                pvocStartText += '\t' + objectnode[1];
            }
            pvocStartText += '</annotation>';

            return pvocStartText;
        } catch (err) {
            console.log('GeneratePVOCFormat(RectangleContainer) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class LabelFormat {
    private labelist: string[] = [];
    constructor(lblList: string[]) {
        this.labelist = cloneDeep(lblList);
    }

    GenerateLabelFormat() {
        try {
            let labelstring = '';
            for (let i = 0; i < this.labelist.length; ++i) {
                labelstring += this.labelist[i].toString();
                if (i !== this.labelist.length - 1) {
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

export class CsvFormat {
    constructor() {}
}
