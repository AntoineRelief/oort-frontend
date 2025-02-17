import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Http
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Env
import { environment } from '../environments/environment';

// Config
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';

// TRANSLATOR
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { OAuthModule, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { MessageService } from '@progress/kendo-angular-l10n';
import { KendoTranslationService } from '@safe/builder';

// Kendo datepicker for surveyjs
import {
  CalendarDOMService,
  CenturyViewService,
  DecadeViewService,
  HoursService,
  MinutesService,
  MonthViewService,
  TimePickerDOMService,
  TOUCH_ENABLED,
  YearViewService,
} from '@progress/kendo-angular-dateinputs';
import { PopupService } from '@progress/kendo-angular-popup';
import { ResizeBatchService } from '@progress/kendo-angular-common';
import { touchEnabled } from '@progress/kendo-common';
// Apollo / GraphQL
import { GraphQLModule } from './graphql.module';

/**
 * Initialize authentication in the platform.
 * Configuration in environment file.
 * Use oAuth
 *
 * @param oauth OAuth Service
 * @returns oAuth configuration
 */
const initializeAuth =
  (oauth: OAuthService): any =>
  () => {
    oauth.configure(environment.authConfig);
  };

/**
 * Sets up translator.
 *
 * @param http http client
 * @returns Translator.
 */
export const httpTranslateLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http);

/**
 * Main module of Front-Office project.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://localhost:9090/api'],
        sendAccessToken: true,
      },
    }),
    GraphQLModule,
  ],
  providers: [
    {
      provide: 'environment',
      useValue: environment,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
      deps: [OAuthService],
    },
    {
      provide: MessageService,
      useClass: KendoTranslationService,
    },
    {
      provide: OAuthStorage,
      useValue: localStorage,
    },
    // TODO: check
    {
      provide: TOUCH_ENABLED,
      useValue: [touchEnabled],
    },
    PopupService,
    ResizeBatchService,
    CalendarDOMService,
    TimePickerDOMService,
    MonthViewService,
    HoursService,
    MinutesService,
    YearViewService,
    DecadeViewService,
    CenturyViewService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
