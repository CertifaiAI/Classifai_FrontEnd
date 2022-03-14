import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartProps } from 'shared/types/dataset-layout/data-set-layout.model';

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnChanges {
    @Input() labelledImage: number = 0;
    @Input() unLabelledImage: number = 10;

    chartData: ChartProps[] = [
        {
            name: 'Labelled Data',
            value: this.labelledImage,
        },
        {
            name: 'Unlabelled Data',
            value: this.unLabelledImage,
        },
    ];

    view: any[] = [450, 350];

    // options
    gradient: boolean = false;
    showLegend: boolean = true;
    showLabels: boolean = false;
    isDoughnut: boolean = false;
    legendPosition: string = 'below';

    colorScheme = {
        domain: ['#aae3f5', '#7aa3e5'],
    };

    ngOnChanges(changes: SimpleChanges): void {
        // this.chartData = [
        //     {
        //         name: 'Labelled Image',
        //         value: changes.labelledImage?.currentValue || 0,
        //     },
        //     {
        //         name: 'Unlabelled Image',
        //         value: changes.unLabelledImage?.currentValue || 0,
        //     },
        // ];
    }
}
