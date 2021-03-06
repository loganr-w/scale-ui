import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';
import { ScansApiService } from './api.service';
import { ScansDatatable } from './datatable.model';
import { ScansDatatableService } from './datatable.service';
import { Globals } from '../../globals';

@Component({
    selector: 'dev-scans',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ScansComponent implements OnInit, OnDestroy {
    scans: any;
    selectedScan: any;
    selectedRows: any;
    datatableLoading: boolean;
    apiLoading: boolean;
    datatableOptions: ScansDatatable;
    columns = [
        { field: 'name', header: 'Name' },
        { field: 'file_count', header: 'File Count' },
        { field: 'job', header: 'Job' },
        { field: 'created', header: 'Created (Z)' },
        { field: 'last_modified', header: 'Last Modified (Z)' }
    ];
    count: number;
    started: string;
    ended: string;
    isInitialized = false;
    subscription: any;
    isMobile: boolean;
    globals: Globals;

    nameFilterText: string;
    onNameFilter = _.debounce((e) => {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            name: e.target.value
        });
        this.updateOptions();
    }, 1000);

    constructor(
        private dataService: DataService,
        private scansDatatableService: ScansDatatableService,
        private scansApiService: ScansApiService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        public breakpointObserver: BreakpointObserver,
        globals: Globals
    ) {
        this.globals = globals;
    }



    private updateData() {
        this.unsubscribe();
        this.datatableLoading = true;

        this.apiLoading = true;
        this.subscription = this.scansApiService.getScans(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.apiLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const scan = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!scan;
            });
            this.scans = data.results;
        }, err => {
            this.datatableLoading = false;
            this.apiLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving scans', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d, idx) => {
            if (idx === 'started' || idx === 'ended') {
                // allow started and ended to be empty
                return d;
            }
            return d !== null && typeof d !== 'undefined' && d !== '';
        });

        this.scansDatatableService.setScansDatatableOptions(this.datatableOptions);

        // update router params
        const params = this.datatableOptions as Params;
        params.started = params.started || this.started;
        params.ended = params.ended || this.ended;

        this.router.navigate(['/system/scans'], {
            queryParams: params,
            replaceUrl: true
        });
    }
    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            if (e.sortField !== this.datatableOptions.sortField || e.sortOrder !== this.datatableOptions.sortOrder) {
                this.datatableOptions = Object.assign(this.datatableOptions, {
                    first: 0,
                    sortField: e.sortField,
                    sortOrder: e.sortOrder
                });
            }
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedBatchRows(e);
        }
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.which === 2) {
            window.open(this.getScanURL(e.data));
        } else {
            this.router.navigate([this.getScanURL(e.data)]);
        }
    }
    getScanURL(scan: any): string {
        return `/system/scans/${scan.id}`;
    }

    /**
     * Callback for when temporal filter tells this component to update visible date range.
     * @param data start and end iso strings for what dates should be filtered
     */
    onTemporalFilterUpdate(data: {start: string, end: string}): void {
        // determine if values have changed
        const isSame = this.started === data.start && this.ended === data.end;

        // keep local model in sync
        this.started = data.start;
        this.ended = data.end;
        // update the datatable options then call the api
        this.datatableOptions = Object.assign(this.datatableOptions, {
                started: data.start,
                ended: data.end
            });
        this.updateOptions();

        // updateOptions will only cause a data refresh if the route params are different
        // force a data update only when the params haven't changed
        if (isSame) {
            this.updateData();
        }
    }

    onCreateClick(e) {
        if (e.ctrlKey || e.metaKey) {
            window.open('/system/scans/create');
        } else {
            this.router.navigate([`/system/scans/create`]);
        }
    }

    cancelScan(id, scan) {
        this.scansApiService.cancelScan(id, scan).subscribe(data => {
             this.messageService.add({
                 severity: 'success',
                 summary: 'Scan Successfully Cancelled',
                 detail: data.canceled_jobs.length + ' ingest jobs canceled'
             });
         }, err => {
             console.log(err);
             this.messageService.add({severity: 'error', summary: 'Error canceling scan', detail: err.statusText});
         });

     }

    ngOnInit() {
        this.selectedRows = this.dataService.getSelectedScanRows();

        this.breakpointObserver.observe(['(min-width: 1220px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        if (!this.datatableOptions) {
            this.datatableOptions = this.scansDatatableService.getScansDatatableOptions();
        }
        this.scans = [];
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: params.first ? parseInt(params.first, 10) : 0,
                    rows: params.rows ? parseInt(params.rows, 10) : 10,
                    sortField: params.sortField ? params.sortField : 'last_modified',
                    sortOrder: params.sortOrder ? parseInt(params.sortOrder, 10) : -1,
                    started: this.datatableOptions.started || params.started,
                    ended: this.datatableOptions.ended || params.ended,
                    duration: params.duration ? params.duration : null,
                    name: params.name || null
                };
            }
            this.started = this.datatableOptions.started;
            this.ended = this.datatableOptions.ended;
            this.nameFilterText = this.datatableOptions.name;
            this.updateData();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
