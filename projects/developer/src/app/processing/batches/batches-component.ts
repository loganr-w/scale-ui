import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { BatchesApiService } from './api.service';
import { Batch } from './api.model';
import { BatchesDatatable } from './datatable.model';
import { BatchesDatatableService } from './datatable.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { Globals } from '../../globals';

@Component({
    selector: 'dev-batches',
    templateUrl: './batches-component.html',
    styleUrls: ['./batches-component.scss']
})

export class BatchesComponent implements OnInit, OnDestroy {
    batches: any;
    dateFormat = environment.dateFormat;
    selectedBatch: any;
    selectedRows: any;
    datatableLoading: boolean;
    apiLoading: boolean;
    datatableOptions: BatchesDatatable;
    columns = [
        { field: 'title', header: 'Title' },
        { field: 'recipe_type', header: 'Recipe Type' },
        { field: 'is_creation_done', header: 'Recipes' },
        { field: 'jobs_total', header: 'Jobs' },
        { field: 'created', header: 'Created (Z)' },
        { field: 'last_modified', header: 'Last Modified (Z)' }
    ];
    recipeTypes: any;
    recipeTypeOptions: SelectItem[];
    selectedRecipeType: any = [];
    count: number;
    started: string;
    ended: string;
    isInitialized = false;
    subscription: any;
    isMobile: boolean;
    globals: Globals;

    constructor(
        private dataService: DataService,
        private batchesDatatableService: BatchesDatatableService,
        private batchesApiService: BatchesApiService,
        private recipeTypesApiService: RecipeTypesApiService,
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
        this.subscription = this.batchesApiService.getBatches(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.apiLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const batch = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!batch;
            });
            this.batches = Batch.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.apiLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving batches', detail: err.statusText});
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
        this.batchesDatatableService.setBatchesDatatableOptions(this.datatableOptions);

        // update router params
        const params = this.datatableOptions as Params;
        params.started = params.started || this.started;
        params.ended = params.ended || this.ended;

        this.router.navigate(['/processing/batches'], {
            queryParams: params,
            replaceUrl: true
        });
    }
    private getRecipeTypes() {
        this.selectedRecipeType = [];
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = RecipeType.transformer(data.results);
            const selectItems = [];
            _.forEach(this.recipeTypes, recipeType => {
                selectItems.push({
                    label: recipeType.title,
                    value: recipeType
                });
                if (_.indexOf(this.datatableOptions.recipe_type_id, _.toString(recipeType.id)) >= 0 &&
                        !_.find(this.selectedRecipeType, recipeType))  {
                    this.selectedRecipeType.push(recipeType);
                }
            });
            this.recipeTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.updateData();
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving recipe types', detail: err.statusText});
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

    onRecipeTypeChange(e) {
        const id = _.map(e.value, 'id');
        this.datatableOptions.recipe_type_id = id.length > 0 ? id : null;
        this.updateOptions();
    }

    onRowSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedBatchRows(e);
        }
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.which === 2) {
            window.open(`/processing/batches/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/batches/${e.data.id}`]);
        }
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

    ngOnInit() {
        this.selectedRows = this.dataService.getSelectedBatchRows();

        this.breakpointObserver.observe(['(min-width: 1275px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        if (!this.datatableOptions) {
            this.datatableOptions = this.batchesDatatableService.getBatchesDatatableOptions();
        }

        this.batches = [];
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
                    recipe_type_id: params.recipe_type_id ?
                        Array.isArray(params.recipe_type_id) ?
                            params.recipe_type_id :
                            [params.recipe_type_id]
                        : null,
                    is_creation_done: params.is_creation_done ? params.is_creation_done === 'true' : null,
                    is_superseded: params.is_superseded ? params.is_superseded === 'true' : null,
                    root_batch_id: params.root_batch_id ? +params.root_batch_id : null
                };
            }
            this.started = this.datatableOptions.started;
            this.ended = this.datatableOptions.ended;
            this.getRecipeTypes();
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    onFilterClick(event) {
        console.log('Fliter clicked: ', event);
    }
}
