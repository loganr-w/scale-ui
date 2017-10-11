// Angular Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';


// Prime NG
import { AccordionModule } from 'primeng/components/accordion/accordion';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';
import { ButtonModule } from 'primeng/components/button/button';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { ChartModule } from 'primeng/components/chart/chart';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { ChipsModule } from 'primeng/components/chips/chips';
import { DataListModule } from 'primeng/components/datalist/datalist';
import { DataTableModule } from 'primeng/components/datatable/datatable';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { InputSwitchModule } from 'primeng/components/inputswitch/inputswitch';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';
import { InputTextareaModule } from 'primeng/components/inputtextarea/inputtextarea';
import { ListboxModule } from 'primeng/components/listbox/listbox';
import { MessagesModule } from 'primeng/components/messages/messages';
import { MultiSelectModule } from 'primeng/components/multiselect/multiselect';
import { PaginatorModule } from 'primeng/components/paginator/paginator';
import { PanelModule } from 'primeng/components/panel/panel';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { StepsModule } from 'primeng/components/steps/steps';
import { TooltipModule } from 'primeng/components/tooltip/tooltip';
import { TreeTableModule } from 'primeng/components/treetable/treetable';

// Code Mirror
import { CodemirrorModule } from 'ng2-codemirror';
import { NgxChartsDagModule } from '@swimlane/ngx-charts-dag';
import { UtcDatepickerModule } from 'angular-utc-datepicker';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColorService } from './color.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { JobsComponent } from './processing/jobs/component';
import { JobsApiService } from './processing/jobs/api.service';
import { JobsDatatableService } from './processing/jobs/datatable.service';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/component';
import { DashboardFavoritesService } from './dashboard/favorites.service';
import { RecipesComponent } from './processing/recipes/component';
import { RecipesApiService } from './processing/recipes/api.service';
import { RecipesDatatableService } from './processing/recipes/datatable.service';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesApiService } from './configuration/job-types/api.service';
import { JobTypesImportComponent } from './configuration/job-types/import.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { RecipeTypesApiService } from './configuration/recipe-types/api.service';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { StatusComponent } from './navbar/status/status.component';
import { HealthbarComponent } from './navbar/status/healthbar/healthbar.component';
import { FooterComponent } from './footer/footer.component';
import { JobtypeitemComponent } from './dashboard/jobtypeitem/jobtypeitem.component';
import { WorkspacesComponent } from './configuration/workspaces/component';
import { WorkspacesApiService } from './configuration/workspaces/api.service';
import { HistorychartComponent } from './dashboard/historychart/historychart.component';
import { SourcesComponent } from './data/sources/component';
import { SourcesApiService } from './data/sources/api.service';
import { SourcesDatatableService } from './data/sources/datatable.service';
import { SourceDetailsComponent } from './data/sources/details.component';
import { DataService } from './data.service';
import { ProcessingformComponent } from './navbar/subnav/processingform/processingform.component';
import { FailureRatesComponent } from './processing/failure-rates/component';
import { FailureRatesDatatableService } from './processing/failure-rates/datatable.service';
import { MetricsComponent } from './data/metrics/component';
import { MetricsApiService } from './data/metrics/api.service';
import { RunningJobsComponent } from './processing/running-jobs/component';
import { RunningJobsDatatableService } from './processing/running-jobs/datatable.service';
import { RunningJobsApiService } from './processing/running-jobs/api.service';
import { LogViewerComponent } from './common/log-viewer/component';
import { LogViewerApiService } from './common/log-viewer/api.service';
import { RecipeGraphComponent } from './common/recipe-graph/component';
import { ErrorDialsComponent } from './common/error-dials/component';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        JobsComponent,
        LogoComponent,
        DashboardComponent,
        SubnavComponent,
        RecipesComponent,
        JobTypesComponent,
        RecipeTypesComponent,
        StatusComponent,
        HealthbarComponent,
        JobDetailsComponent,
        RecipeDetailsComponent,
        JobTypesImportComponent,
        FooterComponent,
        JobtypeitemComponent,
        WorkspacesComponent,
        HistorychartComponent,
        SourcesComponent,
        SourceDetailsComponent,
        ProcessingformComponent,
        FailureRatesComponent,
        MetricsComponent,
        RunningJobsComponent,
        LogViewerComponent,
        RecipeGraphComponent,
        ErrorDialsComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        CodemirrorModule,
        NgxChartsDagModule,
        UtcDatepickerModule,
        // Prime NG
        AutoCompleteModule,
        CalendarModule,
        ChartModule,
        DataListModule,
        DataTableModule,
        DialogModule,
        DropdownModule,
        PaginatorModule,
        InputTextModule,
        InputTextareaModule,
        PanelModule,
        ButtonModule,
        SpinnerModule,
        ListboxModule,
        InputSwitchModule,
        StepsModule,
        MessagesModule,
        CheckboxModule,
        ChipsModule,
        AccordionModule,
        TooltipModule,
        MultiSelectModule,
        TreeTableModule
    ],
    exports: [
        DataTableModule,
        DropdownModule,
        PaginatorModule
    ],
    providers: [
        JobsApiService,
        JobsDatatableService,
        JobTypesApiService,
        RecipesApiService,
        RecipesDatatableService,
        ColorService,
        DashboardFavoritesService,
        RecipeTypesApiService,
        WorkspacesApiService,
        SourcesApiService,
        SourcesDatatableService,
        DataService,
        FailureRatesDatatableService,
        MetricsApiService,
        RunningJobsApiService,
        RunningJobsDatatableService,
        LogViewerApiService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
