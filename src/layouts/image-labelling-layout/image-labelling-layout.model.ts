import { BoundingBox, Metadata } from '../../shared/type-casting/meta-data/meta-data.model';

type error_code = number;
type errormessage = string;
type content = string[];
type message = boolean | number;
type progress = any;
type label_list = string[];
type uuid_list = number;
type img_src = string;

//#region Reponse Status from API
export interface MessageContent {
    content: content;
    message: message;
    errormessage: errormessage;
}

export type Message = {
    message: message;
};

export type MessageUuidList = {
    message: message;
    uuid_list: uuid_list[];
};

export type MessageBase64Img = {
    message: message;
    img_src: img_src;
    errorcode: error_code;
    errormessage: string;
};

export type MessageProjectProgress = {
    error_code?: error_code;
    error_message?: errormessage;
    message: message;
};

//#endregion

export type LabelList = {
    label_list: label_list;
    message: message;
    progress: progress;
    uuid_list: uuid_list[];
};

type IAxis = {
    x: number;
    y: number;
};

type SubLabel = {
    region: string;
    label: string;
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
    subLabel: SubLabel[];
};

export type ThumbnailMetadata = {
    bnd_box: Boundingbox[];
    file_size: number;
    img_depth: number;
    img_h: number;
    img_ori_h: number;
    img_ori_w: number;
    img_path: string;
    img_thumbnail: string;
    img_w: number;
    img_x: number;
    img_y: number;
    // message: boolean;
    project_name: string;
    uuid: number;
};

/** @type mainly used for passing props with generic type while ability to allow conditional of generic type usage */
export type ImgLabelProps<T = undefined> = {} & (T extends undefined
    ? {
          // theme: string;
          status?: boolean;
          currentThumbnailIndex: number;
          totalNumThumbnail: number;
          thumbnailName: string | undefined;
      }
    : T);

export type TabsProps = {
    name: string;
    closed: boolean;
    label_list?: string[];
    annotation?: ThumbnailMetadata[] | undefined;
};

export type UrlProps = {
    url: string;
};

export type ThumbnailProps = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
} & Partial<UrlProps>;

export type EventEmitter_Url = UrlProps;

export type EventEmitter_Action = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
};

export type SelectedThumbnailProps = {
    uuid: number;
} & Pick<MessageBase64Img, 'img_src'>;

export type ThumbnailMetadataProps = ThumbnailMetadata;

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

export type AddedSubLabel = {
    label: string;
    region: string;
};

export type ChangeAnnotationLabel = {
    label: string;
    index: number;
};

export type BoundingBoxActionState = {
    scroll: boolean;
    drag: boolean;
    draw: boolean;
    fitCenter: boolean;
    clear: boolean;
    // dbClick: boolean;
};

export type Polygons = {
    coorPt: Coordinate[];
    label: string;
    id: number;
    lineWidth: number;
    color: string;
    regionatt: string;
    sublabel: SubLabels[];
};

export type Coordinate = {
    x: number;
    y: number;
    distancetoImg: {
        x: number;
        y: number;
    };
};

export type SubLabels = {
    label: string;
    regionatt: string;
};

export type AnnotateActionState = {
    annotation: number;
    isDlbClick: boolean;
};

export type PolyMeta = {
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
    file_size: number;
    polygons: Polygons[];
};

export type UndoState = { meta: Metadata | PolyMeta | null; method: string } | null;
export type CopyPasteState = BoundingBox | Polygons | null;
