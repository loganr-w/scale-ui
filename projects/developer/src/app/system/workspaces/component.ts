import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { WorkspacesApiService } from './api.service';
import { Workspace } from './api.model';

@Component({
    selector: 'dev-workspaces',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
    private routeParams: any;
    private viewMenu: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', disabled: false, command: () => { this.onEditClick(); } }
    ];
    private editMenu: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', disabled: false, command: () => { this.onValidateClick(); } },
        { label: 'Save', icon: 'fa fa-save', disabled: false, command: () => { this.onSaveClick(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', disabled: false, command: () => { this.onCancelClick(); } }
    ];
    loading: boolean;
    isEditing: boolean;
    workspaces: SelectItem[] = [];
    selectedWorkspace: Workspace;
    selectedWorkspaceDetail: any;
    createForm: any;
    createFormSubscription: any;
    items: MenuItem[] = _.clone(this.viewMenu);
    typeOptions: SelectItem[] = [
        {
            label: 'Host',
            value: 'host'
        },
        {
            label: 'NFS',
            value: 'nfs'
        },
        {
            label: 'S3',
            value: 's3'
        }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private workspacesApiService: WorkspacesApiService
    ) {}

    private initFormGroups() {
        this.createForm = this.fb.group({
            name: ['', Validators.required],
            title: ['', Validators.required],
            description: [''],
            base_url: [''],
            is_active: [false],
            configuration: this.fb.group({
                broker: this.fb.group({
                    type: [''],
                    host_path: [''],
                    nfs_path: [''],
                    bucket_name: [''],
                    credentials: this.fb.group({
                        access_key_id: [''],
                        secret_access_key: ['', Validators.required]
                    }),
                    region_name: ['']
                })
            })
        });
    }

    private initBroker() {
        if (this.selectedWorkspaceDetail.configuration.broker) {
            if (this.selectedWorkspaceDetail.configuration.broker.type === 's3') {
                this.createForm.get('configuration.broker.host_path').enable();
                this.createForm.get('configuration.broker.bucket_name').enable();
                this.createForm.get('configuration.broker.region_name').enable();
                this.createForm.get('configuration.broker.credentials.access_key_id').enable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').enable();
                this.createForm.get('configuration.broker.nfs_path').disable();
            } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'host') {
                this.createForm.get('configuration.broker.host_path').enable();
                this.createForm.get('configuration.broker.bucket_name').disable();
                this.createForm.get('configuration.broker.region_name').disable();
                this.createForm.get('configuration.broker.credentials.access_key_id').disable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').disable();
                this.createForm.get('configuration.broker.nfs_path').disable();
            } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'nfs') {
                this.createForm.get('configuration.broker.host_path').disable();
                this.createForm.get('configuration.broker.bucket_name').disable();
                this.createForm.get('configuration.broker.region_name').disable();
                this.createForm.get('configuration.broker.credentials.access_key_id').disable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').disable();
                this.createForm.get('configuration.broker.nfs_path').enable();
            }
        }
    }

    private initValidation() {
        // enable/disable validate and save actions based on form status
        const validateItem = _.find(this.items, { label: 'Validate' });
        if (validateItem) {
            validateItem.disabled = this.createForm.status === 'INVALID';
        }
        const saveItem = _.find(this.items, { label: 'Save' });
        if (saveItem) {
            saveItem.disabled = this.createForm.status === 'INVALID';
        }
    }

    private initWorkspaceForm() {
        if (this.selectedWorkspaceDetail) {
            // disable the name field if editing an existing workspace
            if (this.selectedWorkspaceDetail.id) {
                this.createForm.get('name').disable();
            }

            // determine which broker fields to display
            this.initBroker();

            // add the values from the object
            this.createForm.patchValue(this.selectedWorkspaceDetail);

            // modify form actions based on status
            this.initValidation();
        }

        // listen for changes to createForm fields
        this.createFormSubscription = this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.selectedWorkspaceDetail, changes);
            this.initValidation();
        });
    }

    private getWorkspaceDetail(id: any) {
        if (id > 0) {
            this.loading = true;
            this.workspacesApiService.getWorkspace(id).subscribe(data => {
                this.selectedWorkspaceDetail = data;
                this.loading = false;
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspace details', detail: err.statusText});
            });
        } else if (id === 'create') {
            // creating a new workspace
            this.isEditing = true;
            this.selectedWorkspace = null;
            this.selectedWorkspaceDetail = Workspace.transformer(null);
            this.initWorkspaceForm();
        }
    }

    private getWorkspaces(id: any) {
        this.workspaces = [];
        this.loading = true;
        this.workspacesApiService.getWorkspaces({ sortField: 'title' }).subscribe(data => {
            this.loading = false;
            _.forEach(data.results, result => {
                this.workspaces.push({
                    label: result.title,
                    value: result
                });
                if (id && id === result.id) {
                    this.selectedWorkspace = result;
                }
            });
            this.getWorkspaceDetail(id);
        }, err => {
            this.loading = false;
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
    }

    private unsubscribeFromForm() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
        }
    }

    private redirect(id: any) {
        if (id && id === this.selectedWorkspaceDetail.id) {
            this.isEditing = false;
            this.items = _.clone(this.viewMenu);
            this.unsubscribeFromForm();
            this.createForm.reset();
        } else {
            const url = id ? id === 'create' ? '/system/workspaces' : `/system/workspaces/${id}` : '/system/workspaces';
            this.router.navigate([url]);
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick() {
        this.isEditing = true;
        this.items = _.clone(this.editMenu);
        this.initWorkspaceForm();
    }

    onValidateClick() {
        this.workspacesApiService.validateWorkspace(this.selectedWorkspaceDetail.clean()).subscribe(data => {
            if (data.is_valid) {
                if (data.warnings.length > 0) {
                    _.forEach(data.warnings, warning => {
                        this.messageService.add({severity: 'warning', summary: warning.name, detail: warning.description});
                    });
                } else {
                    this.messageService.add({severity: 'success', summary: 'Workspace is valid'});
                }
            } else {
                _.forEach(data.errors, error => {
                    this.messageService.add({severity: 'error', summary: error.name, detail: error.description});
                });
            }
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error validating workspace', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.selectedWorkspaceDetail.id) {
            // edit workspace
            const cleanWorkspace = this.selectedWorkspaceDetail.clean();
            this.workspacesApiService.editWorkspace(this.selectedWorkspaceDetail.id, cleanWorkspace).subscribe(() => {
                this.redirect(this.selectedWorkspaceDetail.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing workspace', detail: err.statusText});
            });
        } else {
            // create workspace
            this.workspacesApiService.createWorkspace(this.selectedWorkspaceDetail.clean()).subscribe(data => {
                this.redirect(data.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error creating workspace', detail: err.statusText});
            });
        }
    }

    onCancelClick() {
        this.redirect(this.selectedWorkspaceDetail.id);
    }

    onCreateClick(e) {
        if (e.ctrlKey || e.metaKey) {
            window.open('/system/workspaces/create');
        } else {
            this.router.navigate([`/system/workspaces/create`]);
        }
    }

    onTypeChange() {
        if (this.selectedWorkspaceDetail.configuration.broker.type === 's3') {
            this.createForm.get('configuration.broker.nfs_path').setValue(null);
        } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'host') {
            this.createForm.get('configuration.broker.bucket_name').setValue(null);
            this.createForm.get('configuration.broker.region_name').setValue(null);
            this.createForm.get('configuration.broker.credentials.access_key_id').setValue(null);
            this.createForm.get('configuration.broker.credentials.secret_access_key').setValue(null);
            this.createForm.get('configuration.broker.nfs_path').setValue(null);
        } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'nfs') {
            this.createForm.get('configuration.broker.bucket_name').setValue(null);
            this.createForm.get('configuration.broker.region_name').setValue(null);
            this.createForm.get('configuration.broker.credentials.access_key_id').setValue(null);
            this.createForm.get('configuration.broker.credentials.secret_access_key').setValue(null);
            this.createForm.get('configuration.broker.host_path').setValue(null);
        }

        // determine which broker fields to display
        this.initBroker();
    }

    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/workspaces/${e.value.id}`);
        } else {
            this.router.navigate([`/system/workspaces/${e.value.id}`]);
        }
    }

    onIsActiveClick(e) {
        e.originalEvent.preventDefault();
    }

    ngOnInit() {
        this.initFormGroups();
        let id = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(routeParams => {
                this.unsubscribeFromForm();
                this.createForm.reset();

                // get id from url, and convert to an int if not null
                id = routeParams.get('id');
                id = id !== null && id !== 'create' ? +id : id;

                this.isEditing = id === 'create';
                this.items = id === 'create' ? _.clone(this.editMenu) : _.clone(this.viewMenu);

                this.getWorkspaces(id);
            });
        }
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}