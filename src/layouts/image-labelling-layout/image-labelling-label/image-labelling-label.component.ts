import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'image-labelling-label',
  templateUrl: './image-labelling-label.component.html',
  styleUrls: ['./image-labelling-label.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingLabelComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
