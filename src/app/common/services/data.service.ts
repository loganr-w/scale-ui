import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import * as _ from 'lodash';

import { catchError } from 'rxjs/internal/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { concatMap, map, tap, delay, skip } from 'rxjs/operators';
import { concat, of, throwError } from 'rxjs/index';

import { environment } from '../../../environments/environment';

@Injectable()
export class DataService {

    constructor() {
    }

    private padWithZero(input, length) {
        // Cast input to string
        input = '' + input;

        const paddingSize = Math.max(0, length - input.length);
        return new Array(paddingSize > 0 ? paddingSize + 1 : 0).join('0') + input;
    }

    calculateFileSizeFromMib(num) {
        if (num > 0) {
            if (num < 1024) {
                return num.toFixed(2) + ' MB';
            }
            if (num >= 1024 && num < 1024 * 1024) {
                return (num / 1024).toFixed(2) + ' GB';
            }
            return (num / 1024 / 1024).toFixed(2) + ' TB';
        }
        return num;
    }

    calculateFileSizeFromBytes(num, decimals) {
        if (num > 0) {
            if (num < 1024) {
                return num.toFixed(decimals) + ' Bytes';
            }
            if (num >= 1024 && num < 1024 * 1024) {
                return (num / 1024).toFixed(decimals) + ' KB';
            }
            if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
                return (num / 1024 / 1024).toFixed(decimals) + ' MB';
            }
            if (num >= 1024 * 1024 * 1024 && num < 1024 * 1024 * 1024 * 1024) {
                return (num / 1024 / 1024 / 1024).toFixed(decimals) + ' GB';
            }
            return (num / 1024 / 1024 / 1024 / 1024).toFixed(decimals) + ' TB';
        }
        return num;
    }

    calculateDuration(start, stop, noPadding?) {
        const to = moment.utc(stop),
            from = moment.utc(start),
            diff = moment.utc(to).diff(moment.utc(from)),
            duration = moment.duration(diff);

        let durationStr = '';

        if (!noPadding) {
            durationStr = duration.years() > 0 ? durationStr + this.padWithZero(duration.years(), 2) + 'Y, ' : durationStr;
            durationStr = duration.months() > 0 ? durationStr + this.padWithZero(duration.months(), 2) + 'M, ' : durationStr;
            durationStr = duration.days() > 0 ? durationStr + this.padWithZero(duration.days(), 2) + 'D, ' : durationStr;
            durationStr = duration.hours() > 0 ? durationStr + this.padWithZero(duration.hours(), 2) + 'h, ' : durationStr;
            durationStr = duration.minutes() > 0 ? durationStr + this.padWithZero(duration.minutes(), 2) + 'm, ' : durationStr;
            durationStr = durationStr + this.padWithZero(duration.seconds(), 2) + 's';
        } else {
            durationStr = duration.years() > 0 ? durationStr + duration.years() + 'Y, ' : durationStr;
            durationStr = duration.months() > 0 ? durationStr + duration.months() + 'M, ' : durationStr;
            durationStr = duration.days() > 0 ? durationStr + duration.days() + 'D, ' : durationStr;
            durationStr = duration.hours() > 0 ? durationStr + duration.hours() + 'h, ' : durationStr;
            durationStr = duration.minutes() > 0 ? durationStr + duration.minutes() + 'm, ' : durationStr;
            durationStr = durationStr + duration.seconds() + 's';
        }

        return durationStr;
    }

    formatDate(date, humanize?: boolean) {
        humanize = humanize || false;
        if (date) {
            return humanize ?
                _.capitalize(moment.utc(date).from(moment.utc())) :
                moment.utc(date).format(environment.dateFormat);
        }
        return '';
    }

    getViewportSize() {
        const w = window,
            d = document,
            e = d.documentElement,
            g = document.body,
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;

        return {
            width: x,
            height: y
        };
    }

    getApiPrefix(endpoint) {
        const versionObj = _.find(environment.apiVersions, { endpoint: endpoint });
        const version = versionObj ? versionObj.version : environment.apiDefaultVersion;
        return `${environment.apiPrefix}/${version}`;
    }

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
            'Something bad happened; please try again later.');
    }

    generatePoll(delayValue, request, mapResponse?) {
        // Set up a poll that will only start a subsequent request when the current request has resolved

        const load = new BehaviorSubject(''); // initial value in BehaviorSubject causes the stream to start when subscribed
        const whenToRefresh = of('').pipe( // create a stream using the static of. This will fire an event immediately when subscribed
            delay(delayValue), // delay the event by the specified value
            tap(() => load.next('')), // use a tap to actually trigger the next request
            skip(1) // skip since we do not want to use the '' event anywhere, it was just a trigger
        );
        if (mapResponse) {
            return load.pipe(
                concatMap(() => concat(request, whenToRefresh)),
                map(mapResponse),
                catchError(this.handleError)
            );
        }
        return load.pipe(
            concatMap(() => concat(request, whenToRefresh)),
            catchError(this.handleError)
        );
    }
}
