import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router'; 
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service'; 
import { Profile } from 'selenium-webdriver/firefox';

@Component({
    selector: 'episode',
    templateUrl: './episode.component.html',
    styleUrls: ['./episode.component.css']
})
export class EpisodeComponent {

    reviewForm;

    constructor(private webService: WebService,
                private route: ActivatedRoute,
                private formBuilder: FormBuilder,
                private authService: AuthService) {

        this.reviewForm = formBuilder.group ({
            name: '',
            review: ['', Validators.required],
            rating: 5

        })
    }

    ngOnInit(){
        this.webService.getEpisode(this.route.snapshot.params.id);
        this.webService.getReviews(this.route.snapshot.params.id);

    }
    
    onSubmit() {
        this.webService.postReview(this.reviewForm.value);
        this.reviewForm.reset();
    }

    isInvalid(control) {
        return this.reviewForm.controls[control].invalid &&
               this.reviewForm.controls[control].touched;
    }

    isUntouched() {
        return this.reviewForm.controls.review.pristine;
    }

    isIncomplete() {
        return this.isInvalid('review') ||
               this.isUntouched();
    }

 }
