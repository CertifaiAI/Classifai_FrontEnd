import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'empty-container',
  templateUrl: './empty-container.component.html',
  styleUrls: ['./empty-container.component.scss']
})
export class EmptyContainerComponent implements OnInit {

  @Input() _case: string = 'NO_CONTENT';
  title = 'datasetCard.noProject';
  subtitle = 'datasetCard.createNew';

  ngOnInit() {
    switch (this._case) {
      case 'FETCH':
        this.title = 'datasetCard.fetchingProject';
        this.subtitle = 'datasetCard.pleaseWait';
        break;
      case 'NO_STARRED':
        this.title = 'datasetCard.noStarred';
        this.subtitle = 'datasetCard.starIt';
        break;
      default:
        this.title = 'datasetCard.noProject';
        this.subtitle = 'datasetCard.createNew';
        break;
    }
  }

}
