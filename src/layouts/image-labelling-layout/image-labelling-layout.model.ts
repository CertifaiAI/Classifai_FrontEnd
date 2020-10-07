type errormessage = string;
type content = string[];
type message = boolean | number;
type progress = any;
type label_list = string[];
type uuid_list = number;
type img_src = string;

export interface IContent {
    content: content;
    message: message;
    errormessage: errormessage;
}

export interface IMessage {
    message: message;
}

export interface IMessageUuidList {
    message: message;
    uuid_list: uuid_list[];
}

export interface IBase64Img {
    message: message;
    img_src: img_src;

    errorcode: number;
    errormessage: string;
}

export interface ILabelList {
    label_list: label_list;
    message: message;
    progress: progress;
    uuid_list: uuid_list[];
}

interface IAxis {
    x: number;
    y: number;
}

export interface IBoundingbox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth: number;
    color: string;
    distancetoImg: IAxis;
    label: string;
    id: number;
}

export interface IThumbnailMetadata {
    bnd_box: IBoundingbox[];
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
    message: boolean;
    project_name: string;
    uuid: number;
}

// export interface ILoading {
//   submitLoading: boolean;
//   createLoading: boolean;
// }

/** @interface icons' object mapping */
type imageLabellingConfigs = {
    imgPath: string;
    hoverLabel: string;
    alt: string;
    // inputType?: string;
    // accept?: 'image/x-png,image/jpeg';
    /** @function responsible for toggling function */
    onClick?: any;
    // onClick?: (...args: any[]) => any;
    /** @function responsible for uploading thumbnail(s) */
    // onUpload?();
};

/** @interface backbone of icons' object schema */
export interface IimageLabellingSchema {
    [key: string]: Array<imageLabellingConfigs>;
}

/** @type mainly used for passing props with generic type while ability to allow conditional of generic type usage */
export type Props<T = undefined> = {} & (T extends undefined
    ? { theme: string; status?: boolean; totalNumThumbnail: number }
    : T);

// export type TabsProps = {
//   [tab: string]: {
//     name: string;
//     closed: boolean;
//   };
// };

export type TabsProps = {
    name: string;
    closed: boolean;
    label_list?: string[];
};

// export type TabsProps = {
//   [key: string]: {
//       name: string;
//       closed: boolean;
//       label_list?: string[];
//   };
// };

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
} & Pick<IBase64Img, 'img_src'>;

export type ThumbnailMetadataProps = IThumbnailMetadata;

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

export type ActionRules = {
    scroll: boolean;
    drag: boolean;
    draw: boolean;
    selectedBox: number;
};
