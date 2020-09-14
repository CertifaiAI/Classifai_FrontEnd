export type Boundingbox = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth: number;
    color: string;
    distancetoImg: { x: number; y: number };
    label: string;
    id: number;
};
export type Metadata = {
    imgpath: string;
    projectname: string;
    uuid: number;
    imgX: number;
    imgY: number;
    imgW: number;
    imgH: number;
    imgOriW: number;
    imgOriH: number;
    imgthumbnail: string;
    imgDepth: number;
    bndbox: Boundingbox[];
};
export type Globalloc = { scale: number; offset: { x: number; y: number } };
export type Panloc = {
    start: { x: number; y: number };
    offset: { x: number; y: number };
};
export type progressTuple = { url: string; data: Metadata };
export type stages = { stage: Metadata; method: string };
