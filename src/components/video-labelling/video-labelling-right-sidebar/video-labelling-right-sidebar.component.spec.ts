/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VideoLabellingRightSidebarComponent } from './video-labelling-right-sidebar.component';

describe('VideoLabellingRightSidebarComponent', () => {
    let component: VideoLabellingRightSidebarComponent;
    let fixture: ComponentFixture<VideoLabellingRightSidebarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VideoLabellingRightSidebarComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VideoLabellingRightSidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
