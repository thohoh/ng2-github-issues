import { Component } from '@angular/core';

import { SearchBoxComponent } from './search-box/search-box.component';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { ResultsPerPageControl } from './page-limit-control/page-limit-control.component';

import {
    GithubDataService,
    IIssuesResponse,
    IIssuesSearchData
} from 'common/services';

import {
    NotificationComponent,
    INotification,
    Notification,
    SpinnerComponent
} from 'common/components';

@Component({
    selector: 'github-issues',
    template: `
    <div class="app-container">
        <search-box
            (searchDataChanged)="onSearchDataChanged($event)"
            (searchSubmitted)="onSearchSubmitted()">
        </search-box>
        
        <results-per-page-control
           (valueChange)="onResultsPerPageChanged($event)">
        </results-per-page-control>
        
        <notification [notification]="error"></notification>
        
        <spinner *ngIf="loading && !results"></spinner>
        
        <search-results
            *ngIf="results"
            [results]="results"
            (pageSelected)="onPageSelected($event)">
        </search-results>
    </div>
    `,
    directives: [
        SearchBoxComponent,
        IssuesListComponent,
        ResultsPerPageControl,
        SpinnerComponent,
        NotificationComponent
    ],
    styles: [
        `
    .app-container {
        padding: 0 10px;
    }
    
    search-box,
    results-per-page-control,
    spinner {
        border: 1px solid transparent;
        margin-bottom: 20px;
    }
    
    `
    ]
})
export class RepositoryComponent {
    constructor(private issuesService: GithubDataService) {
        this.loading = false;
    }

    protected onSearchDataChanged(value: IIssuesSearchData): void {
        this.searchData = value;
    }

    protected onResultsPerPageChanged(value: number): void {
        this.resultsPerPage = value;
    }

    protected searchForData(pageNumber?: number): void {
        this.loading = true;

        this.issuesService.getIssues(this.searchData, this.resultsPerPage, pageNumber)
            .subscribe(
                data => {
                    this.loading = false;
                    this.results = data;
                },
                error => {
                    this.loading = false;
                    this.results = undefined;
                    this.showError(`Can't load issues for specified fields`, error.stack);
                }
            );
    }

    protected onSearchSubmitted(): void {
        this.loading = true;
        this.searchForData();
    }

    protected onPageSelected(pageNum: number): void {
        this.searchForData(pageNum);
    }

    protected showError(message: string, stack: string): void {
        this.error = new Notification('error', message + `\n\n ${stack}`);
    }

    private error: INotification;
    private searchData: IIssuesSearchData;
    private resultsPerPage: number;
    private results: IIssuesResponse;
    private loading: boolean;
}