import { ClassifaiModalService } from './classifai-modal.service';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'modal',
    templateUrl: './classifai-modal.component.html',
    styleUrls: ['./classifai-modal.component.less'],
    encapsulation: ViewEncapsulation.None,
})
export class ClassifaiModalComponent implements OnInit, OnDestroy {
    @Input() id!: string;
    private element: any;

    constructor(private _modalService: ClassifaiModalService, private _el: ElementRef) {
        this.element = this._el.nativeElement;
        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);
    }

    ngOnInit(): void {
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // close modal on background click
        // this.element.addEventListener('click', (el) => {
        //   if (el.target.className === 'jw-modal') {
        //     this.close();
        //   }
        // });

        this._el.nativeElement.children[0].style.background = 'black';
        // console.log(this);
        // add self (this modal instance) to the modal service so it's accessible from controllers
        this._modalService.add(this);
    }

    // remove self from modal service when component is destroyed
    ngOnDestroy(): void {
        // this._modalService.remove(this.id);
        this.element.remove();
    }

    // open modal
    open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    // close modal
    close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('modal-open');
        this._el.nativeElement.children[0].style.background = null;
    }
}
