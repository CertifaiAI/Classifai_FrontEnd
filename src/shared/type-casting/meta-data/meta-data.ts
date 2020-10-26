export type BoundingBox = {
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
    img_path: string;
    project_name: string;
    uuid: number;
    img_x: number;
    img_y: number;
    img_w: number;
    img_h: number;
    img_ori_w: number;
    img_ori_h: number;
    img_thumbnail: string;
    img_depth: number;
    bnd_box: BoundingBox[];
};
export type Globalloc = { scale: number; offset: { x: number; y: number } };
export type Panloc = {
    start: { x: number; y: number };
    offset: { x: number; y: number };
};
export type ProgressTuple = { url: string; data: Metadata };
export type Stages = { stage: Metadata; method: string };
export type xyCoordinate = { x: number; y: number };
