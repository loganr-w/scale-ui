import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorService } from '../../color.service';
import { HistorychartComponent } from './historychart.component';


describe('HistorychartComponent', () => {
    let component: HistorychartComponent;
    let fixture: ComponentFixture<HistorychartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HistorychartComponent],
            providers: [ColorService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HistorychartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
