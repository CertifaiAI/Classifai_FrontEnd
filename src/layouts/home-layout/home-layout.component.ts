import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/components/modal/modal.service';
import { Router } from '@angular/router';
import { ModalBodyStyle } from 'src/components/modal/modal.model';

@Component({
    selector: 'home-layout',
    templateUrl: './home-layout.component.html',
    styleUrls: ['./home-layout.component.scss'],
})
export class HomeLayoutComponent implements OnInit {
    navigateUrl = '';
    modalBodyStyle: ModalBodyStyle = {
        minHeight: '30vh',
        maxHeight: '30vh',
        minWidth: '20vw',
        maxWidth: '20vw',
        margin: '16vw 79vh',
    };
    constructor(private _modalService: ModalService, private _router: Router) {}

    ngOnInit() {}

    navigate(url: string): void {
        // console.log(url);
        this.navigateUrl = url;
        this.onDisplayModal();
        // this._router.navigate([url]);
    }

    onDisplayModal = (id = 'modal-home') => {
        this._modalService.open(id);
    };

    onCloseModal = (path?: 'boundingbox' | 'segmentation', id = 'modal-home') => {
        path && this._router.navigate([`${this.navigateUrl}/${path}`]);
        this._modalService.close(id);
    };
}
