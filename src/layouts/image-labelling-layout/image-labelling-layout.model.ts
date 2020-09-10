type errormessage = string;
type content = string[];
type message = boolean | number;
type progress = any;
type labellist = string[];
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
  labellist: labellist;
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
  img_path: string;
  project_name: string;
  uuid: number;
  img_x: number;
  img_y: number;
  img_w: number;
  img_h: number;
  img_oriW: number;
  img_oriH: number;
  img_thumbnail: string;
  img_depth: number;
  bnd_box: IBoundingbox[];
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
  onClick?();
  /** @function responsible for uploading thumbnail(s) */
  // onUpload?();
};

/** @interface backbone of icons' object schema */
export interface IimageLabellingSchema {
  [key: string]: Array<imageLabellingConfigs>;
}

/** @type mainly used for passing props with generic type while ability to allow conditional of generic type usage */
export type Props<T = undefined> = {} & (T extends undefined
  ? { theme: string; status?: boolean }
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
};
