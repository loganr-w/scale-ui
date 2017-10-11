import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardFavoritesService } from './favorites.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    subscription: any;
    allJobTypes: any[];
    favoriteJobTypes: any[];
    total: number;
    failed: number;
    chartData: any;

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private favoritesService: DashboardFavoritesService
    ) {
        this.allJobTypes = [];
        this.favoriteJobTypes = [];
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    ngOnInit() {
        this.refreshAllJobTypes();
        this.favoritesService.favoritesUpdated.subscribe(() => {
            this.refreshAllJobTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }

    private refreshAllJobTypes() {
        this.unsubscribe();
        this.subscription = this.jobTypesApiService.getJobTypeStatus(true).subscribe(data => {
            this.allJobTypes = data.results;

            const allJobCounts = _.flatten(_.map(this.allJobTypes, 'job_counts'));
            const sysErrors = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
                return jobCount.status === 'FAILED' && jobCount.category === 'SYSTEM';
            }), 'count'));
            const algErrors = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
                return jobCount.status === 'FAILED' && jobCount.category === 'ALGORITHM';
            }), 'count'));
            const dataErrors = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
                return jobCount.status === 'FAILED' && jobCount.category === 'DATA';
            }), 'count'));
            this.total = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
                return jobCount.status !== 'RUNNING';
            }), 'count'));
            this.failed = sysErrors + algErrors + dataErrors;
            this.chartData = [
                {
                    label: 'SYSTEM',
                    value: sysErrors
                },
                {
                    label: 'ALGORITHM',
                    value: algErrors
                },
                {
                    label: 'DATA',
                    value: dataErrors
                }
            ];

            const favs = [];
            this.allJobTypes.forEach(jt => {
                if (this.favoritesService.isFavorite(jt.job_type.id)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;
        });
    }
}

