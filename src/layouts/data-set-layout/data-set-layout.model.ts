import { FileType } from 'src/shared/type-casting/file-type/file-type.model';

type errormessage = string;
type content = Project[];
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
}

export interface IProjectStatus {
    status: string;
    backgroundColour: number;
    title: string;
    createdDate: string;
}

// export type projectSchema = {
//     fields: Array<IProjectStatus>;
// };

export type Project = {
    project_name: string;
    is_loaded: boolean;
    starred: boolean;
    created_date: string;
};

export type projectSchema = {
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
