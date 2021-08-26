import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent {
    single: any = [
        {
            name: 'Germany',
            value: 8940000,
        },
        {
            name: 'USA',
            value: 5000000,
        },
        {
            name: 'France',
            value: 7200000,
        },
    ];
    view: any[] = [400, 350];

    // options
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Country';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Population';
    legendPosition: string = 'below';

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };

    constructor() {}

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
