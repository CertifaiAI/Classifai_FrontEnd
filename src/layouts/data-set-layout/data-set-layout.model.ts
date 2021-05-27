import { uuid } from 'src/shared/types/message/message.model';

type message = boolean | number;
type progress = any;
type label_list = string[];

export type LabelList = {
    label_list: label_list;
    message: message;
    progress: progress;
    uuid_list: uuid[];
};

export type Labels = {
    label_list: label_list;
    message: message;
    label_file_path: string;
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
    isFetching: boolean;
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

export type FileType = 'file' | 'folder';

export type UploadThumbnailProps = {
    projectName: string;
    fileType: FileType;
};

export type StarredProps = {
    projectName: string;
    starred: boolean;
};

export type ProjectRename = {
    shown: boolean;
    projectName: string;
};
