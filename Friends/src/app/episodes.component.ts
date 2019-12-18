import { Component } from '@angular/core';
import { WebService } from './web.service';

@Component({
    selector: 'episodes',
    templateUrl: './episodes.component.html',
    styleUrls: ['./episodes.component.css']
})
export class EpisodesComponent {

    constructor(private webService: WebService) {}

    ngOnInit(){
        if (sessionStorage.page) {
            this.page = sessionStorage.page;
        }
        this.webService.getEpisodes(this.page);
    }

    nextPage(){
        if (this.page < 10) {
            this.page = Number(this.page) + 1;
            sessionStorage.page = Number(this.page);
            this.webService.getEpisodes(this.page);
        }
    }

    previousPage(){
        if (this.page > 1) {
            this.page = Number(this.page) - 1;
            sessionStorage.page = Number(this.page);
            this.webService.getEpisodes(this.page);
        }
    }

    pageNumber(page){
        if (this.page > 1) {
            this.page = Number(page);
            sessionStorage.page = Number(this.page);
            this.webService.getEpisodes(page);
        }
    }
    episode_list;

    page = 1;
 }

