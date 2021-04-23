import * as fileSaver from 'file-saver';
import * as jszip from 'jszip';
import { Injectable } from '@angular/core';
import { WithOptional } from '../types/with-optional/with-optional';
import {
    BboxMetadata,
    CompleteMetadata,
    PolyMetadata,
    Polygons,
} from 'src/components/image-labelling/image-labelling.model';

export type SaveFormat = 'pascalVoc' | 'yolo' | 'ocr' | 'label' | 'coco' | 'json';

export type ExportSaveType = {
    saveCurrentImage: boolean;
    saveBulk: boolean;
};
type ExportSaveConfig = {
    projectName: string;
    saveFormat: SaveFormat;
    metadata?: CompleteMetadata;
    projectFullMetadata?: CompleteMetadata[];
    index: number;
    labelList?: string[];
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
    exportSaveFormat({
        saveCurrentImage,
        saveFormat,
        metadata,
        index,
        projectName,
        labelList,
        projectFullMetadata,
    }: ExportSaveType & ExportSaveConfig) {
        switch (saveFormat) {
            case 'pascalVoc':
                if (!metadata) {
                    return alert('There are no metadata.');
                }
                if (!metadata?.bnd_box) {
                    return alert('There are no bounding box.');
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
                    const content = this.generatePascalVocFormat(pascalVocData);
                    const splitfilenameArr = filename.split('.');
                    const finalizedFilename = splitfilenameArr[0] + '.xml';
                    this.saveFile({ content, filename: finalizedFilename, type: 'text/xml;charset=utf-8' });
                } else {
                    if (!projectFullMetadata) {
                        return alert('There are no image list.');
                    }
                    const pascalVocList: { filename: string; content: string }[] = [];
                    projectFullMetadata.forEach((metadata) => {
                        // if (metadata.bnd_box && metadata.bnd_box.length > 0) {
                        const calculatedBoxMetadata = this.calBoxCoorOriginalImages(metadata as BboxMetadata);
                        const filename = this.getFileName(metadata.img_path);
                        const extensionName = this.getFileExtensionName(filename);
                        const { img_path, img_depth, img_ori_w, img_ori_h } = metadata;
                        const pascalVocData = {
                            img_path,
                            img_depth,
                            img_ori_w,
                            img_ori_h,
                            bnd_box: calculatedBoxMetadata,
                        };
                        const content = this.generatePascalVocFormat(pascalVocData);
                        const splitfilenameArr = filename.split('.');
                        const finalizedFilename = `${splitfilenameArr[0]}_${extensionName}.xml`;
                        pascalVocList.push({
                            filename: finalizedFilename,
                            content,
                        });
                        // }
                    });
                    if (!pascalVocList) {
                        return alert('There are no labelling progress.');
                    }
                    this.saveAsZip(pascalVocList, saveFormat, projectName);
                }
                break;
            case 'yolo':
                if (!metadata) {
                    return alert('There are no metadata.');
                }
                if (!metadata?.bnd_box) {
                    return alert('There are no bounding box.');
                }

                if (!labelList) {
                    return alert('There are no label list.');
                }

                if (saveCurrentImage) {
                    const calculatedBoxMetadata = this.calBoxCoorOriginalImages(metadata as BboxMetadata);
                    const filename = this.getFileName(metadata.img_path);
                    const extensionName = this.getFileExtensionName(filename);
                    const { img_ori_w, img_ori_h } = metadata;
                    const yoloData = {
                        img_ori_w,
                        img_ori_h,
                        bnd_box: calculatedBoxMetadata,
                    };
                    const content = this.generateYoloFormat({ ...yoloData }, labelList);
                    const splitfilenameArr = filename.split('.');
                    const finalizedFilename = `${splitfilenameArr[0]}_${extensionName}.txt`;
                    this.saveFile({ content, filename: finalizedFilename, type: 'text/plain;charset=utf-8' });
                } else {
                    if (!projectFullMetadata) {
                        return alert('There are no image list.');
                    }

                    const yoloList: { filename: string; content: string }[] = [];
                    projectFullMetadata.forEach((metadata) => {
                        // if (metadata.bnd_box && metadata.bnd_box.length > 0) {
                        const calculatedBoxMetadata = this.calBoxCoorOriginalImages(metadata as BboxMetadata);
                        const filename = this.getFileName(metadata.img_path);
                        const extensionName = this.getFileExtensionName(filename);
                        const { img_ori_w, img_ori_h } = metadata;
                        const yoloData = {
                            img_ori_w,
                            img_ori_h,
                            bnd_box: calculatedBoxMetadata,
                        };
                        const content = this.generateYoloFormat({ ...yoloData }, labelList);
                        const splitfilenameArr = filename.split('.');
                        const finalizedFilename = `${splitfilenameArr[0]}_${extensionName}.txt`;
                        yoloList.push({
                            filename: finalizedFilename,
                            content,
                        });
                        // }
                    });
                    if (!yoloList) {
                        return alert('There are no labelling progress.');
                    }
                    this.saveAsZip(yoloList, saveFormat, projectName);
                }
                break;
            case 'ocr':
                if (!metadata) {
                    return alert('There are no metadata.');
                }
                if (!metadata?.bnd_box) {
                    return alert('There are no bounding box.');
                }
                if (!projectFullMetadata) {
                    return alert('There are no image list.');
                }

                let ocrText = '';
                projectFullMetadata.forEach((metadata, i) => {
                    if (i === 0) {
                        ocrText += 'filename,x1,y1,x2,y2,label\n';
                    }
                    const calculatedBoxMetadata = this.calBoxCoorOriginalImages(metadata as BboxMetadata);
                    const filename = this.getFileName(metadata.img_path);
                    const content = this.generateOCRFormat({ bnd_box: calculatedBoxMetadata }, filename);
                    ocrText += `${content}`;
                });
                if (!ocrText) {
                    return alert('There are no labelling progress.');
                }
                this.saveFile({
                    content: ocrText,
                    filename: `${projectName}_Textocr_labels.csv`,
                    type: 'text/csv;charset=utf-8',
                });
                break;
            case 'label':
                if (!labelList) {
                    return alert('There are no label list.');
                }
                const filename = `${projectName}_label.txt`;
                const content = this.generateLabelFormat(labelList);
                this.saveFile({ content, filename, type: 'text/plain;charset=utf-8' });
                break;
            case 'coco':
                if (!projectFullMetadata) {
                    return alert('There are no image list.');
                }

                const verticesPolyMetadata = this.calPolyCoorOriginalImages(projectFullMetadata as PolyMetadata[]);
                const verticesContent = this.getCocoContent(verticesPolyMetadata, labelList);
                const verticesFilename = this.getCocoFileName(projectName);
                this.saveFile({
                    content: verticesContent,
                    filename: verticesFilename,
                    type: 'text/json;charset=utf-8',
                });
                break;
            case 'json':
                if (!metadata) {
                    return alert('There are no metadata.');
                }
                if (!metadata?.polygons) {
                    return alert('There are no polygon.');
                }
                if (!projectFullMetadata) {
                    return alert('There are no image list.');
                }
                const jsonPolyMetadata = this.calPolyCoorOriginalImages(projectFullMetadata as PolyMetadata[]);
                const jsonContent = this.getJsonContent(jsonPolyMetadata);
                const jsonFilename = this.getJsonFileName(projectName);
                this.saveFile({
                    content: jsonContent,
                    filename: jsonFilename,
                    type: 'text/json;charset=utf-8',
                });
                break;
        }
    }

    private calBoxCoorOriginalImages({ bnd_box, img_w, img_h, img_ori_w, img_ori_h }: BboxMetadata) {
        const xScaledFactor = img_ori_w / img_w;
        const yScaledFactor = img_ori_h / img_h;
        const boxes = bnd_box.map((box) => {
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
        return boxes;
    }

    private calPolyCoorOriginalImages(metadata: PolyMetadata[]): PolyMetadata[] {
        const calculatedMetadata = metadata.map(({ img_ori_w, img_ori_h, img_w, img_h, polygons, ...metaprops }) => {
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
        return calculatedMetadata;
    }

    // private calPolyCoorOriginalImages({ img_ori_w, img_ori_h, img_w, img_h, polygons }: PolyMetadata){
    //     const xScaledFactor = img_ori_w / img_w;
    //     const yScaledFactor = img_ori_h / img_h;
    //     const polygonList = polygons.filter(({ coorPt }) =>
    //         coorPt.map(({ distancetoImg }) => {
    //             const tempX = distancetoImg.x * xScaledFactor;
    //             const tempY = distancetoImg.y * yScaledFactor;
    //             return {
    //                 distancetoImg,
    //                 x: tempX,
    //                 y: tempY,
    //             };
    //         }),
    //     );
    //     return polygonList;
    // }

    private generatePascalVocFormat({
        bnd_box,
        img_path,
        img_depth,
        img_ori_w,
        img_ori_h,
    }: WithOptional<
        Pick<BboxMetadata, 'bnd_box' | 'img_path' | 'img_depth' | 'img_ori_w' | 'img_ori_h'>,
        'img_depth'
    >) {
        let pVocStart = '<annotation>\n';
        const filename = this.getItemName('file', img_path);
        const foldername = this.getItemName('folder', img_path);
        const databaseitem = 'unknown';
        const foldernode = this.createNode('folder');
        pVocStart += '\t' + foldernode[0] + foldername + foldernode[1];
        const filenamenode = this.createNode('filename');
        pVocStart += '\t' + filenamenode[0] + filename + filenamenode[1];
        const pathnode = this.createNode('path');
        pVocStart += '\t' + pathnode[0] + img_path.split('\\').join('/') + pathnode[1];
        const sourcenode = this.createNode('source');
        const databasechildnode = this.createNode('database');
        pVocStart += '\t' + sourcenode[0] + '\n';
        pVocStart += '\t\t' + databasechildnode[0] + databaseitem + databasechildnode[1];
        pVocStart += '\t' + sourcenode[1];
        const sizenode = this.createNode('size');
        pVocStart += '\t' + sizenode[0] + '\n';
        const widthchildnode = this.createNode('width');
        const heightchildnode = this.createNode('height');
        const depthchildnode = this.createNode('depth');
        pVocStart += '\t\t' + widthchildnode[0] + img_ori_w.toString() + widthchildnode[1];
        pVocStart += '\t\t' + heightchildnode[0] + img_ori_h.toString() + heightchildnode[1];
        pVocStart += '\t\t' + depthchildnode[0] + img_depth?.toString() + depthchildnode[1];
        pVocStart += '\t' + sizenode[1];
        const segmentednode = this.createNode('segmented');
        pVocStart += '\t' + segmentednode[0] + '0' + segmentednode[1];
        const objectnode = this.createNode('object');

        for (const [_, { label, x1, x2, y1, y2 }] of bnd_box.entries()) {
            pVocStart += '\t' + objectnode[0] + '\n';
            const namechildnode = this.createNode('name');
            const posechildnode = this.createNode('pose');
            const truncatedchildnode = this.createNode('truncated');
            const difficultchildnode = this.createNode('difficult');
            const bndboxchildnode = this.createNode('bndbox');
            const xminsubchildnode = this.createNode('xmin');
            const yminsubchildnode = this.createNode('ymin');
            const xmaxsubchildnode = this.createNode('xmax');
            const ymaxsubchildnode = this.createNode('ymax');
            pVocStart += '\t\t' + namechildnode[0] + label + namechildnode[1];
            pVocStart += '\t\t' + posechildnode[0] + 'Unspecified' + posechildnode[1];
            pVocStart += '\t\t' + truncatedchildnode[0] + '0' + truncatedchildnode[1];
            pVocStart += '\t\t' + difficultchildnode[0] + '0' + difficultchildnode[1];
            pVocStart += '\t\t' + bndboxchildnode[0] + '\n';
            pVocStart += '\t\t\t' + xminsubchildnode[0] + Math.floor(x1).toString() + xminsubchildnode[1];
            pVocStart += '\t\t\t' + yminsubchildnode[0] + Math.floor(y1).toString() + yminsubchildnode[1];
            pVocStart += '\t\t\t' + xmaxsubchildnode[0] + Math.floor(x2).toString() + xmaxsubchildnode[1];
            pVocStart += '\t\t\t' + ymaxsubchildnode[0] + Math.floor(y2).toString() + ymaxsubchildnode[1];
            pVocStart += '\t\t' + bndboxchildnode[1];
            pVocStart += '\t' + objectnode[1];
        }
        pVocStart += '</annotation>';

        return pVocStart;
    }

    private generateYoloFormat(
        { bnd_box, img_ori_w, img_ori_h }: Pick<BboxMetadata, 'img_ori_w' | 'img_ori_h' | 'bnd_box'>,
        labelList: string[],
    ) {
        const yoloContent = bnd_box.reduce((prev, { x1, x2, y1, y2, label }, i) => {
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

        return yoloContent;
    }

    private generateOCRFormat({ bnd_box }: Pick<BboxMetadata, 'bnd_box'>, filename: string) {
        const textOCRContent = bnd_box.reduce((prev, { x1, x2, y1, y2, label }) => {
            prev += `${filename},${x1.toString()},${y1.toString()}`;
            prev += `,${x2.toString()},${y2.toString()},${label.toString()}\n`;
            return prev;
        }, '');
        return textOCRContent;
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
        const content = labels.reduce((prev, curr, i) => {
            prev += curr;
            if (i !== prev.length) {
                return (prev += '\n');
            }
            return prev;
        }, '');
        return content;
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
        const filename = splitName[splitName.length - 1];

        return filename;
    }

    private getCocoFileName(projectName: string) {
        return `${projectName}_segmentation_coco.json`;
    }

    private getJsonFileName(projectName: string) {
        return `${projectName}_segmentation_JSON.json`;
    }

    private getFileExtensionName(filename: string) {
        return filename.split('.').pop();
    }

    private getCocoContent(metadata: PolyMetadata[], labelList?: string[]) {
        let cocostr: string = '{';
        cocostr += this.generateCocoInfo();
        cocostr += this.generateCocoImage(metadata);
        cocostr += this.generateCocoAnnotation(metadata, labelList);
        cocostr += this.generateCocoLicense();
        cocostr += this.generateCocoCategory(labelList);
        cocostr += '}';
        cocostr = cocostr.replace(/(}{)/gi, '},{');
        return cocostr;
    }

    private generateCocoInfo() {
        const d = new Date();
        let cocoInfo: string = `"info":{`;
        cocoInfo += `year:"${d.getFullYear().toString()}",`;
        cocoInfo += `version:"1.0",`;
        cocoInfo += `description\:\"VIA project exported to COCO format using classifai(https://classifai.ai/)",`;
        cocoInfo += `contributor:"",`;
        cocoInfo += `url:"https://classifai.ai/",`;
        cocoInfo += `date_created:"${d.toUTCString()}"`;
        cocoInfo += '},';
        return cocoInfo;
    }

    private generateCocoImage(metadata: PolyMetadata[]) {
        let cocoImage = 'images:[';
        cocoImage += metadata.reduce((prev, { img_ori_w, img_ori_h, img_path }, i) => {
            prev += `{id:${(i + 1).toString()},`;
            prev += `width:${img_ori_w.toString()},`;
            prev += `height:${img_ori_h.toString()},`;
            prev += `file_name:"${this.getFileName(img_path)}",`;
            prev += `license:0,`;
            prev += `date_captured:""}`;
            if (i !== metadata.length) {
                prev += ',';
            }
            return prev;
        }, '');
        cocoImage += `],`;
        return cocoImage;
    }

    private generateCocoAnnotation(metadata: PolyMetadata[], labelList?: string[]) {
        let cocoAnnotation = `annotations:[`;
        let count = 0;
        cocoAnnotation += metadata.reduce((prevMetadata, { polygons }, i) => {
            if (polygons.length > 0) {
                count += 1;
                const calculatedPolyMetadata = this.calPolyCoorOriginalImages(metadata);
                const filteredPoly = calculatedPolyMetadata.map(({ polygons }) => polygons)[0];
                prevMetadata += filteredPoly.reduce((prevFilteredPoly, { coorPt, label, ...polyRest }, j) => {
                    prevFilteredPoly += `{segmentation:[`;
                    if (coorPt.length > 0) {
                        prevFilteredPoly += `[`;
                        prevFilteredPoly += coorPt.reduce((prevCoorPt, { x, y }, i) => {
                            prevCoorPt += `${x.toString()},`;
                            prevCoorPt += `${y.toString()}`;
                            if (i !== coorPt.length - 1) {
                                prevCoorPt += `,`;
                            }
                            return prevCoorPt;
                        }, '');
                        prevFilteredPoly += ']';
                    }
                    const bndBox = this.getPolyBBox({ coorPt, label, ...polyRest });
                    if (bndBox) {
                        prevFilteredPoly += `],`;
                        prevFilteredPoly += `area:${((bndBox.x2 - bndBox.x1) * (bndBox.y2 - bndBox.y1)).toString()},`;
                        prevFilteredPoly += `bbox:[${bndBox.x1.toString()},${bndBox.y1.toString()},${(
                            bndBox.x2 - bndBox.x1
                        ).toString()},${(bndBox.y2 - bndBox.y1).toString()}],`;
                        prevFilteredPoly += `iscrowd:0,`;
                        prevFilteredPoly += `id:${count.toString()},`;
                        prevFilteredPoly += `image_id:${(i + 1).toString()},`;
                        prevFilteredPoly += `category_id:${labelList?.indexOf(label)}}`;
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
        let cocoLicense = `licenses:[{`;
        cocoLicense += `id:1,`;
        cocoLicense += `name:"APACHE LICENSE, VERSION 2.0",`;
        cocoLicense += `url:"https://www.apache.org/licenses/LICENSE-2.0",`;
        cocoLicense += `}],`;
        return cocoLicense;
    }

    private generateCocoCategory(labelList?: string[]) {
        let cocoCategory = `categories\:[`;
        if (labelList) {
            cocoCategory += labelList.reduce((prev, curr, i) => {
                if (i === 0) {
                }
                prev += `{supercategory:"type",`;
                prev += `id:${i.toString()},`;
                prev += `name:"${curr}"`;
                prev += `},`;
                return prev;
            }, '');
        }
        cocoCategory += `]`;
        return cocoCategory;
    }

    private getJsonContent(metadata: PolyMetadata[]) {
        let jsonContent = '{';
        jsonContent += metadata.reduce((prev, { polygons, file_size, img_path }, i) => {
            const filename = this.getFileName(img_path);
            const fileSize = file_size > 0 ? file_size.toString() : '';
            prev += this.generateImageString(polygons, filename, fileSize);
            // if (i !== polygons.length - 1) {
            //     prev += ',';
            // }
            prev += '},';
            return prev;
        }, '');
        jsonContent += '}';
        return jsonContent;
    }

    private generateImageString(metadata: Polygons[], imageName: string, fileSize: string) {
        let imageContent = `'${imageName}':{`;
        imageContent += `fileref:"",`;
        imageContent += `size:"${fileSize}",`;
        imageContent += `filename:"${imageName}",`;
        imageContent += `base64_img_data:"",`;
        imageContent += `file_attributes:{},`;
        imageContent += `regions:{${this.generateRegion(metadata)}}`;
        // imageContent += `},`;

        return imageContent;
    }

    private generateRegion(metadata: Polygons[]) {
        if (metadata.length > 0) {
            const regionContent = metadata.reduce((prev, { coorPt, label, region, subLabel }, i) => {
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

                prev += `${i.toString()}:{`;
                prev += `shape_attributes:{name:polygon,`;
                prev += `all_points_x:${pointX},`;
                prev += `all_points_y:${pointY}},`;
                prev += `region_attributes:{${label.trim()}:"${region.trim()}"}`;
                prev += `}`;
                if (subLabel.length === 0) {
                    // prev += '}';
                } else {
                    prev += ',';
                    for (const [_, { label, region }] of subLabel.entries()) {
                        prev += `"${label.trim()}":"${region.trim()}"`;
                        prev += '},';
                    }
                }
                if (i !== metadata.length - 1) {
                    prev += ',';
                }
                return prev;
            }, '');

            return regionContent;
        }
    }
}
