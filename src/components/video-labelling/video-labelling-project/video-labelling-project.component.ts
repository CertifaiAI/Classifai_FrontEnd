import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TabsProps } from 'shared/types/image-labelling/image-labelling.model';
import { isEqual } from 'lodash-es';

@Component({
    selector: 'video-labelling-project',
    templateUrl: './video-labelling-project.component.html',
    styleUrls: ['./video-labelling-project.component.scss'],
})
export class VideoLabellingProjectComponent implements OnInit, OnChanges {
    @Input() _tabStatus: TabsProps[] = [];
    @Output() _onClose = new EventEmitter();
    isTabStillOpen: boolean = true;

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

    checkStateEqual = (currObj: object, prevObj: object): boolean => !isEqual(currObj, prevObj);

    ngOnChanges(changes: SimpleChanges): void {
      if (
          changes._tabStatus &&
          this.checkStateEqual(changes._tabStatus.currentValue, changes._tabStatus.previousValue)
      ) {
          this.isTabStillOpen = false;
          for (const { closed } of this._tabStatus) {
              if (!closed) {
                  this.isTabStillOpen = true;
                  break;
              }
          }
      }
  }
}
