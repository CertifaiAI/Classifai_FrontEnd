import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSetLayoutComponent } from '../data-set-layout.component';

@Component({
    selector: 'app-data-set-side-menu',
    templateUrl: './data-set-side-menu.component.html',
    styleUrls: ['./data-set-side-menu.component.css'],
})
export class DataSetSideMenuComponent implements OnInit {
    modeldiv!: HTMLDivElement;
    datasetdiv!: HTMLDivElement;

    constructor() {}

    ngOnInit() {
        this.modeldiv = document.getElementById('model') as HTMLDivElement;
        this.datasetdiv = document.getElementById('dataset-container') as HTMLDivElement;
        this.modeldiv.style.display = 'none';
    }
    navigate({ enabled, isclick }: { enabled: boolean; isclick: boolean }): void {
        //TODO:
        console.log(enabled, isclick);
        if (enabled && isclick) {
            this.modeldiv.style.display = 'block';
        } else {
            this.modeldiv.style.display = 'none';
        }
    }
}
