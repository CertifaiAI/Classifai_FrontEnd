import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LabelColorServices {
    private readonly fixedColors: string[];
    index!: number;
    labelColorList!: Map<string, string>;

    constructor() {
        this.fixedColors = [
            'red',
            'orange',
            'yellow',
            'blue',
            'cyan',
            'royalblue',
            'teal',
            'orangered',
            'coral',
            'slateblue',
            'navy',
            'gold',
            'skyblue',
            'brown',
            'green',
            'indigo',
            'magenta',
            'springgreen',
            'violet',
            'purple',
        ];
    }

    getLabelColors(currentIndex: number): string {
        if (currentIndex <= this.fixedColors.length - 1) {
            this.index = currentIndex;
            const labelColor = this.fixedColors[this.index];
            this.index++;
            return labelColor;
        } else {
            if (this.index !== 0) {
                this.index = 0;
            }
            return `hsl(${Math.floor(Math.random() * 360)}deg, ${Math.random() * 100}%, ${70}%`;
        }
    }

    setLabelColorList(labelColorList: Map<string, string>) {
        this.labelColorList = labelColorList;
    }

    getLabelColorList() {
        return this.labelColorList;
    }
}
