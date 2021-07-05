/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalBodyStyle } from './modal.model';
import { ModalService } from './modal.service';

@Component({
    selector: 'modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
    @Input() id: string = '';
    @Input() modalBodyStyle!: ModalBodyStyle;
    @Input() modalTitle: string = '';
    @Input() showHeader: boolean = true;
    @Input() scrollable: boolean = true;
    @Input() zIndex: number = 1; // Assign [zIndex]="2" , if it is the second modal show in display at one time.
    private element: HTMLDivElement;

    constructor(private _modalService: ModalService, private _el: ElementRef) {
        this.element = this._el.nativeElement;
        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        // document.body.appendChild(this.element);
    }

    ngOnInit(): void {
        this.zIndex !== 1 && (this.modalBodyStyle.zIndex = (this.zIndex * 2000).toString());
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // close modal on background click
        // this.element.addEventListener('click', ({ target }: any) =>
        //     target.className === 'modal' && this.close(),
        // );

        // this._el.nativeElement.children[0].style.background = 'black';

        // console.log(this);
        // add self (this modal instance) to the modal service so it's accessible from controllers
        this._modalService.add(this);
        this.close();
    }

    // remove self from modal service when component is destroyed
    ngOnDestroy(): void {
        this._modalService.remove(this.id);
        this.element.remove();
    }

    applyStyling = () => {
        const className = `${!this.modalBodyStyle && 'modal-body-height modal-body-width modal-body-margin'} ${
            this.scrollable && 'scroll'
        }`;
        return className;
    };

    // open modal
    open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    // close modal
    close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('modal-open');
        this._modalService.openedModalsId = this._modalService.openedModalsId.filter((idx) => idx !== this.id);
        // this._el.nativeElement.children[0].style.background = null;
    }

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key }: KeyboardEvent): void => {
        if (this.id !== 'modal-create-project' && this.id !== 'modal-import-project') {
            key === 'Escape' && this.close();
        }
    };
}
