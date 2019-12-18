import { Component } from "@angular/core";
import { WebService } from "./web.service";

@Component({
  selector: "season",
  templateUrl: "./season.component.html",
  styleUrls: []
})
export class SeasonComponent {
  constructor(private webService: WebService) {}

  ngOnInit(){
    this.searchBySeason(this.id);
}
  searchBySeason(id) {
    this.webService.getSeason(id);
  }
  id = 1;
}
