import { Routes } from '@angular/router';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NewpostComponent } from './components/newpost/newpost.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path:'sign-up', component:SignUpComponent},
    {path:'login', component:LoginComponent},
    {path: 'new-post', component:NewpostComponent}
];
