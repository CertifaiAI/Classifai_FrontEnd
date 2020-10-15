import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { projectSchema } from './../data-set-layout.model';

@Component({
    selector: 'data-set-card',
    templateUrl: './data-set-card.component.html',
    styleUrls: ['./data-set-card.component.scss'],
})
export class DataSetCardComponent implements OnInit, OnChanges {
    @Input() _jsonSchema!: projectSchema;
    @Output() _onClick: EventEmitter<string> = new EventEmitter();
    clickedIndex: number = -1;
    // status = 'New';
    // createdDate = '22092020';
    constructor() {}

    ngOnInit(): void {}

    onOpenProject = (projectName: string): void => {
        // console.log(projectName);
        this._onClick.emit(projectName);
    };

    onDisplayMore = (index: number): void => {
        // alert(`${index}`);
        this.clickedIndex = this.clickedIndex === index ? -1 : index;
    };

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
    }
}
