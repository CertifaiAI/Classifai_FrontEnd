import { projectSchema } from './../data-set-layout.model';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'data-set-card',
    templateUrl: './data-set-card.component.html',
    styleUrls: ['./data-set-card.component.scss'],
})
export class DataSetCardComponent implements OnInit, OnChanges {
    @Input() _jsonSchema!: projectSchema;
    // modeldiv: HTMLDivElement;
    // projectName = 'ProjectName';
    status = 'New';
    createdDate = '22092020';
    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        //const { theme } = changes._onChange.currentValue;
        console.log(changes);
        // this._onChange.theme = theme;
        // this.bindImagePath();
    }

    ngOnInit() {
        // this.modeldiv = document.getElementById('card-model') as HTMLDivElement;
        // this.modeldiv.style.display = 'none';
    }

    navigate({ enabled, isclick }: { enabled: boolean; isclick: boolean }): void {
        //TODO:
        console.log(enabled, isclick);
        // if (enabled && isclick) {
        //     this.modeldiv.style.display = 'block';
        // } else {
        //     this.modeldiv.style.display = 'none';
        // }
    }
}
