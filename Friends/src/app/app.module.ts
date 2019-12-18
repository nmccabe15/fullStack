import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EpisodesComponent } from './episodes.component';
import { WebService } from './web.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { EpisodeComponent } from './episode.component';
import { SeasonComponent } from './season.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service'; 
import { NavComponent } from './nav.component';
import { ProfileComponent } from './profile/profile.component';  
import { AuthGuard } from './auth.guard';

var routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'episodes',
    component: EpisodesComponent
  },
  {
    path: 'episodes/:id',
    component: EpisodeComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'season',
    component: SeasonComponent
  }
];

@NgModule({
  declarations: [
    AppComponent, EpisodesComponent, HomeComponent, EpisodeComponent, NavComponent, ProfileComponent, SeasonComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule, ReactiveFormsModule
  ],
  providers: [WebService, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
