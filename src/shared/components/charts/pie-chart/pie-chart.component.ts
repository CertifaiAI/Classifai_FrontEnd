import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent {
    single: any[] = [
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
        {
            name: 'UK',
            value: 6200000,
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
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };

    constructor() {
        Object.assign(this, { single: this.single });
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
