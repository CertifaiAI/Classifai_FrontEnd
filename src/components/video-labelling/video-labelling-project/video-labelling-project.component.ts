import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TabsProps } from '../video-labelling.modal';

@Component({
    selector: 'video-labelling-project',
    templateUrl: './video-labelling-project.component.html',
    styleUrls: ['./video-labelling-project.component.scss'],
})
export class VideoLabellingProjectComponent implements OnInit {
    @Input() _tabStatus: TabsProps[] = [];
    @Output() _onClose = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    onClose = (tab: TabsProps): void => {
        this._onClose.emit(tab);
    };

    checkCloseToggle = (tab: TabsProps): string | null => {
        let classes = '';
        if (
            !(
                (tab.name === 'label' && this._tabStatus[2].closed) ||
                (tab.name === 'project' && this._tabStatus[1].closed && this._tabStatus[2].closed) ||
                tab.name === 'annotation'
            )
        ) {
            classes = 'flex-content';
        }
        if (tab.closed) {
            classes += ' closed';
        }
        return classes;
    };
}
