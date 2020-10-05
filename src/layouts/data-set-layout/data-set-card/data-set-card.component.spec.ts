/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DataSetCardComponent } from './data-set-card.component';

describe('DataSetCardComponent', () => {
    let component: DataSetCardComponent;
    let fixture: ComponentFixture<DataSetCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataSetCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataSetCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
