import { FileType } from 'src/shared/type-casting/file-type/file-type.model';

type errormessage = string;
type content = Project[];
type message = boolean | number;
type progress = any;
type label_list = string[];
type uuid_list = number;
type img_src = string;
type error_code = number;

export type MessageContent = {
    content: content;
    message: message;
    errormessage: errormessage;
};

export type Message = {
    message: message;
    error_code: error_code;
    error_message: errormessage;
};

export type MessageUuidList = {
    message: message;
    uuid_list: uuid_list[];
};

export type MessageBase64Img = {
    message: message;
    img_src: img_src;

    errorcode: number;
    errormessage: string;
};

export type LabelList = {
    label_list: label_list;
    message: message;
    progress: progress;
    uuid_list: uuid_list[];
};

export type ThumbnailMetadata = {
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
};

export type ProjectStatus = {
    status: string;
    backgroundColour: number;
    title: string;
    createdDate: string;
};

export type Project = {
    project_name: string;
    is_loaded: boolean;
    is_starred: boolean;
    is_new: boolean;
    total_uuid: number;
    created_date: string;
};

export type ProjectSchema = {
    projects: Project[];
    isUploading: boolean;
};

/** @type mainly used for passing props with generic type while ability to allow conditional of generic type usage */
export type DataSetProps<T = undefined> = {} & (T extends undefined
    ? {
          // theme: string;
          status?: boolean;
          currentThumbnailIndex: number;
          totalNumThumbnail: number;
          thumbnailName: string | undefined;
      }
    : T);

export type UploadThumbnailProps = {
    projectName: string;
    fileType: FileType;
};

export type StarredProps = {
    projectName: string;
    starred: boolean;
};

export type MessageDataSetStatus = {
    error_code: error_code;
    message: message;
    error_message: errormessage;
};
