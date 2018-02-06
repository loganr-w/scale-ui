import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { environment } from '../../../environments/environment';

import { ApiResults } from '../../api-results.model';
import { RecipeType } from './api.model';

@Injectable()
export class RecipeTypesApiService {
    constructor( private http: Http) {
    }

    getRecipeTypes(params?: any): Promise<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr,
                page: page,
                page_size: params.rows,
                started: params.started,
                ended: params.ended
            };
        }
        return this.http.get(`${environment.apiPrefix}/recipe-types/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getRecipeType(id: number): Promise<RecipeType> {
        return this.http.get(`${environment.apiPrefix}/recipe-types/${id}/`)
            .toPromise()
            .then(response => RecipeType.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
