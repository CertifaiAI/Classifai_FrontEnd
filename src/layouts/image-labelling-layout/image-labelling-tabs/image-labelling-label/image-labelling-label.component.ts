import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { isEqual } from 'lodash-es';
import { SelectedThumbnailProps, TabsProps } from '../../image-labelling-layout.model';

@Component({
    selector: 'image-labelling-label',
    templateUrl: './image-labelling-label.component.html',
    styleUrls: ['./image-labelling-label.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingLabelComponent implements OnInit, OnChanges {
    @Input() _tabStatus: TabsProps[] = [];
    @Output() _onClose: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onClick: EventEmitter<SelectedThumbnailProps> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    onClose = (tab: TabsProps): void => {
        this._onClose.emit({ name: tab.name, closed: true });
    };

    onClick = <T extends Omit<SelectedThumbnailProps, 'img_src'>>({ uuid }: T): void => {
        this._onClick.emit({ uuid, img_src: '' });
    };

    checkCloseToggle = <T extends TabsProps>({ closed }: T): string | null => (closed ? 'closed' : null);

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        if (
            changes._tabStatus &&
            this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
        ) {
            const { currentValue }: { currentValue: TabsProps } = changes._tabStatus;
            this._tabStatus = [{ ...currentValue }];
        }
    }
}
