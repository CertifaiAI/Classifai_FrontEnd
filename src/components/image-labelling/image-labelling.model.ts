export type ImgLabelProps = {
    status?: boolean;
    currentThumbnailIndex: number;
    totalNumThumbnail: number;
    thumbnailName: string | undefined;
};

export type ImageProps = Omit<BboxMetadata, 'bnd_box'> & {
    img_src: string;
};

export type UrlProps = {
    url: string;
};

export type ThumbnailInfoProps = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
} & Partial<UrlProps>;

export type EventEmitter_Url = UrlProps;

export type ActionState = {
    scroll: boolean;
    drag: boolean;
    draw: boolean;
    fitCenter: boolean;
    clear: boolean;
    isActiveModal: boolean;
    // dbClick: boolean;
};

export type ImageLabellingMode = 'bndbox' | 'seg' | null;

export type TabsProps<TMetadata = undefined> = {
    name: string;
    closed: boolean;
    label_list?: string[];
    annotation?: TMetadata extends undefined ? BboxMetadata[] & PolyMetadata[] : TMetadata[];
};

type TabAction = {
    /** @property {number} 1 represents add, whereas 0 represent remove */
    action: 1 | 0;
};

export type ActionTabProps = {
    tabType: string;
} & TabAction;

export type SelectedLabelProps = {
    selectedLabel: string;
    label_list: string[];
} & TabAction;

export type ChangeAnnotationLabel = {
    label: string;
    index: number;
};

export type AddSubLabel = {
    label: string;
    region: string;
};

export type EventEmitter_Action = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
};

type IAxis = {
    x: number;
    y: number;
};

type SubLabel = {
    region: string;
    label: string;
};

export type Coordinate = {
    x: number;
    y: number;
    distancetoImg: {
        x: number;
        y: number;
    };
};

export type Boundingbox = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth: number;
    color: string;
    distancetoImg: IAxis;
    label: string;
    id: number;
    subLabel?: SubLabel[];
    region?: string;
};

export type Polygons = {
    coorPt: Coordinate[];
    label: string;
    id: number;
    lineWidth: number;
    color: string;
    region: string;
    subLabel: SubLabel[];
};

type Metadata = {
    img_h: number;
    img_ori_h: number;
    img_ori_w: number;
    img_path: string;
    img_thumbnail: string;
    img_w: number;
    img_x: number;
    img_y: number;
    project_name: string;
    uuid: number;
    file_size: number;
};

export type BboxMetadata = Metadata & {
    bnd_box: Boundingbox[];
    img_depth: number;
};

export type PolyMetadata = Metadata & {
    polygons: Polygons[];
    img_path: string;
};

type Method = 'zoom' | 'draw' | 'pan';

export type Direction = 'up' | 'down' | 'left' | 'right';

// export type ThumbnailMetadataProps = BboxMetadata;
export type UndoState = { meta: BboxMetadata | PolyMetadata | null; method: Method } | null;

export type Globalloc = { scale: number; offset: { x: number; y: number } };
export type Panloc = {
    start: { x: number; y: number };
    offset: { x: number; y: number };
};
export type ProgressTuple = { url: string; data: Metadata };
export type Stages = { stage: Metadata; method: string };
export type xyCoordinate = { x: number; y: number };