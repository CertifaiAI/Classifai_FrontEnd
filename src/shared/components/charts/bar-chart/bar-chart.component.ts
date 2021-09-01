import { Component, Input, NgModule, OnChanges, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
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
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Count';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Labels';
    legendPosition: string = 'below';

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        this.chartData = changes.labelStats.currentValue;
    }

    onSelect(data: any): void {
        console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }

    onActivate(data: any): void {
        console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data: any): void {
        console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }
}
