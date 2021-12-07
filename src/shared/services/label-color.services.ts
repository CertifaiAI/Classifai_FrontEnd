import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LabelColorServices {
    private readonly fixedColors: string[];
    index: number = 0;
    labelColorList: Map<string, string> = new Map<string, string>();

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

    getLabelColorList() {
        return this.labelColorList;
    }

    setLabelColors(labelList: string[]) {
        const labels = labelList.filter((label) => !this.labelColorList.has(label));
        for (const label of labels) {
            this.labelColorList.set(label, this.getLabelColors(this.index));
        }
    }

    resetLabelColorList() {
        this.labelColorList.clear();
        this.index = 0;
    }
}
