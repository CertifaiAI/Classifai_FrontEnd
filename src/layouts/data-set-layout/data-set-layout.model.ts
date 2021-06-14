/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { uuid } from 'src/shared/types/message/message.model';

type message = boolean | number;
type progress = any;
type label_list = string[];
type window_status = boolean | number;
type path = string;

export type LabelList = {
    label_list: label_list;
    message: message;
    progress: progress;
    uuid_list: uuid[];
};

export type Folder = {
    message: message;
    window_status: window_status;
    window_message: string;
    project_path: path;
};

export type Labels = {
    message: message;
    window_status: window_status;
    window_message: string;
    label_file_path: path;
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
