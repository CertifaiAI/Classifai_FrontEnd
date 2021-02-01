import { CardFieldSchema } from '../../../layouts/home-layout/home-layout.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'home-card',
    templateUrl: './home-card.component.html',
    styleUrls: ['./home-card.component.scss'],
})
export class HomeCardComponent implements OnInit {
    @Input() _jsonSchema!: CardFieldSchema;
    @Output() _navigate: EventEmitter<any> = new EventEmitter();
    hover!: boolean;
    hoverIndex!: number;

    constructor() {}

    ngOnInit() {}

    mouseEventCapture(event: MouseEvent, index: number): void {
        const { type } = event;
        this.hover = type === 'mouseover' ? true : false;
        this.hoverIndex = index;
    }

    emitParentUrl(enabled: boolean, url: string): void {
        enabled ? this._navigate.emit(url) : null;
    }

    hoverStyling = (index: number, isHover: boolean, hoverLabel: string, imgPath: string): object =>
        index === this.hoverIndex && isHover
            ? {
                  'background-image': 'url(' + imgPath + ')',
                  opacity: '1.0',
                  cursor: hoverLabel ? 'not-allowed' : 'pointer',
              }
            : {
                  'background-image': 'url(' + imgPath + ')',
                  opacity: '0.5',
              };

    conditionalHoverPlaceholder = (index: number, hoverLabel: string): string =>
        index === this.hoverIndex && hoverLabel ? hoverLabel : '';
}
