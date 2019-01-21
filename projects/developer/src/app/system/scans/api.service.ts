import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Scan } from './api.model';

@Injectable()
export class ScansApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('products');
    }

    getScans(params: any, poll?: boolean): Observable<ApiResults> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams: any = {
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            name: params.name,
            order: sortStr
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/scans/`, { params: queryParams })
                .pipe(
                    map(response => {
                        const returnObj = ApiResults.transformer(response);
                        returnObj.results = Scan.transformer(returnObj.results);
                        return returnObj;
                    }),
                    catchError(this.dataService.handleError)
                );
            return polling(request, { interval: 600000 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/scans/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = Scan.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(this.dataService.handleError)
            );
    }

    getScan(id: number): Observable<any> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/scans/${id}/`)
            .pipe(
                map(response => {
                    return Scan.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    validateScan(scan: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/scans/validation/`, scan)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    editScan(id: number, scan: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/scans/${id}/`, scan)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    createScan(scan: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/scans/`, scan)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    processScan(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/scans/${id}/process/`, { ingest: true })
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
