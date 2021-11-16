import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';

import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { AlertComponent } from './alert/alert.component'

import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { UserslistComponent } from './userslist/userslist.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { NetworkComponent } from './network/network.component';
import { SettingsComponent } from './settings/settings.component';
import { FriendsComponent } from './friends/friends.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    AlertComponent,
    UserslistComponent,
    ForgotpasswordComponent,
    NetworkComponent,
    SettingsComponent,
    FriendsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
