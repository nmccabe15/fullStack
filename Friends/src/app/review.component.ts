import { Component } from "@angular/core";
import { WebService } from "./web.service";
import { ActivatedRoute } from '@angular/router'; 
import { AuthService } from './auth.service'; 

@Component({
  selector: "review",
  templateUrl: "./review.component.html",
  styleUrls: []
})
export class ReviewComponent {

    constructor(private webService: WebService,
                private route: ActivatedRoute,
                private authService: AuthService){
                }

  ngOnInit(rid){
    this.webService.getOneReview(this.route.snapshot.params.id, this.route.snapshot.params.rid);
}

deleteReview(){

    this.webService.deleteReview(this.route.snapshot.params.id, this.route.snapshot.params.rid);

}

id = this.route.snapshot.params.id;

}
