// import { cloneDeep } from 'lodash-es';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FileType } from 'src/shared/type-casting/file-type/file-type.model';
import { Project, projectSchema } from './../data-set-layout.model';

type CardSchema = {
    clickIndex: number;
};

type Props = {
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
    @Output() _onUpload: EventEmitter<Props> = new EventEmitter();
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

    onOpenProject = (index: number, { project_name }: Project): void => {
        this.isExactIndex(index) ? null : this._onClick.emit(project_name);
    };

    onUploadContent = (index: number, projectName: string, fileType?: FileType): void => {
        this.cardSchema = { clickIndex: index };
        this._onUpload.emit({ projectName, fileType: fileType ? fileType : 'folder' });
    };

    onDisplayMore = (index: number): void => {
        const { clickIndex } = this.cardSchema;
        this.cardSchema = { clickIndex: clickIndex === index ? -1 : index };
        // console.log(this.cardSchema);
    };

    onStarred = (project: Project, active: boolean): void => {
        const { project_name } = project;
        this._jsonSchema.projects = this._jsonSchema.projects.map((project) =>
            project.project_name === project_name ? ((project.starred = active), project) : project,
        );
    };

    isExactIndex = (index: number): boolean => index === this.cardSchema.clickIndex;

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
    }
}
