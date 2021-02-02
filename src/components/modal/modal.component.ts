import { Component, ElementRef, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
    @Input() scrollable: boolean = true;
    private element: HTMLDivElement;

    constructor(private _modalService: ModalService, private _el: ElementRef) {
        this.element = this._el.nativeElement;
        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        // document.body.appendChild(this.element);
    }

    ngOnInit(): void {
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // close modal on background click
        // this.element.addEventListener('click', ({ target }: any) =>
        //     target.className === 'modal' ? this.close() : null,
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
        // this._el.nativeElement.children[0].style.background = null;
    }
}
