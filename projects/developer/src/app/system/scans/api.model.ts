import { DataService } from '../../common/services/data.service';
import { Job } from '../../processing/jobs/api.model';
import { ScanConfiguration } from './api.configuration.model';

export class Scan {
    dataService: DataService;
    createdDisplay: string;
    createdTooltip: string;
    lastModifiedDisplay: string;
    lastModifiedTooltip: string;
    configurationDisplay: string;

    private static build(data) {
        if (data) {
            return new Scan(
                data.id,
                data.name,
                data.title,
                data.description,
                data.file_count,
                data.job,
                data.dry_run_job,
                data.created,
                data.last_modified,
                data.configuration ? ScanConfiguration.transformer(data.configuration) : data.configuration
            );
        }
    }

    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Scan.build(item));
            }
            return Scan.build(data);
        }
        return new Scan(null, 'untitled-scan', 'Untitled Scan', null, null, null, null, null, null, ScanConfiguration.transformer(null));
    }

    public clean(): object {
        return {
            title: this.title,
            description: this.description,
            configuration: this.configuration
        };
    }

    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public file_count: number,
        public job: Job,
        public dry_run_job: Job,
        public created: string,
        public last_modified: string,
        public configuration: any
    ) {
        this.dataService = new DataService();
        this.createdDisplay = this.dataService.formatDate(this.created, true);
        this.createdTooltip = this.dataService.formatDate(this.created);
        this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
        if (this.configuration) {
            this.configurationDisplay = JSON.stringify(this.configuration, null, 4);
        }
    }
}