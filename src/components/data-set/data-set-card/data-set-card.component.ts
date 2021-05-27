/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    Project,
    ProjectRename,
    ProjectSchema,
    StarredProps,
} from './../../../layouts/data-set-layout/data-set-layout.model';

type CardSchema = {
    clickIndex: number;
};

@Component({
    selector: 'data-set-card',
    templateUrl: './data-set-card.component.html',
    styleUrls: ['./data-set-card.component.scss'],
})
export class DataSetCardComponent implements OnInit, OnChanges {
    @Input() _jsonSchema!: ProjectSchema;
    @Output() _onClick: EventEmitter<string> = new EventEmitter();
    @Output() _onStarred: EventEmitter<StarredProps> = new EventEmitter();
    @Output() _onDelete: EventEmitter<string> = new EventEmitter();
    @Output() _onRename: EventEmitter<ProjectRename> = new EventEmitter();

    // clonedJsonSchema!: ProjectSchema;
    starredActiveIcon: string = `../../../assets/icons/starred_active.svg`;
    starredInactiveIcon: string = `../../../assets/icons/starred.svg`;
    cardSchema: CardSchema = {
        clickIndex: -1,
    };
    previousProjectLength = 0;
    constructor(private _cd: ChangeDetectorRef) {
        // this.clonedJsonSchema = cloneDeep(this._jsonSchema);
    }

    ngOnInit(): void {}

    conditionalDisableProject = ({ is_loaded }: Project): string | null => (is_loaded ? 'disabled' : 'enabled');

    conditionalDisableClickEvent = (is_loaded: boolean): boolean => is_loaded;

    onOpenProject = (index: number, { project_name, is_loaded }: Project): void => {
        // !is_loaded && !this.isExactIndex(index) && this._onClick.emit(project_name);
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
        // console.log(this.cardSchema);
    };

    onCloseDisplay = (): void => {
        this.cardSchema.clickIndex = -1;
    };

    onStarred = (project: Project, starred: boolean): void => {
        const { project_name } = project;
        this._jsonSchema.projects = this._jsonSchema.projects.map((project) =>
            project.project_name === project_name ? ((project.is_starred = starred), project) : project,
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
