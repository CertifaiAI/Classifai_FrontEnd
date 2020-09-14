import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'image-labelling-footer',
    templateUrl: './image-labelling-footer.component.html',
    styleUrls: ['./image-labelling-footer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingFooterComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
