import { isEqual } from 'lodash-es';
import { Props, IThumbnailMetadata, TabsProps } from '../image-labelling-layout.model';
import {
    Component,
    OnInit,
    Input,
    SimpleChanges,
    OnChanges,
    ChangeDetectionStrategy,
    Output,
    EventEmitter,
} from '@angular/core';

@Component({
    selector: 'image-labelling-project',
    templateUrl: './image-labelling-project.component.html',
    styleUrls: ['./image-labelling-project.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingProjectComponent implements OnInit, OnChanges {
    // @ViewChildren('section') sections: QueryList<ElementRef>;
    @Input() _thumbnailList!: Props<IThumbnailMetadata[]>;
    @Input() _tabStatus: TabsProps[] = [];
    @Output() _onClose: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onClick: EventEmitter<number> = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    onClose = (tab: TabsProps): void => {
        // console.log(tab);
        // this._tabStatus = this._tabStatus.map((props) =>
        //   props.tabNo === tab.tabNo
        //     ? { ...props, closed: !props.closed }
        //     : { ...props }
        // );
        this._onClose.emit({ name: tab.name, closed: true });
        // this._tabStatus = this._tabStatus.map(
        //   (props) =>
        //     Object.entries(props).map(([key, value]) => ({
        //       [key]:
        //         key === Object.keys(tab).toString()
        //           ? { ...value, closed: !value.closed }
        //           : { ...value },
        //     }))[0]
        // );

        // console.log(this._tabStatus);
    };

    onClick = (uuid: number): void => {
        this._onClick.emit(uuid);
    };

    checkCloseToggle = <T extends TabsProps>({ closed }: T): string | null => (closed ? 'closed' : null);

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._thumbnailList) {
            const { currentValue }: { currentValue: Props<IThumbnailMetadata[]> } = changes._thumbnailList;
            // console.log(currentValue);
            this._thumbnailList = Object.assign([], this._thumbnailList, [...currentValue]);
        }

        if (
            changes._tabStatus &&
            this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
        ) {
            const { currentValue }: { currentValue: TabsProps[] } = changes._tabStatus;
            this._tabStatus = [...currentValue];
        }
    }
}
