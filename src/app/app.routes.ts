import { Routes } from '@angular/router';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NewpostComponent } from './components/newpost/newpost.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ExploreComponent } from './components/explore/explore.component';
import { CommentComponent } from './components/comment/comment.component';
import { SearchComponent } from './components/search/search.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path:'sign-up', component:SignUpComponent},
    {path:'login', component:LoginComponent},
    {path:'new-post', component:NewpostComponent},
    {path:'profile', component: ProfileComponent},
    {path:'explore', component: ExploreComponent},
    {path:'settings', component: SettingsComponent},
    {path: 'search', component: SearchComponent}
];
