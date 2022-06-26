import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LabelColorServices {
    private readonly fixedColors: string[];
    private projectLabelColorListMap: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

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

    private getLabelColors(currentIndex: number): string {
        if (currentIndex <= this.fixedColors.length - 1) {
            return this.fixedColors[currentIndex];
        } else {
            return `hsl(${Math.floor(Math.random() * 360)}deg, ${Math.random() * 100}%, ${70}%`;
        }
    }

    getLabelColorList(projectName: string) {
        return this.projectLabelColorListMap.get(projectName) as Map<string, string>;
    }

    setLabelColors(labelList: string[], projectName: string) {
        let index: number = 0;
        const labelColorList: Map<string, string> = new Map<string, string>();

        for (const label of labelList) {
            labelColorList.set(label, this.getLabelColors(index));
            index++;
        }

        this.setProjectLabelColorListMap(projectName, labelColorList);
    }

    private setProjectLabelColorListMap(projectName: string, labelColorList: Map<string, string>) {
        this.projectLabelColorListMap.set(projectName, labelColorList);
    }
}
