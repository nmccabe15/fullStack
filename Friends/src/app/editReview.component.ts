import { Component } from "@angular/core";
import { WebService } from "./web.service";
import { ActivatedRoute } from '@angular/router'; 
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service'; 

@Component({
  selector: "editReview",
  templateUrl: "./editReview.component.html",
  styleUrls: []
})
export class EditReviewComponent {


    reviewForm;
    constructor(private webService: WebService,
                private route: ActivatedRoute,
                private formBuilder: FormBuilder,
                private authService: AuthService){


                    this.reviewForm = formBuilder.group ({
                        name: '',
                        review: ['', Validators.required],
                        rating: 5
            
                    })
                }

  ngOnInit(){
}

onSubmit() {
    this.webService.editReview(this.reviewForm.value, this.route.snapshot.params.rid);
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

rid = this.route.snapshot.params.rid;
id = this.route.snapshot.params.id;
}
