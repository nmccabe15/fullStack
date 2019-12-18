import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; 
import { Subject } from 'rxjs';

@Injectable()
export class WebService {

    private episode_private_list;
    private episodesSubject = new Subject();
    episode_list = this.episodesSubject.asObservable();

    private episode_private;
    private episodeSubject = new Subject();
    episode = this.episodeSubject.asObservable();

    private reviews_private_list;
    private reviewsSubject = new Subject();
    reviews_list = this.reviewsSubject.asObservable();

    private season_private_list;
    private seasonSubject = new Subject();
    season_list = this.seasonSubject.asObservable();
    
    private search_ep_private_list;
    private search_ep_Subject = new Subject();
    search_ep_list = this.search_ep_Subject.asObservable();

    private search_eps_private_list;
    private search_eps_Subject = new Subject();
    search_eps_list = this.search_eps_Subject.asObservable();
    
    episodeID;

    constructor(private http: HttpClient) {}

    getEpisodes(page) {
        return this.http.get('http://localhost:5000/api/v1.0/episodes?pn=' + page)
            .subscribe(response => {
                this.episode_private_list = response;
                this.episodesSubject.next(this.episode_private_list);
            })
    }
    getEpisode(id) {
        return this.http.get('http://localhost:5000/api/v1.0/episodes/' + id)
            .subscribe(response => {
                this.episode_private = [response];
                this.episodeSubject.next(this.episode_private);
                this.episodeID = id; 
            })
    }
    getReviews(id) {
        return this.http.get('http://localhost:5000/api/v1.0/episodes/' + id + '/reviews')
            .subscribe(response => {
                this.reviews_private_list = response;
                this.reviewsSubject.next(this.reviews_private_list);
            })
    }

    postReview(incomingReview){
        let postData = new FormData();
        postData.append("username", incomingReview.name);
        postData.append("comment", incomingReview.review);
        postData.append("rating", incomingReview.rating);

        this.http.post('http://localhost:5000/api/v1.0/episodes/'+
                        this.episodeID + '/reviews',
                        postData). subscribe(
                            response => {
                                this.getReviews(this.episodeID);
                            }
                        )
    }

    getSeason(id) {
        return this.http.get('http://localhost:5000/api/v1.0/episodes/season/' + id)
            .subscribe(response => {
                this.season_private_list = response;
                this.seasonSubject.next(this.season_private_list);
            })
    }

    searchEpisode(season,number){
        return this.http.get('http://localhost:5000/api/v1.0/episodes/search/' + season + '/' + number)
            .subscribe(response => {
                this.search_ep_private_list = response;
                this.search_ep_Subject.next(this.search_ep_private_list);
            })
    }

    searchEpisodes(number){
        return this.http.get('http://localhost:5000/api/v1.0/episodes/search/' + number)
            .subscribe(response => {
                this.search_eps_private_list = response;
                this.search_eps_Subject.next(this.search_eps_private_list);
            })
    }
}