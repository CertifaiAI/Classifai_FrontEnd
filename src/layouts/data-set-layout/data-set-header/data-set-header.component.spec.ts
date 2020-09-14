/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DataSetHeaderComponent } from './data-set-header.component';

describe('DataSetHeaderComponent', () => {
    let component: DataSetHeaderComponent;
    let fixture: ComponentFixture<DataSetHeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataSetHeaderComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataSetHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
