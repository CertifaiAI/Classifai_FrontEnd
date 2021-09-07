import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartProps } from 'shared/types/dataset-layout/data-set-layout.model';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnChanges {
    @Input() labelStats: ChartProps[] = [];

    chartData: ChartProps[] = this.labelStats;
    view: any[] = [400, 350];

    // options
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = false;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Labels';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Count';
    legendPosition: string = 'below';

    colorScheme = {
        domain: ['#a27ea8'],
    };

    ngOnChanges(changes: SimpleChanges): void {
        this.chartData = changes.labelStats.currentValue;
    }

    axisFormat(val: number) {
        if (val % 1 === 0) {
            return val.toLocaleString();
        } else {
            return '';
        }
    }
}
