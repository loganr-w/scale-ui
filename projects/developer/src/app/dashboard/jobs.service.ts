import { EventEmitter, Injectable, Output } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class DashboardJobsService {
    @Output() favoritesUpdated: EventEmitter<any> = new EventEmitter();
    private FAVORITES_KEY = 'scale.dashboard.favorites';
    favorites = [];
    allJobs = [];

    constructor() {
        this.refreshFavorites();
    }

    isFavorite(jobType) {
        return _.find(this.favorites, { name: jobType.name, version: jobType.version });
    }

    toggleFavorite(jobType) {
        if (_.find(this.favorites, { name: jobType.name, version: jobType.version })) {
            // remove it
            _.remove(this.favorites, { name: jobType.name, version: jobType.version });
        } else {
            // add it
            this.favorites.push(jobType);
        }
        this.favoritesUpdated.emit();
        this.saveFavorites();
    }

    getFavorites() {
        return this.favorites;
    }

    refreshFavorites() {
        const val = localStorage.getItem(this.FAVORITES_KEY);
        if (val) {
            this.favorites = JSON.parse(val);
        }
    }

    saveFavorites() {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }

    getAllJobs() {
        return this.allJobs;
    }

    setAllJobs(data) {
        this.allJobs = data;
    }
}
