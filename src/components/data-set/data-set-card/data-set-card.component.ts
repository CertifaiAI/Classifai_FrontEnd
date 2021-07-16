/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProjectSchema, StarredProps, ProjectRename, Project } from 'shared/types/dataset-layout/data-set-layout.model';

type CardSchema = {
    clickIndex: number;
};

@Component({
    selector: 'data-set-card',
    templateUrl: './data-set-card.component.html',
    styleUrls: ['./data-set-card.component.scss'],
})
export class DataSetCardComponent implements OnChanges {
    @Input() _jsonSchema!: ProjectSchema;
    @Output() _onClick: EventEmitter<string> = new EventEmitter();
    @Output() _onStarred: EventEmitter<StarredProps> = new EventEmitter();
    @Output() _onDelete: EventEmitter<string> = new EventEmitter();
    @Output() _onRename: EventEmitter<ProjectRename> = new EventEmitter();

    // clonedJsonSchema!: ProjectSchema;
    starredActiveIcon: string = `assets/icons/starred_active.svg`;
    starredInactiveIcon: string = `assets/icons/starred.svg`;
    cardSchema: CardSchema = {
        clickIndex: -1,
    };
    previousProjectLength = 0;
    constructor(private _cd: ChangeDetectorRef) {}

    conditionalDisableProject = ({ is_loaded }: Project): string | null => (is_loaded ? 'disabled' : 'enabled');

    conditionalDisableClickEvent = (is_loaded: boolean): boolean => is_loaded;

    onOpenProject = (index: number, { project_name, is_loaded }: Project): void => {
        !this.isExactIndex(index) && this._onClick.emit(project_name);
    };

    onRenameProject(projectName: string) {
        this._onRename.emit({ shown: true, projectName });
        this.onCloseDisplay();
    }

    onDeleteProject(projectName: string) {
        this._onDelete.emit(projectName);
        this.onCloseDisplay();
    }

    onDisplayMore = (index: number = this.cardSchema.clickIndex): void => {
        const { clickIndex } = this.cardSchema;
        this.cardSchema = { clickIndex: clickIndex === index ? -1 : index };
    };

    onCloseDisplay = (): void => {
        this.cardSchema.clickIndex = -1;
    };

    onStarred = (project: Project, starred: boolean): void => {
        const { project_name } = project;
        this._jsonSchema.projects = this._jsonSchema.projects.map((proj) =>
            proj.project_name === project_name ? ((proj.is_starred = starred), proj) : proj,
        );
        this._onStarred.emit({ projectName: project_name, starred });
    };

    isExactIndex = (index: number): boolean => index === this.cardSchema.clickIndex;

    onDblClickStopPropagate = (event: MouseEvent) => event.stopPropagation();

    ngOnChanges(changes: SimpleChanges): void {
        const { isUploading }: { isUploading: boolean } = changes._jsonSchema.currentValue;
        !isUploading && this.onDisplayMore();

        if (this._jsonSchema.projects.length !== this.previousProjectLength) {
            // Close 'display more' popup after create/delete a project
            this.cardSchema.clickIndex = -1;
        }
        this.previousProjectLength = this._jsonSchema.projects.length;
    }
}
