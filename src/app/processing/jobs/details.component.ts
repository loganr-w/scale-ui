import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { Job } from './api.model';
import { JobsApiService } from './api.service';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-job-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobDetailsComponent implements OnInit {
    job: Job;
    jobStatus: string;
    options: any;
    data: any;
    triggerOccurred: string;
    selectedJobExe: any;
    logDisplay: boolean;

    constructor(
        private route: ActivatedRoute,
        private jobsApiService: JobsApiService,
        private dataService: DataService
    ) {}

    calculateFileSize(fileSize) {
        return this.dataService.calculateFileSizeFromBytes(fileSize, 0);
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    showExeLog(event, exe) {
        this.selectedJobExe = exe;
        this.logDisplay = true;
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.jobsApiService.getJob(id).then(data => {
                this.job = data;
                this.triggerOccurred = data.event.occurred ?
                    moment.duration(moment.utc(data.event.occurred).diff(moment.utc())).humanize(true) :
                    '';
                const now = moment.utc();
                const lastStatus = moment.utc(this.job.last_status_change);
                this.jobStatus = `${_.capitalize(this.job.status)} ${lastStatus.from(now)}`;
                this.options = {
                    elements: {
                        font: 'Roboto'
                    },
                    scales: {
                        xAxes: [{
                            type: 'timeline',
                            bounds: 'ticks',
                            ticks: {
                                callback: (value, index, values) => {
                                    if (!values[index]) {
                                        return;
                                    }
                                    return moment.utc(values[index]['value']).format('HH:mm:ss[Z]');
                                }
                            }
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: (tooltipItem, chartData) => {
                                const d = chartData.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return [
                                    d[2],
                                    moment.utc(d[0]).format('YYYY-MM-DD HH:mm:ss[Z]'),
                                    moment.utc(d[1]).format('YYYY-MM-DD HH:mm:ss[Z]')
                                ];
                            }
                        }
                    },
                    plugins: {
                        datalabels: false,
                        timeline: true
                    },
                    colorFunction: () => {
                        return Color('#009ac8');
                    },
                    maintainAspectRatio: false
                };
                this.data = {
                    labels: ['Created', 'Queued', 'Executed'],
                    datasets: [{
                        data: [
                            [data.created, data.queued, this.dataService.calculateDuration(data.created, data.queued, true)]
                        ]
                    }, {
                        data: [
                            [data.queued, data.started, this.dataService.calculateDuration(data.queued, data.started, true)]
                        ]
                    }, {
                        data: [
                            [data.started, data.ended, this.dataService.calculateDuration(data.started, data.ended, true)]
                        ]
                    }]
                };
            });
        }
    }
}
