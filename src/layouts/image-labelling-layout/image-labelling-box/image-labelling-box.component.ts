import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'image-labelling-box',
  templateUrl: './image-labelling-box.component.html',
  styleUrls: ['./image-labelling-box.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingBoxComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
