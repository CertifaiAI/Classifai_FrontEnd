import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FileType } from 'src/shared/type-casting/file-type/file-type.model';
import { Project, projectSchema, StarredProps } from './../data-set-layout.model';

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
    @Input() _jsonSchema!: projectSchema;
    @Output() _onClick: EventEmitter<string> = new EventEmitter();
    @Output() _onUpload: EventEmitter<FileTypeProps> = new EventEmitter();
    @Output() _onStarred: EventEmitter<StarredProps> = new EventEmitter();
    // clonedJsonSchema!: projectSchema;
    starredActiveIcon: string = `../../../assets/icons/starred_active.svg`;
    starredInactiveIcon: string = `../../../assets/icons/starred.svg`;
    cardSchema: CardSchema = {
        clickIndex: -1,
    };
    constructor() {
        // this.clonedJsonSchema = cloneDeep(this._jsonSchema);
    }

    ngOnInit(): void {}

    conditionalDisableProject = ({ is_loaded }: Project): string | null => (is_loaded ? 'disabled' : null);

    onOpenProject = (index: number, { project_name, is_loaded }: Project): void => {
        is_loaded ? null : this.isExactIndex(index) ? null : this._onClick.emit(project_name);
        // this.isExactIndex(index) ? null : this._onClick.emit(project_name);
    };

    onUploadContent = (index: number, projectName: string, fileType?: FileType): void => {
        this.cardSchema = { clickIndex: index };
        this._onUpload.emit({ projectName, fileType: fileType ? fileType : 'folder' });
        // this.onDisplayMore(index);
    };

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
}
