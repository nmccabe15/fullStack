import { Component } from '@angular/core';
import { AuthService } from './auth.service'; 
import { WebService } from "./web.service";
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']

})
export class HomeComponent {

    reviewForm;

    constructor(private authService: AuthService,
                private webService: WebService,
                private formBuilder: FormBuilder,) {

                    this.reviewForm = formBuilder.group ({
                        season: ['', Validators.required],
                        number: ['', Validators.required]
                    })
                }


    onSubmit() {
        this.webService.searchEpisode(this.reviewForm.value.season, this.reviewForm.value.number);
    }

    isInvalid(control) {
        return this.reviewForm.controls[control].invalid &&
               this.reviewForm.controls[control].touched;
    }

    isUntouched() {
        return this.reviewForm.controls.season.pristine ||
               this.reviewForm.controls.number.pristine;
    }
    isIncomplete() {
        return this.isInvalid('season') ||
               this.isInvalid('number') ||
               this.isUntouched();
    }
 }