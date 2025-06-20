import { AppComponent } from './app.component';
import { CoreModule } from './app-modules/core/core.module';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpInterceptorService } from './app-modules/core/services/http-interceptor.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialModule } from './app-modules/core/material.module';
import { AppRoutingModule } from './app-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginComponent } from './app-modules/login/login.component';
import { ServiceComponent } from './app-modules/service/service.component';
import { ServicePointComponent } from './app-modules/service-point/service-point.component';
import { SetSecurityQuestionsComponent } from './app-modules/set-security-questions/set-security-questions.component';
import { SetPasswordComponent } from './app-modules/set-password/set-password.component';
import { TmLogoutComponent } from './app-modules/tm-logout/tm-logout.component';
import { ServicePointResolve } from './app-modules/service-point/service-point-resolve.service';
import { ServicePointService } from './app-modules/service-point/service-point.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResetPasswordComponent } from './app-modules/reset-password/reset-password.component';
import { RegistrarModule } from './app-modules/registrar/registrar.module';
import { NgFor } from '@angular/common';
import { AudioRecordingService } from './app-modules/nurse-doctor/shared/services/audio-recording.service';
import { SharedModule } from './app-modules/core/components/shared/shared.module';
import { RegistrarService } from 'Common-UI/src/registrar/services/registrar.service';
import { RegistrationModule } from 'Common-UI/src/registrar/registration.module';
import { CaptchaComponent } from './app-modules/captcha/captcha.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ServiceComponent,
    ServicePointComponent,
    SetSecurityQuestionsComponent,
    SetPasswordComponent,
    TmLogoutComponent,
    ResetPasswordComponent,
    CaptchaComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatListModule,
    MatTooltipModule,
    MatFormFieldModule,
    NgFor,
    CoreModule.forRoot(),
    BrowserAnimationsModule,
    SharedModule,
    RegistrationModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    HttpClient,
    ServicePointResolve,
    ServicePointService,
    AudioRecordingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    RegistrarService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
