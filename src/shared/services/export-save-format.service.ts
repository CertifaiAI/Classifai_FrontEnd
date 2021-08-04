/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import * as fileSaver from 'file-saver';
import * as jszip from 'jszip';
import { WithOptional } from 'shared/types/with-optional/with-optional';
import {
    CompleteMetadata,
    PolyMetadata,
    BboxMetadata,
    Coordinate,
    Polygons,
    SubLabel,
} from 'shared/types/image-labelling/image-labelling.model';

export type SaveFormat = 'pascalVoc' | 'yolo' | 'ocr' | 'label' | 'coco' | 'json';

export type ExportSaveType = {
    saveCurrentImage: boolean;
    saveBulk: boolean;
};

export type ProcessResponse = {
    message: number;
    msg: string;
};

type ExportSaveConfig = {
    projectName: string;
    saveFormat: SaveFormat;
    metadata?: CompleteMetadata;
    projectFullMetadata?: CompleteMetadata[];
    index: number;
    labelList?: string[];
    fullLabelList?: string[];
};

type SaveLabelFormat = {
    content: string;
    filename: string;
    type: 'text/plain;charset=utf-8' | 'text/xml;charset=utf-8' | 'text/csv;charset=utf-8' | 'text/json;charset=utf-8';
};

type SaveAsZip = {
    filename: string;
    content: string;
}[];

@Injectable({
    providedIn: 'any',
})
export class ExportSaveFormatService {
    async exportSaveFormat({
        saveCurrentImage,
        saveFormat,
        metadata,
        index,
        projectName,
        fullLabelList,
        labelList,
        projectFullMetadata,
    }: ExportSaveType & ExportSaveConfig) {
        switch (saveFormat) {
            case 'pascalVoc':
                return this.exportPascalVOC(metadata, labelList, saveCurrentImage, projectFullMetadata, projectName);
            case 'yolo':
                return this.exportYolo(
                    metadata,
                    labelList,
                    saveCurrentImage,
                    projectFullMetadata,
                    projectName,
                    saveFormat,
                );
            case 'ocr':
                return this.exportOCR(metadata, projectFullMetadata, projectName, fullLabelList);
            case 'label':
                if (!labelList) {
                    return { message: 0, msg: 'warning.noLabelList' };
                }
                const filename = `${projectName}_label.txt`;
                const content = this.generateLabelFormat(labelList);
                if (content === '') {
                    return { message: 0, msg: 'warning.noLabelSelected' };
                }
                this.saveFile({ content, filename, type: 'text/plain;charset=utf-8' });
                return { message: 1, msg: 'success' };
            case 'coco':
                if (!projectFullMetadata) {
                    return { message: 0, msg: 'warning.noImageList' };
                }

                const verticesPolyMetadata = this.calPolyCoorOriginalImages(projectFullMetadata as PolyMetadata[]);
                const verticesContent = this.getCocoContent(verticesPolyMetadata, labelList);
                const verticesFilename = this.getCocoFileName(projectName);
                this.saveFile({
                    content: verticesContent,
                    filename: verticesFilename,
                    type: 'text/json;charset=utf-8',
                });
                return { message: 1, msg: 'success' };
            case 'json':
                if (!metadata) {
                    return { message: 0, msg: 'warning.noMetadata' };
                }
                if (!metadata?.polygons) {
                    return { message: 0, msg: 'warning.noPolygon' };
                }
                if (!projectFullMetadata) {
                    return { message: 0, msg: 'warning.noImageList' };
                }
                const jsonPolyMetadata = this.calPolyCoorOriginalImages(projectFullMetadata as PolyMetadata[]);
                const jsonContent = this.getJsonContent(jsonPolyMetadata);
                const jsonFilename = this.getJsonFileName(projectName);
                this.saveFile({
                    content: jsonContent,
                    filename: jsonFilename,
                    type: 'text/json;charset=utf-8',
                });
                return { message: 1, msg: 'success' };
        }
    }

    private async exportPascalVOC(
        metadata: CompleteMetadata | undefined,
        labelList: string[] | undefined,
        saveCurrentImage: boolean,
        projectFullMetadata: CompleteMetadata[] | undefined,
        projectName: string,
    ) {
        if (!metadata) {
            return { message: 0, msg: 'warning.noMetadata' };
        }
        if (!metadata?.bnd_box) {
            return { message: 0, msg: 'warning.noBoundingBox' };
        }
        if (!labelList) {
            return { message: 0, msg: 'warning.noLabelList' };
        }

        if (saveCurrentImage) {
            const calculatedBoxMetadata = this.calBoxCoorOriginalImages(metadata as BboxMetadata);
            const filename = this.getFileName(metadata.img_path);
            const { img_path, img_depth, img_ori_w, img_ori_h } = metadata;
            const pascalVocData = {
                img_path,
                img_depth,
                img_ori_w,
                img_ori_h,
                bnd_box: calculatedBoxMetadata,
            };
            const content = this.generatePascalVocFormat(pascalVocData, labelList);
            const splitfilenameArr = filename.split('.');
            const finalizedFilename = splitfilenameArr[0] + '.xml';
            this.saveFile({ content, filename: finalizedFilename, type: 'text/xml;charset=utf-8' });
            return { message: 1, msg: 'success' };
        } else {
            if (!projectFullMetadata) {
                return { message: 0, msg: 'warning.noImageList' };
            }
            const { pascalVocList, isEmpty } = this.pushPascalVOCToList(projectFullMetadata, labelList);
            if (isEmpty) {
                return { message: 0, msg: 'warning.noLabelSelected' };
            }
            if (!pascalVocList) {
                return { message: 0, msg: 'warning.noProgress' };
            }
            await this.saveAsZip(pascalVocList, 'pascal_voc', projectName);
            return { message: 1, msg: 'success' };
        }
    }

    private pushPascalVOCToList(projectFullMetadata: CompleteMetadata[], labelList: string[]) {
        const pascalVocList: { filename: string; content: string }[] = [];
        let isEmpty = true;
        projectFullMetadata.forEach((meta) => {
            const bboxLabels = meta.bnd_box ? meta.bnd_box.map((x) => x.label) : [];
            const found = bboxLabels.some((r) => labelList.indexOf(r) >= 0);
            if (meta.bnd_box && meta.bnd_box.length > 0 && found) {
                isEmpty = false;
                const calculatedBoxMetadata = this.calBoxCoorOriginalImages(meta as BboxMetadata);
                const filename = this.getFileName(meta.img_path);
                const { img_path, img_depth, img_ori_w, img_ori_h } = meta;
                const pascalVocData = {
                    img_path,
                    img_depth,
                    img_ori_w,
                    img_ori_h,
                    bnd_box: calculatedBoxMetadata,
                };
                const content = this.generatePascalVocFormat(pascalVocData, labelList);
                const splitfilenameArr = filename.split('.');
                const finalizedFilename = `${splitfilenameArr[0]}.xml`;
                pascalVocList.push({
                    filename: finalizedFilename,
                    content,
                });
            }
        });

        return { pascalVocList, isEmpty };
    }

    private async exportYolo(
        metadata: CompleteMetadata | undefined,
        labelList: string[] | undefined,
        saveCurrentImage: boolean,
        projectFullMetadata: CompleteMetadata[] | undefined,
        projectName: string,
        saveFormat: SaveFormat,
    ) {
        if (!metadata) {
            return { message: 0, msg: 'warning.noMetadata' };
        }
        if (!metadata?.bnd_box) {
            return { message: 0, msg: 'warning.noBoundingBox' };
        }
        if (!labelList) {
            return { message: 0, msg: 'warning.noLabelList' };
        }

        if (saveCurrentImage) {
            const calculatedBoxMetadata = this.calBoxCoorOriginalImages(metadata as BboxMetadata);
            const filename = this.getFileName(metadata.img_path);
            const { img_ori_w, img_ori_h } = metadata;
            const yoloData = {
                img_ori_w,
                img_ori_h,
                bnd_box: calculatedBoxMetadata,
            };
            const content = this.generateYoloFormat({ ...yoloData }, labelList);
            const splitfilenameArr = filename.split('.');
            const finalizedFilename = `${splitfilenameArr[0]}.txt`;
            this.saveFile({ content, filename: finalizedFilename, type: 'text/plain;charset=utf-8' });
            return { message: 1, msg: 'success' };
        } else {
            if (!projectFullMetadata) {
                return { message: 0, msg: 'warning.noImageList' };
            }
            const { yoloList, isEmpty } = this.pushYoloToList(projectFullMetadata, labelList);
            if (isEmpty) {
                return { message: 0, msg: 'warning.noLabelSelected' };
            }
            if (!yoloList) {
                return { message: 0, msg: 'warning.noProgress' };
            }
            await this.saveAsZip(yoloList, saveFormat, projectName);
            return { message: 1, msg: 'success' };
        }
    }

    private pushYoloToList(projectFullMetadata: CompleteMetadata[], labelList: string[]) {
        const yoloList: { filename: string; content: string }[] = [];
        let isEmpty = true;
        projectFullMetadata.forEach((meta) => {
            const bboxLabels = meta.bnd_box ? meta.bnd_box.map((x) => x.label) : [];
            const found = bboxLabels.some((r) => labelList.indexOf(r) >= 0);
            if (meta.bnd_box && meta.bnd_box.length > 0 && found) {
                isEmpty = false;
                const calculatedBoxMetadata = this.calBoxCoorOriginalImages(meta as BboxMetadata);
                const filename = this.getFileName(meta.img_path);
                const { img_ori_w, img_ori_h } = meta;
                const yoloData = {
                    img_ori_w,
                    img_ori_h,
                    bnd_box: calculatedBoxMetadata,
                };
                const content = this.generateYoloFormat({ ...yoloData }, labelList);
                const splitfilenameArr = filename.split('.');
                const finalizedFilename = `${splitfilenameArr[0]}.txt`;
                yoloList.push({
                    filename: finalizedFilename,
                    content,
                });
            }
        });

        return { yoloList, isEmpty };
    }

    private exportOCR(
        metadata: CompleteMetadata | undefined,
        projectFullMetadata: CompleteMetadata[] | undefined,
        projectName: string,
        fullLabelList: string[] | undefined,
    ) {
        if (!metadata) {
            return { message: 0, msg: 'warning.noMetadata' };
        }
        if (!metadata?.bnd_box) {
            return { message: 0, msg: 'warning.noBoundingBox' };
        }
        if (!projectFullMetadata) {
            return { message: 0, msg: 'warning.noImageList' };
        }
        if (!fullLabelList) {
            return { message: 0, msg: 'warning.noImageList' };
        }

        let ocrText = '';
        let counting = 0;
        projectFullMetadata.forEach((meta, i) => {
            if (i === 0) {
                ocrText += 'filename,x1,y1,x2,y2,label\n';
            }
            const calculatedBoxMetadata = this.calBoxCoorOriginalImages(meta as BboxMetadata);
            const filename = this.getFileName(meta.img_path);
            const ocrContent = this.generateOCRFormat({ bnd_box: calculatedBoxMetadata }, filename, fullLabelList);
            if (ocrContent === '') {
                counting++;
            }
            ocrText += `${ocrContent}`;
        });
        if (!ocrText || counting === projectFullMetadata.length) {
            return { message: 0, msg: 'warning.noProgress' };
        }
        this.saveFile({
            content: ocrText,
            filename: `${projectName}_text_ocr_labels.csv`,
            type: 'text/csv;charset=utf-8',
        });
        return { message: 1, msg: 'success' };
    }

    private calBoxCoorOriginalImages({ bnd_box, img_w, img_h, img_ori_w, img_ori_h }: BboxMetadata) {
        const xScaledFactor = img_ori_w / img_w;
        const yScaledFactor = img_ori_h / img_h;
        return bnd_box.map((box) => {
            const { subLabel, region, ...boxMetadata } = box;
            const oriImgRectWidth = (box.x2 - box.x1) * xScaledFactor;
            const oriImgRectHeight = (box.y2 - box.y1) * yScaledFactor;
            const oriImgRecX1 = box.distancetoImg.x * xScaledFactor;
            const oriImgRecX2 = oriImgRecX1 + oriImgRectWidth;
            const oriImgRecY1 = box.distancetoImg.y * yScaledFactor;
            const oriImgRecY2 = oriImgRecY1 + oriImgRectHeight;
            return {
                ...boxMetadata,
                x1: oriImgRecX1,
                x2: oriImgRecX2,
                y1: oriImgRecY1,
                y2: oriImgRecY2,
            };
        });
    }

    private calPolyCoorOriginalImages(metadata: PolyMetadata[]): PolyMetadata[] {
        return metadata.map(({ img_ori_w, img_ori_h, img_w, img_h, polygons, ...metaprops }) => {
            const xScaledFactor = img_ori_w / img_w;
            const yScaledFactor = img_ori_h / img_h;
            const polygonList = polygons.filter(({ coorPt }) =>
                coorPt.map(({ distancetoImg }) => {
                    const tempX = distancetoImg.x * xScaledFactor;
                    const tempY = distancetoImg.y * yScaledFactor;
                    return {
                        distancetoImg,
                        x: tempX,
                        y: tempY,
                    };
                }),
            );
            return { ...metaprops, img_ori_w, img_ori_h, img_w, img_h, polygons: polygonList };
        });
    }

    private generatePascalVocFormat(
        {
            bnd_box,
            img_path,
            img_depth,
            img_ori_w,
            img_ori_h,
        }: WithOptional<
            Pick<BboxMetadata, 'bnd_box' | 'img_path' | 'img_depth' | 'img_ori_w' | 'img_ori_h'>,
            'img_depth'
        >,
        labelList: string[],
    ) {
        let pVocStart = '<annotation>\n';
        const filename = this.getItemName('file', img_path);
        const foldername = this.getItemName('folder', img_path);
        const databaseItem = 'unknown';
        const folderNode = this.createNode('folder');
        pVocStart += '\t' + folderNode[0] + foldername + folderNode[1];
        const filenameNode = this.createNode('filename');
        pVocStart += '\t' + filenameNode[0] + filename + filenameNode[1];
        const pathNode = this.createNode('path');
        pVocStart += '\t' + pathNode[0] + img_path.split('\\').join('/') + pathNode[1];
        const sourceNode = this.createNode('source');
        const databaseChildNode = this.createNode('database');
        pVocStart += '\t' + sourceNode[0] + '\n';
        pVocStart += '\t\t' + databaseChildNode[0] + databaseItem + databaseChildNode[1];
        pVocStart += '\t' + sourceNode[1];
        const sizeNode = this.createNode('size');
        pVocStart += '\t' + sizeNode[0] + '\n';
        const widthChildNode = this.createNode('width');
        const heightChildNode = this.createNode('height');
        const depthChildNode = this.createNode('depth');
        pVocStart += '\t\t' + widthChildNode[0] + img_ori_w.toString() + widthChildNode[1];
        pVocStart += '\t\t' + heightChildNode[0] + img_ori_h.toString() + heightChildNode[1];
        pVocStart += '\t\t' + depthChildNode[0] + img_depth?.toString() + depthChildNode[1];
        pVocStart += '\t' + sizeNode[1];
        const segmentedNode = this.createNode('segmented');
        pVocStart += '\t' + segmentedNode[0] + '0' + segmentedNode[1];
        const objectNode = this.createNode('object');

        for (const [_, { label, x1, x2, y1, y2 }] of bnd_box.entries()) {
            if (labelList.indexOf(label) !== -1) {
                pVocStart += '\t' + objectNode[0] + '\n';
                const nameChildNode = this.createNode('name');
                const poseChildNode = this.createNode('pose');
                const truncatedChildNode = this.createNode('truncated');
                const difficultChildNode = this.createNode('difficult');
                const bndboxChildNode = this.createNode('bndbox');
                const xMinSubChildNode = this.createNode('xmin');
                const yMinSubChildNode = this.createNode('ymin');
                const xMaxSubChildNode = this.createNode('xmax');
                const yMaxSubChildNode = this.createNode('ymax');
                pVocStart += '\t\t' + nameChildNode[0] + label + nameChildNode[1];
                pVocStart += '\t\t' + poseChildNode[0] + 'Unspecified' + poseChildNode[1];
                pVocStart += '\t\t' + truncatedChildNode[0] + '0' + truncatedChildNode[1];
                pVocStart += '\t\t' + difficultChildNode[0] + '0' + difficultChildNode[1];
                pVocStart += '\t\t' + bndboxChildNode[0] + '\n';
                pVocStart += '\t\t\t' + xMinSubChildNode[0] + Math.floor(x1).toString() + xMinSubChildNode[1];
                pVocStart += '\t\t\t' + yMinSubChildNode[0] + Math.floor(y1).toString() + yMinSubChildNode[1];
                pVocStart += '\t\t\t' + xMaxSubChildNode[0] + Math.floor(x2).toString() + xMaxSubChildNode[1];
                pVocStart += '\t\t\t' + yMaxSubChildNode[0] + Math.floor(y2).toString() + yMaxSubChildNode[1];
                pVocStart += '\t\t' + bndboxChildNode[1];
                pVocStart += '\t' + objectNode[1];
            }
        }
        pVocStart += '</annotation>';

        return pVocStart;
    }

    private generateYoloFormat(
        { bnd_box, img_ori_w, img_ori_h }: Pick<BboxMetadata, 'img_ori_w' | 'img_ori_h' | 'bnd_box'>,
        labelList: string[],
    ) {
        return bnd_box.reduce((prev, { x1, x2, y1, y2, label }, i) => {
            if (labelList.indexOf(label) === -1) {
                return prev;
            }

            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const width = x2 - x1;
            const height = y2 - y1;
            // * required: an extra space at the end for YOLO format
            prev += `${labelList.indexOf(label).toString()} `;
            prev += `${(centerX / img_ori_w).toString()} ${(centerY / img_ori_h).toString()} `;
            prev += `${(width / img_ori_w).toString()} ${(height / img_ori_h).toString()} `;

            if (i !== bnd_box.length) {
                prev += '\n';
            }

            return prev;
        }, '');
    }

    private generateOCRFormat({ bnd_box }: Pick<BboxMetadata, 'bnd_box'>, filename: string, labelList: string[]) {
        return bnd_box.reduce((prev, { x1, x2, y1, y2, label }) => {
            if (labelList.indexOf(label) === -1) {
                prev += `${filename},${x1.toString()},${y1.toString()}`;
                prev += `,${x2.toString()},${y2.toString()},${label.toString()}\n`;
                return prev;
            } else {
                return prev;
            }
        }, '');
    }

    private getItemName(type: 'file' | 'folder', imgPath: string) {
        const joinedImgPath = imgPath.split('\\').join('/');
        const splitArrImgPath = joinedImgPath.split('/');
        if (type === 'folder') {
            splitArrImgPath.pop();
            return splitArrImgPath.join('/');
        }
        return splitArrImgPath[splitArrImgPath.length - 1];
    }

    private createNode(nodeName: string) {
        return ['<' + nodeName + '>', '</' + nodeName + '>\n'];
    }

    private generateLabelFormat(labels: string[]) {
        return labels.reduce((prev, curr, i) => {
            prev += curr;
            if (i !== prev.length) {
                return prev + '\n';
            }
            return prev;
        }, '');
    }

    private saveFile({ content, filename, type }: SaveLabelFormat) {
        const blob = new Blob([content], { type });
        fileSaver.saveAs(blob, filename);
    }

    private async saveAsZip(item: SaveAsZip, formatName: string, projectName: string) {
        const zipfile = new jszip();
        for (const [_, { content, filename }] of item.entries()) {
            zipfile.file(filename, content);
        }
        const blobData = await zipfile.generateAsync({ type: 'blob' });
        fileSaver.saveAs(blobData, `${projectName}_${formatName}_labels.zip`);
    }

    private getFileName(name: string) {
        const splitName = name.split('\\').join('/').split('/');

        return splitName[splitName.length - 1];
    }

    private getCocoFileName(projectName: string) {
        return `${projectName}_segmentation_coco.json`;
    }

    private getJsonFileName(projectName: string) {
        return `${projectName}_segmentation_JSON.json`;
    }

    // private getFileExtensionName(filename: string) {
    //     return filename.split('.').pop();
    // }

    private getCocoContent(metadata: PolyMetadata[], labelList?: string[]) {
        let cocoContent: string = '{';
        cocoContent += this.generateCocoInfo();
        cocoContent += this.generateCocoImage(metadata);
        cocoContent += this.generateCocoAnnotation(metadata, labelList);
        cocoContent += this.generateCocoLicense();
        cocoContent += this.generateCocoCategory(labelList);
        cocoContent += '}';
        cocoContent = cocoContent.replace(/(}{)/gi, '},{');
        return cocoContent;
    }

    private generateCocoInfo() {
        const d = new Date();
        let cocoInfo: string = `"info":{`;
        cocoInfo += `"year":"${d.getFullYear().toString()}",`;
        cocoInfo += `"version":"1.0",`;
        cocoInfo += `"description"\:\"VIA project exported to COCO format using classifai(https://classifai.ai/)",`;
        cocoInfo += `"contributor":"",`;
        cocoInfo += `"url":"https://classifai.ai/",`;
        cocoInfo += `"date_created":"${d.toUTCString()}"`;
        cocoInfo += '},';
        return cocoInfo;
    }

    private generateCocoImage(metadata: PolyMetadata[]) {
        let cocoImage = '"images":[';
        cocoImage += metadata.reduce((prev, { img_ori_w, img_ori_h, img_path }, i) => {
            prev += `{"id":${(i + 1).toString()},`;
            prev += `"width":${img_ori_w.toString()},`;
            prev += `"height":${img_ori_h.toString()},`;
            prev += `"file_name":"${this.getFileName(img_path)}",`;
            prev += `"license":0,`;
            prev += `"date_captured":""}`;
            if (i !== metadata.length) {
                prev += ',';
            }
            return prev;
        }, '');
        cocoImage = cocoImage.slice(0, -1);
        cocoImage += `],`;
        return cocoImage;
    }

    private generateCocoAnnotation(metadata: PolyMetadata[], labelList?: string[]) {
        let cocoAnnotation = `"annotations":[`;
        let count = 0;
        cocoAnnotation += metadata.reduce((prevMetadata, { polygons }, i) => {
            if (polygons.length > 0) {
                count += 1;
                const calculatedPolyMetadata = this.calPolyCoorOriginalImages(metadata);
                const filteredPoly = this.getFilteredPoly(calculatedPolyMetadata);
                prevMetadata += filteredPoly.reduce((prevFilteredPoly, { coorPt, label, ...polyRest }, j) => {
                    prevFilteredPoly += `{"segmentation":[`;
                    if (coorPt.length > 0) {
                        prevFilteredPoly += `[`;
                        prevFilteredPoly += this.getPolyCoordinate(coorPt);
                        prevFilteredPoly += ']';
                    }
                    const bndBox = this.getPolyBBox({ coorPt, label, ...polyRest });
                    if (bndBox) {
                        prevFilteredPoly += `],`;
                        prevFilteredPoly += `"area":${((bndBox.x2 - bndBox.x1) * (bndBox.y2 - bndBox.y1)).toString()},`;
                        prevFilteredPoly += `"bbox":[${bndBox.x1.toString()},${bndBox.y1.toString()},${(
                            bndBox.x2 - bndBox.x1
                        ).toString()},${(bndBox.y2 - bndBox.y1).toString()}],`;
                        prevFilteredPoly += `"iscrowd":0,`;
                        prevFilteredPoly += `"id":${count.toString()},`;
                        prevFilteredPoly += `"image_id":${(i + 1).toString()},`;
                        prevFilteredPoly += `"category_id":${labelList?.indexOf(label)}}`;
                    }
                    return prevFilteredPoly;
                }, '');
            }
            return prevMetadata;
        }, '');
        cocoAnnotation += `]`;
        cocoAnnotation += `,`;
        return cocoAnnotation;
    }

    private getPolyCoordinate(coorPt: Coordinate[]) {
        return coorPt.reduce((prevCoorPt, { x, y }, i) => {
            prevCoorPt += `${x.toString()},`;
            prevCoorPt += `${y.toString()}`;
            if (i !== coorPt.length - 1) {
                prevCoorPt += `,`;
            }
            return prevCoorPt;
        }, '');
    }

    private getFilteredPoly(calculatedPolyMetadata: PolyMetadata[]) {
        return calculatedPolyMetadata.map(({ polygons }) => polygons)[0];
    }

    private getPolyBBox({ coorPt }: Polygons) {
        if (coorPt.length > 0) {
            const axis = { x1: 10000000, x2: -100000000, y1: 10000000, y2: -100000000 };
            for (const [_, { x, y }] of coorPt.entries()) {
                if (x < axis.x1) {
                    axis.x1 = x;
                }
                if (x < axis.x2) {
                    axis.x2 = x;
                }
                if (y < axis.y1) {
                    axis.y1 = y;
                }
                if (y < axis.y2) {
                    axis.y2 = y;
                }
            }
            return axis;
        }
        return null;
    }

    private generateCocoLicense() {
        let cocoLicense = `"licenses":[{`;
        cocoLicense += `"id":1,`;
        cocoLicense += `"name":"APACHE LICENSE, VERSION 2.0",`;
        cocoLicense += `"url":"https://www.apache.org/licenses/LICENSE-2.0"`;
        cocoLicense += `}],`;
        return cocoLicense;
    }

    private generateCocoCategory(labelList?: string[]) {
        let cocoCategory = `"categories"\:[`;
        if (labelList) {
            cocoCategory += labelList.reduce((prev, curr, i) => {
                prev += `{"supercategory":"type",`;
                prev += `"id":${(i + 1).toString()},`;
                prev += `"name":"${curr}"`;
                prev += `},`;
                return prev;
            }, '');
        }
        cocoCategory = cocoCategory.slice(0, -1);
        cocoCategory += `]`;
        return cocoCategory;
    }

    private getJsonContent(metadata: PolyMetadata[]) {
        let jsonContent = '{';
        jsonContent += metadata.reduce((prev, { polygons, file_size, img_path }, i) => {
            const filename = this.getFileName(img_path);
            const fileSize = file_size > 0 ? file_size.toString() : '';
            prev += this.generateImageString(polygons, filename, fileSize);
            prev += ',';
            return prev;
        }, '');
        jsonContent = jsonContent.slice(0, -1);
        jsonContent += '}';
        return jsonContent;
    }

    private generateImageString(metadata: Polygons[], imageName: string, fileSize: string) {
        let imageContent = `"${imageName}":{`;
        imageContent += `"fileref":"",`;
        imageContent += `"size":"${fileSize}",`;
        imageContent += `"filename":"${imageName}",`;
        imageContent += `"base64_img_data":"",`;
        imageContent += `"file_attributes":{},`;
        imageContent += `"regions":{${this.generateRegion(metadata)}}`;
        // imageContent += `},`;

        return imageContent;
    }

    private generateRegion(metadata: Polygons[]) {
        if (metadata.length > 0) {
            return metadata.reduce((prev, { coorPt, label, region, subLabel }, i) => {
                let pointX = '[';
                let pointY = '[';
                coorPt.forEach(({ x, y }, polyIndex) => {
                    pointX += x.toString();
                    pointY += y.toString();
                    if (polyIndex === coorPt.length - 1) {
                        pointX += ']';
                        pointY += ']';
                    } else {
                        pointX += ',';
                        pointY += ',';
                    }
                }, '');

                prev += `"${i.toString()}":{`;
                prev += `"shape_attributes":{"name":"polygon",`;
                prev += `"all_points_x":${pointX},`;
                prev += `"all_points_y":${pointY}},`;
                prev += `"region_attributes":{"${label.trim()}":"${region.trim()}"`;
                // prev += `}`;
                if (subLabel.length === 0) {
                    prev += '}}}';
                } else {
                    prev += this.subLabelExist(subLabel);
                }
                // if (i !== metadata.length - 1) {
                //     prev += ',';
                // }
                // prev = prev.slice(0, -1);
                return prev;
            }, '');
        } else {
            return `}`;
        }
    }

    subLabelExist(subLabel: SubLabel[]) {
        let prev = `,`;
        for (const [_, { label, region }] of subLabel.entries()) {
            prev += `"${label.trim()}":"${region.trim()}",`;
        }
        prev = prev.slice(0, -1);
        prev = prev += `}}}`;
        return prev;
    }
}
