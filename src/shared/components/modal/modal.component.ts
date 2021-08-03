/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ImageLabellingActionService } from 'components/image-labelling/image-labelling-action.service';
import { ModalBodyStyle } from '../../types/modal/modal.model';
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

    constructor(
        private _modalService: ModalService,
        private _el: ElementRef,
        private _imgLblActionService: ImageLabellingActionService,
    ) {
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
        return `${!this.modalBodyStyle && 'modal-body-height modal-body-width modal-body-margin'} ${
            this.scrollable && 'scroll'
        }`;
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

        this._imgLblActionService.action$.subscribe(({ isActiveModal }) => {
            if (isActiveModal) {
                this._imgLblActionService.setState({ isActiveModal: false, draw: true, scroll: true });
            }
        });
        // this._imgLblActionService.setState({ isActiveModal: false, draw: true });
    }

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key }: KeyboardEvent): void => {
        if (this.id !== 'modal-create-project' && this.id !== 'modal-import-project') {
            key === 'Escape' && this.close();
        }
    };
}
