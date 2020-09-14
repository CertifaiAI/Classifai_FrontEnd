import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'data-set-layout',
    templateUrl: './data-set-layout.component.html',
    styleUrls: ['./data-set-layout.component.scss'],
})
export class DataSetLayoutComponent implements OnInit {
    @ViewChild('myModal', { static: false }) modal!: ElementRef;

    open() {
        this.modal.nativeElement.style.display = 'block';
    }

    close() {
        this.modal.nativeElement.style.display = 'none';
    }

    constructor() {}

    ngOnInit() {}
}
