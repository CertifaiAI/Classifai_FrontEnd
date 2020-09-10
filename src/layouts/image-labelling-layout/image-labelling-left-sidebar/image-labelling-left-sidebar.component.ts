import { IimageLabellingSchema, Props } from '../image-labelling-layout.model';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'image-labelling-left-sidebar',
  templateUrl: './image-labelling-left-sidebar.component.html',
  styleUrls: ['./image-labelling-left-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingLeftSidebarComponent implements OnInit, OnChanges {
  // @Input() _theme: string;
  // @Input() _status: boolean;
  @Input() _onChange: Props;
  @Output() _navigate: EventEmitter<any> = new EventEmitter();
  imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
  jsonSchema: IimageLabellingSchema;
  iconIndex: number;

  constructor() {}

  ngOnInit(): void {
    this.bindImagePath();
  }

  bindImagePath = () => {
    this.jsonSchema = {
      logos: [
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/pointer.png`,
          hoverLabel: `Pointer`,
          alt: `Pointer`,
        },
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/move.png`,
          hoverLabel: `Move Image`,
          alt: `Move Image`,
        },
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/rec_bounding_box.png`,
          hoverLabel: `Rectangular Bounding Box`,
          alt: `RectangularBB`,
        },
        // {
        //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/bounding_box.png`,
        //   hoverLabel: `Bounding Box`,
        //   alt: `BoundingBox`,
        // },
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/polygon.png`,
          hoverLabel: `Polygon`,
          alt: `Polygon`,
        },
        // {
        //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/auto_select.png`,
        //   hoverLabel: `Auto Select`,
        //   alt: `AutoSelect`,
        // },
        // {
        //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/brush_segmentation.png`,
        //   hoverLabel: `Brush Segmentation`,
        //   alt: `BrushSeg`,
        // },
        // {
        //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/key_point.png`,
        //   hoverLabel: `Key Point`,
        //   alt: `KeyPoint`,
        // },
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/eraser.png`,
          hoverLabel: `Eraser`,
          alt: `Eraser`,
        },
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/fit_center.png`,
          hoverLabel: `Fit Center`,
          alt: `Fit Center`,
        },
        // {
        //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/move_img_px.png`,
        //   hoverLabel: `Move Image by Pixel`,
        //   alt: `Move Image by Pixel`,
        // },
        {
          imgPath: `${this.imgRelativePath}${this._onChange.theme}/save.png`,
          hoverLabel: `Save`,
          alt: `Save`,
        },
      ],
    };
  };

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    const { theme } = changes._onChange.currentValue;
    // console.log(currentValue);
    this._onChange.theme = theme;
    this.bindImagePath();
  }

  getIndex = (index: number): void => {
    this.iconIndex = index;
  };

  conditionalIconTheme = (): string => `utility-icon-${this._onChange.theme}`;

  conditionalActiveIcon = (index: number): object =>
    index === this.iconIndex
      ? this._onChange.theme === 'light-theme'
        ? { background: 'rgb(59 59 59)', outline: 'darkgrey inset 0.1vw' }
        : { background: 'darkgray', outline: 'cyan inset 0.1vw' }
      : null;
}
