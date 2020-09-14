import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'image-labelling-image',
    templateUrl: './image-labelling-image.component.html',
    styleUrls: ['./image-labelling-image.component.scss'],
})
export class ImageLabellingImageComponent implements OnInit {
    @Input() _thumbnail!: string;
    constructor() {}

    ngOnInit() {}
}
