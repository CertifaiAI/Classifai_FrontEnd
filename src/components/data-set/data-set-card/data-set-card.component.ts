import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
    FileType,
    Project,
    ProjectSchema,
    StarredProps,
} from './../../../layouts/data-set-layout/data-set-layout.model';

type CardSchema = {
    clickIndex: number;
};

type FileTypeProps = {
    projectName: string;
    fileType: FileType;
};

@Component({
    selector: 'data-set-card',
    templateUrl: './data-set-card.component.html',
    styleUrls: ['./data-set-card.component.scss'],
})
export class DataSetCardComponent implements OnInit, OnChanges {
    @Input() _jsonSchema!: ProjectSchema;
    @Output() _onClick: EventEmitter<string> = new EventEmitter();
    @Output() _onUpload: EventEmitter<FileTypeProps> = new EventEmitter();
    @Output() _onStarred: EventEmitter<StarredProps> = new EventEmitter();
    @Output() _onDelete: EventEmitter<string> = new EventEmitter();

    // clonedJsonSchema!: ProjectSchema;
    starredActiveIcon: string = `../../../assets/icons/starred_active.svg`;
    starredInactiveIcon: string = `../../../assets/icons/starred.svg`;
    cardSchema: CardSchema = {
        clickIndex: -1,
    };
    previousProjectLength = 0;
    constructor() {
        // this.clonedJsonSchema = cloneDeep(this._jsonSchema);
    }

    ngOnInit(): void {}

    conditionalDisableProject = ({ is_loaded }: Project): string | null => (is_loaded ? 'disabled' : 'enabled');

    conditionalDisableClickEvent = (is_loaded: boolean): boolean => is_loaded;

    onOpenProject = (index: number, { project_name, is_loaded }: Project): void => {
        is_loaded ? null : this.isExactIndex(index) ? null : this._onClick.emit(project_name);
        // this.isExactIndex(index) ? null : this._onClick.emit(project_name);
    };

    onUploadContent = (index: number, projectName: string, fileType?: FileType): void => {
        this.cardSchema = { clickIndex: index };
        this._onUpload.emit({ projectName, fileType: fileType ?? 'folder' });
        // this.onDisplayMore(index);
    };

    onDeleteProject(projectName: string) {
        this._onDelete.emit(projectName);
    }

    onDisplayMore = (index: number = this.cardSchema.clickIndex): void => {
        const { clickIndex } = this.cardSchema;
        this.cardSchema = { clickIndex: clickIndex === index ? -1 : index };
        // console.log(this.cardSchema);
    };

    onStarred = (project: Project, starred: boolean): void => {
        const { project_name } = project;
        this._jsonSchema.projects = this._jsonSchema.projects.map((project) =>
            project.project_name === project_name ? ((project.is_starred = starred), project) : project,
        );
        this._onStarred.emit({ projectName: project_name, starred });
    };

    isExactIndex = (index: number): boolean => index === this.cardSchema.clickIndex;

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        const { isUploading }: { isUploading: boolean } = changes._jsonSchema.currentValue;
        isUploading ? null : this.onDisplayMore();
    }

    ngDoCheck() {
        if (this._jsonSchema.projects.length !== this.previousProjectLength) {
            // Close 'display more' popup after create/delete a project
            this.cardSchema.clickIndex = -1;
        }
        this.previousProjectLength = this._jsonSchema.projects.length;
    }
}
